import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Home as HomeIcon,
  MapPin,
  Search,
  Navigation,
  Clock,
  ChevronDown,
  Mic,
  MicOff,
  Loader,
  Star,
  CheckCircle,
  Zap,
  Calendar,
  MapPinIcon,
  Shield
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { getDynamicFareExplanation, buildPricingRequest } from '../../services/dynamicFareApi';
import { customerAPI, appRideAPI } from '../../services/api';
import { useLocationStore } from '../../store/locationStore';

const CustomerHome = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleSelection, setShowVehicleSelection] = useState(false);
  const [estimatedFares, setEstimatedFares] = useState({})
  const [fareExplanations, setFareExplanations] = useState({});
  const [showFareExplanation, setShowFareExplanation] = useState(false);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarkerRef = useRef(null);
  const setGlobalPickupLocation = useLocationStore((state) => state.setPickupLocation);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Mapbox access token
  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidmFtc2kyOTI5IiwiYSI6ImNtZGVxcGI3NTA0azIya3IxNjgwNDU1NTMifQ.m8MGXkFHTO7RyDmmBuoorA';

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation && mapContainer.current && !map.current) {
      initializeMap();
    } else if (currentLocation && map.current) {
      map.current.flyTo({ center: [currentLocation.longitude, currentLocation.latitude], zoom: 15 });
      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([currentLocation.longitude, currentLocation.latitude]);
      }
    }
  }, [currentLocation]);

  // Geocoding suggestions
  const fetchSuggestions = async (query, setSuggestions) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=in&limit=5&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.features || []);
      }
    } catch (e) {
      console.error('Error fetching suggestions', e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(pickup, setPickupSuggestions), 300);
    return () => clearTimeout(timer);
  }, [pickup]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(destination, setDestinationSuggestions), 300);
    return () => clearTimeout(timer);
  }, [destination]);

  const handleSelectPickup = (suggestion) => {
    setPickup(suggestion.place_name);
    setPickupCoords({ lng: suggestion.center[0], lat: suggestion.center[1] });
    setPickupSuggestions([]);
    setShowPickupSuggestions(false);
    if (map.current) {
      map.current.flyTo({ center: [suggestion.center[0], suggestion.center[1]], zoom: 15 });
    }
  };

  const handleSelectDestination = (suggestion) => {
    setDestination(suggestion.place_name);
    setDropCoords({ lng: suggestion.center[0], lat: suggestion.center[1] });
    setDestinationSuggestions([]);
    setShowDestinationSuggestions(false);
    if (map.current) {
      map.current.flyTo({ center: [suggestion.center[0], suggestion.center[1]], zoom: 15 });
    }
  };

  const initializeMap = () => {
    if (!currentLocation || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [currentLocation.longitude, currentLocation.latitude],
      zoom: 15,
      trackResize: true,
      // Completely disable Mapbox telemetry and analytics
      collectResourceTiming: false,
      fadeDuration: 0,
      crossSourceCollisions: false
    });

    // Wait for map to load before adding markers and controls
    map.current.on('load', () => {
      console.log('Map loaded successfully');

      // Resize map to ensure it fits the container properly
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 100);

      // Add current location marker with custom class for identification
      userMarkerRef.current = new mapboxgl.Marker({ color: '#3B82F6' })
        .setLngLat([currentLocation.longitude, currentLocation.latitude])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'));

      // Add class to identify user location marker
      const userMarkerElement = userMarkerRef.current.getElement();
      userMarkerElement.classList.add('user-location');

      userMarkerRef.current.addTo(map.current);
    });

    // Add map controls
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }));

    // Handle map errors
    map.current.on('error', (e) => {
      console.error('Map error:', e.error);
    });
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setGlobalPickupLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "Current Location"
          });
          setLocationLoading(false);
          // Reverse geocode the coordinates to get address
          if (pickup === '') {
            reverseGeocode(position.coords.latitude, position.coords.longitude);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to central India
          setCurrentLocation({
            latitude: 20.5937,
            longitude: 78.9629
          });
          setLocationLoading(false);
        }
      );
    } else {
      // Default location India
      setCurrentLocation({
        latitude: 20.5937,
        longitude: 78.9629
      });
      setLocationLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const reverseGeocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
      console.log(`Reverse geocoding coordinates: ${lat}, ${lng}`);

      const response = await fetch(reverseGeocodeUrl);

      if (response.ok) {
        const data = await response.json();
        console.log('Reverse geocoding response:', data);

        if (data.features && data.features.length > 0) {
          const address = data.features[0].place_name;
          console.log('Reverse geocoded address:', address);
          setPickup(address);
          setGlobalPickupLocation({
            lat,
            lng,
            name: address
          });
        } else {
          console.error('No reverse geocoding results found');
        }
      } else {
        console.error('Reverse geocoding API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      reverseGeocode(currentLocation.latitude, currentLocation.longitude);
    } else {
      getCurrentLocation();
    }
  };

  // Calculate fare based on distance and vehicle type
  const calculateFare = (distance, vehicleType) => {
    const vehicle = vehicleTypes.find(v => v.id === vehicleType);
    if (!vehicle || !distance) return 0;

    const fare = vehicle.baseFare + (distance * vehicle.perKm);
    return Math.round(fare);
  };

  // Get distance and duration using Mapbox Directions API
  const getDistanceAndFares = async (pickup, destination) => {
    try {
      // Geocode pickup and destination
      const pickupCoords = await geocodeAddress(pickup);
      const destCoords = await geocodeAddress(destination);

      if (!pickupCoords || !destCoords) {
        console.error('Failed to geocode addresses');
        setIsLoading(false);
        return;
      }

      console.log('Pickup coords:', pickupCoords);
      console.log('Destination coords:', destCoords);

      // Calculate straight-line distance to validate before API call
      const straightLineDistance = Math.sqrt(
        Math.pow((destCoords.lng - pickupCoords.lng) * 111, 2) +
        Math.pow((destCoords.lat - pickupCoords.lat) * 111, 2)
      );

      console.log('Straight-line distance:', straightLineDistance.toFixed(2), 'km');

      // Check for same location
      if (straightLineDistance < 0.1) {
        alert('Pickup and destination are too close. Please select different locations.');
        setIsLoading(false);
        return;
      }

      // Get directions from Mapbox (pickup first, then destination)
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords.lng},${pickupCoords.lat};${destCoords.lng},${destCoords.lat}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;

      console.log('Fetching directions from:', directionsUrl);

      const response = await fetch(directionsUrl);

      if (response.ok) {
        const data = await response.json();
        console.log('Directions response:', data);

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = route.distance / 1000; // Convert to km
          const durationMin = route.duration / 60; // Convert to minutes

          console.log(`Distance: ${distanceKm.toFixed(2)} km, Duration: ${durationMin.toFixed(1)} min`);

          setDistance(distanceKm);
          setDuration(durationMin);
          setPickupCoords(pickupCoords);
          setDropCoords(destCoords);

          // Calculate dynamic fares for all vehicle types using Dynamic-Fare API
          const fares = {};
          const explanations = {};

          // Call Dynamic Fare API for each vehicle type
          for (const vehicle of vehicleTypes) {
            try {
              // Build pricing request for Dynamic-Fare API
              const pricingRequest = buildPricingRequest({
                vehicleType: vehicle.id,
                distanceKm: distanceKm,
                timeMinutes: durationMin,
                baseFare: vehicle.baseFare,
                perKmRate: vehicle.perKm,
                perMinuteRate: vehicle.perKm / 10, // Approximate per-minute rate
                surgeMultiplier: 1.0, // Can be dynamic based on demand
                demandSupplyRatio: 1.0,
                city: 'Hyderabad',
                pickupLat: pickupCoords.lat,
                pickupLng: pickupCoords.lng,
                dropLat: destCoords.lat,
                dropLng: destCoords.lng
              });

              console.log(`🚀 Calling Dynamic Fare API for ${vehicle.name}:`, pricingRequest);

              // Get dynamic fare with explanation
              const dynamicResult = await getDynamicFareExplanation(pricingRequest);

              console.log(`✅ Dynamic Fare result for ${vehicle.name}:`, dynamicResult);

              // Store the adjusted price and explanation
              fares[vehicle.id] = Math.round(dynamicResult.adjusted_price || calculateFare(distanceKm, vehicle.id));
              explanations[vehicle.id] = {
                explanation: dynamicResult.explanation || 'Standard fare calculation',
                traffic_info: dynamicResult.traffic_info,
                weather_info: dynamicResult.weather_info,
                retrieved_policies: dynamicResult.retrieved_policies
              };
            } catch (error) {
              console.error(`❌ Error getting dynamic fare for ${vehicle.name}:`, error);
              // Fallback to basic calculation
              fares[vehicle.id] = calculateFare(distanceKm, vehicle.id);
              explanations[vehicle.id] = {
                explanation: 'Standard fare calculation (dynamic pricing temporarily unavailable)',
                traffic_info: null,
                weather_info: null,
                retrieved_policies: []
              };
            }
          }

          setEstimatedFares(fares);
          setFareExplanations(explanations);

          // Draw route on map if map is initialized
          if (map.current && map.current.isStyleLoaded()) {
            try {
              // Remove existing route layer and source if they exist
              if (map.current.getLayer('route')) {
                map.current.removeLayer('route');
              }
              if (map.current.getSource('route')) {
                map.current.removeSource('route');
              }

              // Remove existing markers
              const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
              existingMarkers.forEach(marker => {
                if (!marker.classList.contains('user-location')) {
                  marker.remove();
                }
              });

              // Add new route source and layer
              map.current.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: route.geometry
                }
              });

              map.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#3B82F6',
                  'line-width': 6,
                  'line-opacity': 0.8
                }
              });

              // Add markers for pickup and destination
              new mapboxgl.Marker({ color: '#10B981' })
                .setLngLat([pickupCoords.lng, pickupCoords.lat])
                .setPopup(new mapboxgl.Popup().setHTML('<h3>Pickup Location</h3>'))
                .addTo(map.current);

              new mapboxgl.Marker({ color: '#EF4444' })
                .setLngLat([destCoords.lng, destCoords.lat])
                .setPopup(new mapboxgl.Popup().setHTML('<h3>Destination</h3>'))
                .addTo(map.current);

              // Fit map bounds to show the route
              const coordinates = route.geometry.coordinates;
              const bounds = coordinates.reduce((bounds, coord) => {
                return bounds.extend(coord);
              }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

              map.current.fitBounds(bounds, {
                padding: 100,
                maxZoom: 15
              });

              console.log('Route drawn successfully on map');
            } catch (mapError) {
              console.error('Error drawing route on map:', mapError);
            }
          } else {
            console.log('Map not ready for route drawing');
          }
        } else {
          console.error('No routes found in response');
          alert('Could not find a route between these locations. Please try different addresses.');
        }
      } else {
        console.error('Directions API error:', response.status);
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);

          if (errorData.code === 'InvalidInput') {
            alert('Invalid route requested. Please ensure both locations are accessible by road.');
          } else {
            alert('Could not calculate route. Please try different locations.');
          }
        } catch (e) {
          alert('Error calculating route. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      alert('Network error. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Geocode address to coordinates
  const geocodeAddress = async (address) => {
    try {
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=in&limit=1&access_token=${MAPBOX_ACCESS_TOKEN}`;

      console.log(`Geocoding address: "${address}"`);

      const response = await fetch(geocodeUrl);

      if (response.ok) {
        const data = await response.json();
        console.log('Geocoding response for', address, ':', data);

        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          console.log(`Geocoded "${address}" to:`, { lat, lng });
          return { lat, lng };
        } else {
          console.error(`No geocoding results found for address: "${address}"`);
          alert(`Could not find location: "${address}". Please try a more specific address in Bangalore.`);
        }
      } else {
        console.error('Geocoding API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Geocoding error details:', errorText);
        alert('Error finding location. Please try again.');
      }
    } catch (error) {
      console.error('Error geocoding:', error);
      alert('Error finding location. Please check your internet connection.');
    }
    return null;
  };

  // Voice Recording Functions for AI Integration
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setVoiceLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Send to voice AI companion backend
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        try {
          // Voice AI Python service was removed, so we gracefully degrade
          alert('Voice AI service is currently unavailable. Please type your location.');
          setVoiceLoading(false);
          return;

          /* Legacy Voice AI Python code:
          const response = await fetch('http://localhost:8004/transcribe', {
            method: 'POST',
            body: formData,
          });
  
          const result = await response.json();
  
          if (result.error) {
            alert('Error processing voice: ' + JSON.stringify(result.error));
            setVoiceLoading(false);
            return;
          }
          ...
          */

          // Extract ride details from the response
          const rideDetails = result.ride_details || {};

          // Auto-fill the form fields
          let voicePickup = pickup;
          let voiceDestination = destination;

          if (rideDetails.source) {
            setPickup(rideDetails.source);
            voicePickup = rideDetails.source;
          }
          if (rideDetails.destination) {
            setDestination(rideDetails.destination);
            voiceDestination = rideDetails.destination;
          }

          // Map ride_type to vehicle selection if needed
          if (rideDetails.ride_type) {
            const vehicleMap = {
              'bike': vehicleTypes.find(v => v.id === 'bike'),
              'auto': vehicleTypes.find(v => v.id === 'auto'),
              'cab': vehicleTypes.find(v => v.id === 'car')
            };
            const mappedVehicle = vehicleMap[rideDetails.ride_type.toLowerCase()];
            if (mappedVehicle) {
              setSelectedVehicle(mappedVehicle);
            }
          }

          setVoiceLoading(false);

          // Automatically trigger distance calculation if both pickup and destination are provided
          if (voicePickup && voiceDestination) {
            setTimeout(async () => {
              setIsLoading(true);
              await getDistanceAndFares(voicePickup, voiceDestination);
              setShowVehicleSelection(true);
              setIsLoading(false);
            }, 500); // Small delay to ensure state updates
          }
        } catch (error) {
          console.error('Error sending audio to voice AI:', error);
          alert('Failed to process voice. Please try again.');
          setVoiceLoading(false);
        }

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };


  // Handle initial ride search (show vehicle options)
  const handleSearchRides = async () => {
    if (!pickup.trim() || !destination.trim()) {
      alert('Please enter both pickup and drop locations');
      return;
    }

    setIsLoading(true);
    await getDistanceAndFares(pickup, destination);
    setShowVehicleSelection(true);
    setIsLoading(false);
  };

  const handleBookRide = async () => {
    if (!selectedVehicle) {
      alert('Please select a vehicle type');
      return;
    }

    // Add validation for distance and duration
    if (!distance || distance === 0) {
      alert('⚠️ Distance not calculated yet. Please wait for the route calculation to complete.');
      console.error('❌ Cannot book ride - distance is:', distance);
      return;
    }

    if (!duration || duration === 0) {
      alert('⚠️ Duration not calculated yet. Please wait for the route calculation to complete.');
      console.error('❌ Cannot book ride - duration is:', duration);
      return;
    }

    setIsLoading(true);
    setBookingStatus('searching');

    try {
      // Debug: Log current state values before booking
      console.log('🔍 Pre-booking state check:');
      console.log('  - distance:', distance, 'km');
      console.log('  - duration:', duration, 'min');
      console.log('  - selectedVehicle:', selectedVehicle);
      console.log('  - estimatedFares:', estimatedFares);
      console.log('  - estimatedFares[selectedVehicle.id]:', estimatedFares[selectedVehicle.id]);
      console.log('  - pickupCoords:', pickupCoords);
      console.log('  - dropCoords:', dropCoords);

      // Use the dynamic fare from the Dynamic-Fare API
      const dynamicFare = estimatedFares[selectedVehicle.id] || 0;
      console.log('💰 Dynamic fare to be sent:', dynamicFare);

      // Call the backend API to create a ride
      const rideData = {
        pickup_location: {
          address: pickup,
          latitude: pickupCoords ? pickupCoords.lat : 0,
          longitude: pickupCoords ? pickupCoords.lng : 0
        },
        dropoff_location: {
          address: destination,
          latitude: dropCoords ? dropCoords.lat : 0,
          longitude: dropCoords ? dropCoords.lng : 0
        },
        rideType: selectedVehicle.id,
        fare: dynamicFare,
        distance_km: parseFloat(distance) || 0,
        estimated_duration_min: parseFloat(duration) || 0
      };

      console.log('📤 Creating ride with data:', JSON.stringify(rideData, null, 2));

      try {
        // Let's call the unified `/request` endpoint which generates the DB entry and finds available drivers natively!
        const createResponse = await appRideAPI.searchDrivers(rideData);
        const newRide = createResponse.data.data;

        console.log('✅ Ride created successfully in MongoDB:', newRide);
        console.log('✅ Ride fare from backend:', newRide.fare || newRide.estimated_fare);

        const dynamicFare = estimatedFares[selectedVehicle.id] || 0;

        const finalRideData = {
          ...newRide,
          status: 'searching_driver',
          distance_km: distance || 0,
          estimated_duration_min: duration || 0,
          fare: dynamicFare, // Ensure fare is set
          estimated_fare: dynamicFare // Ensure estimated_fare is set
        };

        console.log('💰 Final fare value:', finalRideData.fare, finalRideData.estimated_fare);
        setActiveRide(finalRideData);

        startRideStatusPolling(newRide.id);
      } catch (apiError) {
        console.error('⚠️ API call failed to create a ride:', apiError);
        alert('Failed to book ride. Please try again later.');
        return;
      }

      setBookingStatus('driver_search');

    } catch (error) {
      console.error('Booking failed:', error);
      setBookingStatus('error');
      alert('Failed to book ride. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to destination using Google Maps
  const handleNavigateToDestination = () => {
    if (!activeRide) return;

    // Use ride coordinates from backend, falling back to locally computed coords
    const pickupLat = activeRide.pickupLat || activeRide.pickup_location?.latitude || (pickupCoords ? pickupCoords.lat : 0);
    const pickupLng = activeRide.pickupLng || activeRide.pickup_location?.longitude || (pickupCoords ? pickupCoords.lng : 0);
    const dropLat = activeRide.dropLat || activeRide.dropoff_location?.latitude || (dropCoords ? dropCoords.lat : 0);
    const dropLng = activeRide.dropLng || activeRide.dropoff_location?.longitude || (dropCoords ? dropCoords.lng : 0);

    // Correct Google Maps Directions URL format: origin to destination
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${pickupLat},${pickupLng}&destination=${dropLat},${dropLng}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  // Poll for ride status updates to detect when driver accepts
  const startRideStatusPolling = (rideId) => {
    if (window.rideStatusPolling) {
      clearInterval(window.rideStatusPolling);
    }

    window.rideStatusPolling = setInterval(async () => {
      try {
        const response = await customerAPI.getRideById(rideId);
        const updatedRide = response.data.data;
        const normalizedStatus = updatedRide.status?.toUpperCase();
        console.log('📡 Ride status update:', normalizedStatus);

        if (normalizedStatus === 'ACCEPTED') {
          // Driver accepted! Preserve booking data when updating
          const finalRide = {
            ...updatedRide,
            distance_km: distance || updatedRide.distance_km || 0,
            estimated_duration_min: duration || updatedRide.estimated_duration_min || 0,
            estimated_fare: estimatedFares[selectedVehicle?.id] || updatedRide.estimated_fare || 0
          };
          console.log('🎉 Driver assigned! Final ride data:', finalRide);
          console.log('🔑 OTP received:', finalRide.otp);
          setActiveRide(finalRide);
          setBookingStatus('driver_assigned');
          clearInterval(window.rideStatusPolling);
        } else if (normalizedStatus !== activeRide?.status?.toUpperCase()) {
          // Preserve booking data when updating
          const finalRide = {
            ...updatedRide,
            distance_km: distance || updatedRide.distance_km || 0,
            estimated_duration_min: duration || updatedRide.estimated_duration_min || 0,
            estimated_fare: estimatedFares[selectedVehicle?.id] || updatedRide.estimated_fare || 0
          };
          setActiveRide(finalRide);
        }
      } catch (error) {
        console.error('Error polling ride status:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      if (window.rideStatusPolling) {
        clearInterval(window.rideStatusPolling);
      }
    }, 300000);
  };

  // Isometric 3D vehicle icons matching ride-hailing app style
  const VehicleIcons = {
    bike: (
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 80 80" className="w-12 h-12" fill="none">
          <defs>
            <filter id="isometricShadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Bike shadow */}
          <ellipse cx="40" cy="72" rx="32" ry="6" fill="#000" opacity="0.08" />

          {/* Rear wheel */}
          <circle cx="22" cy="60" r="12" fill="#2C3E50" />
          <circle cx="22" cy="60" r="10" fill="#34495E" />
          <circle cx="22" cy="60" r="7" fill="#95A5A6" />
          <circle cx="22" cy="60" r="3" fill="#ECF0F1" />

          {/* Front wheel */}
          <circle cx="58" cy="60" r="12" fill="#2C3E50" />
          <circle cx="58" cy="60" r="10" fill="#34495E" />
          <circle cx="58" cy="60" r="7" fill="#95A5A6" />
          <circle cx="58" cy="60" r="3" fill="#ECF0F1" />

          {/* Bike frame - main body */}
          <path d="M22 60 L35 45 L50 45 L58 60" stroke="#E74C3C" strokeWidth="4" fill="none" />
          <path d="M35 45 L40 30 L55 30" stroke="#E74C3C" strokeWidth="4" fill="none" />
          <path d="M40 30 L38 42" stroke="#E74C3C" strokeWidth="3" fill="none" />

          {/* Seat */}
          <rect x="35" y="40" width="12" height="4" rx="2" fill="#2C3E50" />

          {/* Handlebars */}
          <rect x="53" y="28" width="8" height="3" rx="1.5" fill="#34495E" />

          {/* Tank/body */}
          <rect x="38" y="42" width="14" height="8" rx="4" fill="#F39C12" />
          <rect x="40" y="44" width="10" height="4" rx="2" fill="#E67E22" />

          {/* Engine block */}
          <rect x="30" y="50" width="8" height="6" rx="2" fill="#7F8C8D" filter="url(#isometricShadow)" />
        </svg>
      </div>
    ),
    auto: (
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 80 80" className="w-12 h-12" fill="none">
          <defs>
            <filter id="isometricShadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Auto shadow */}
          <ellipse cx="40" cy="72" rx="35" ry="7" fill="#000" opacity="0.08" />

          {/* Wheels */}
          <circle cx="20" cy="65" r="10" fill="#2C3E50" />
          <circle cx="20" cy="65" r="8" fill="#34495E" />
          <circle cx="20" cy="65" r="4" fill="#95A5A6" />

          <circle cx="60" cy="65" r="10" fill="#2C3E50" />
          <circle cx="60" cy="65" r="8" fill="#34495E" />
          <circle cx="60" cy="65" r="4" fill="#95A5A6" />

          {/* Main auto body */}
          <path d="M10 55 L10 45 Q10 40 15 40 L65 40 Q70 40 70 45 L70 55 Q70 60 65 60 L15 60 Q10 60 10 55 Z" fill="#27AE60" filter="url(#isometricShadow)" />

          {/* Auto roof/canopy */}
          <path d="M15 40 Q15 25 25 20 L55 20 Q65 25 65 40" fill="#F1C40F" />
          <path d="M17 38 Q17 27 25 23 L55 23 Q63 27 63 38" fill="#F39C12" />

          {/* Windows */}
          <rect x="20" y="25" width="40" height="18" rx="8" fill="#85C1E9" opacity="0.7" />
          <rect x="22" y="27" width="36" height="14" rx="6" fill="#AED6F1" opacity="0.5" />

          {/* Window dividers */}
          <line x1="32" y1="27" x2="32" y2="41" stroke="#5DADE2" strokeWidth="1.5" />
          <line x1="48" y1="27" x2="48" y2="41" stroke="#5DADE2" strokeWidth="1.5" />

          {/* Driver area highlight */}
          <rect x="50" y="37" width="18" height="8" rx="4" fill="#2ECC71" />

          {/* Side details */}
          <rect x="12" y="48" width="56" height="3" rx="1.5" fill="#229954" />
          <circle cx="25" cy="49" r="1.5" fill="#F4D03F" />
          <circle cx="55" cy="49" r="1.5" fill="#F4D03F" />
        </svg>
      </div>
    ),
    car: (
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 80 80" className="w-12 h-12" fill="none">
          <defs>
            <filter id="isometricShadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Car shadow */}
          <ellipse cx="40" cy="72" rx="36" ry="7" fill="#000" opacity="0.08" />

          {/* Wheels */}
          <circle cx="18" cy="64" r="11" fill="#2C3E50" />
          <circle cx="18" cy="64" r="9" fill="#34495E" />
          <circle cx="18" cy="64" r="5" fill="#95A5A6" />
          <circle cx="18" cy="64" r="2" fill="#ECF0F1" />

          <circle cx="62" cy="64" r="11" fill="#2C3E50" />
          <circle cx="62" cy="64" r="9" fill="#34495E" />
          <circle cx="62" cy="64" r="5" fill="#95A5A6" />
          <circle cx="62" cy="64" r="2" fill="#ECF0F1" />

          {/* Main car body */}
          <path d="M8 50 L8 42 Q8 38 12 38 L68 38 Q72 38 72 42 L72 50 Q72 54 68 54 L12 54 Q8 54 8 50 Z" fill="#ECF0F1" filter="url(#isometricShadow)" />

          {/* Car roof */}
          <path d="M18 38 Q18 25 28 20 L52 20 Q62 25 62 38" fill="#D5DBDB" />

          {/* Windows */}
          <rect x="22" y="24" width="36" height="18" rx="8" fill="#85C1E9" opacity="0.8" />
          <rect x="24" y="26" width="32" height="14" rx="6" fill="#AED6F1" opacity="0.6" />

          {/* Window frame */}
          <line x1="40" y1="26" x2="40" y2="40" stroke="#5DADE2" strokeWidth="2" />

          {/* Headlights */}
          <circle cx="72" cy="45" r="3" fill="#F4D03F" />
          <circle cx="8" cy="45" r="3" fill="#F4D03F" />

          {/* Side details */}
          <rect x="12" y="46" width="56" height="2" rx="1" fill="#F39C12" />
          <rect x="12" y="44" width="56" height="1" rx="0.5" fill="#E67E22" />

          {/* Door handles */}
          <rect x="28" y="43" width="3" height="1" rx="0.5" fill="#BDC3C7" />
          <rect x="49" y="43" width="3" height="1" rx="0.5" fill="#BDC3C7" />
        </svg>
      </div>
    ),
    premium: (
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 80 80" className="w-12 h-12" fill="none">
          <defs>
            <filter id="isometricShadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Premium car shadow */}
          <ellipse cx="40" cy="72" rx="38" ry="8" fill="#000" opacity="0.1" />

          {/* Wheels - premium alloy */}
          <circle cx="16" cy="64" r="12" fill="#2C3E50" />
          <circle cx="16" cy="64" r="10" fill="#34495E" />
          <circle cx="16" cy="64" r="6" fill="#E8E8E8" />
          <circle cx="16" cy="64" r="3" fill="#F8F9FA" />
          <circle cx="16" cy="64" r="1" fill="#F39C12" />

          <circle cx="64" cy="64" r="12" fill="#2C3E50" />
          <circle cx="64" cy="64" r="10" fill="#34495E" />
          <circle cx="64" cy="64" r="6" fill="#E8E8E8" />
          <circle cx="64" cy="64" r="3" fill="#F8F9FA" />
          <circle cx="64" cy="64" r="1" fill="#F39C12" />

          {/* Main luxury car body */}
          <path d="M6 50 L6 42 Q6 38 10 38 L70 38 Q74 38 74 42 L74 50 Q74 54 70 54 L10 54 Q6 54 6 50 Z" fill="#F8F9FA" filter="url(#isometricShadow)" />

          {/* Luxury car roof */}
          <path d="M16 38 Q16 24 28 18 L52 18 Q64 24 64 38" fill="#E9ECEF" />

          {/* Tinted windows */}
          <rect x="20" y="22" width="40" height="20" rx="9" fill="#1A1A2E" opacity="0.9" />
          <rect x="22" y="24" width="36" height="16" rx="7" fill="#16213E" opacity="0.7" />

          {/* Window frame - chrome */}
          <line x1="40" y1="24" x2="40" y2="40" stroke="#C0C0C0" strokeWidth="2" />

          {/* Premium headlights */}
          <ellipse cx="74" cy="45" rx="4" ry="2.5" fill="#FFF9C4" />
          <ellipse cx="6" cy="45" rx="4" ry="2.5" fill="#FFF9C4" />

          {/* Luxury accents */}
          <rect x="10" y="46" width="60" height="2" rx="1" fill="#F39C12" />
          <rect x="10" y="44" width="60" height="1" rx="0.5" fill="#E67E22" />

          {/* Premium badge/star */}
          <circle cx="40" cy="26" r="4" fill="#F39C12" />
          <circle cx="40" cy="26" r="3" fill="#E67E22" />
          <polygon points="40,23 41.5,27.5 40,29 38.5,27.5" fill="#FFF" />

          {/* Chrome door handles */}
          <rect x="26" y="43" width="4" height="1.5" rx="0.75" fill="#E8E8E8" />
          <rect x="50" y="43" width="4" height="1.5" rx="0.75" fill="#E8E8E8" />
        </svg>
      </div>
    )
  };

  // Vehicle types with base pricing
  const vehicleTypes = [
    {
      id: 'bike',
      name: 'Bike',
      icon: VehicleIcons.bike,
      description: 'Quick and economical',
      baseFare: 15,
      perKm: 8,
      time: '5-8 min',
      capacity: '1 person',
      color: 'bg-orange-500'
    },
    {
      id: 'auto',
      name: 'Auto Rickshaw',
      icon: VehicleIcons.auto,
      description: 'Local and affordable',
      baseFare: 25,
      perKm: 12,
      time: '8-12 min',
      capacity: '3 people',
      color: 'bg-yellow-500'
    },
    {
      id: 'car',
      name: 'Car',
      icon: VehicleIcons.car,
      description: 'Comfortable ride',
      baseFare: 50,
      perKm: 18,
      time: '10-15 min',
      capacity: '4 people',
      color: 'bg-blue-500'
    },
    {
      id: 'premium',
      name: 'Premium Car',
      icon: VehicleIcons.premium,
      description: 'Luxury experience',
      baseFare: 80,
      perKm: 25,
      time: '8-12 min',
      capacity: '4 people',
      color: 'bg-purple-500'
    }
  ];

  const frequentRides = [
    { from: 'Home', to: 'Office', count: 45, icon: '🏠' },
    { from: 'Office', to: 'Gym', count: 23, icon: '💼' },
    { from: 'Home', to: 'Airport', count: 12, icon: '✈️' }
  ];

  const nearbyPlaces = [
    { name: 'Starbucks Coffee', distance: '0.5 km', icon: '☕' },
    { name: 'Central Mall', distance: '1.2 km', icon: '🛍️' },
    { name: 'City Park', distance: '2.0 km', icon: '🌳' },
    { name: 'Movie Theater', distance: '1.8 km', icon: '🎬' }
  ];

  // Show booking status modal if ride is active
  if (bookingStatus && activeRide) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-6">
          <Card className="p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">
                {bookingStatus === 'driver_search' && 'Finding your driver...'}
                {bookingStatus === 'driver_assigned' && 'Driver assigned!'}
                {bookingStatus === 'error' && 'Booking failed'}
              </h2>
              <p className="text-gray-600 text-lg">
                {bookingStatus === 'driver_search' && 'Notifying nearby drivers about your ride request'}
                {bookingStatus === 'driver_assigned' && 'Your driver is on the way to pickup location'}
                {bookingStatus === 'error' && 'Something went wrong. Please try again.'}
              </p>
            </div>

            {bookingStatus === 'driver_search' && (
              <div className="text-center py-12">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <Clock className="animate-spin text-blue-500 w-full h-full" />
                </div>
                <p className="text-gray-500 text-lg">Searching for nearby drivers...</p>
                <div className="mt-4 bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 font-medium">Please wait while we find a driver</p>
                  <p className="text-blue-600 text-sm mt-1">A driver must accept your request manually</p>
                </div>
              </div>
            )}

            {bookingStatus === 'driver_assigned' && (
              <div className="space-y-6">
                {/* Driver Accepted - Success Message */}
                <div className="bg-green-50 rounded-xl p-6 border-2 border-green-300 text-center mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <CheckCircle className="text-green-600 mr-2" size={24} />
                    <h3 className="text-xl font-bold text-green-800">Driver Accepted Your Ride! 🎉</h3>
                  </div>
                  <p className="text-green-700">A driver has accepted your ride request and is on the way</p>
                </div>

                {/* OTP Card */}
                {activeRide.otp && (
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-300 text-center mb-4 animate-pulse">
                    <h3 className="text-xl font-bold text-blue-800 mb-3">🔐 Your Trip OTP</h3>
                    <div className="bg-blue-600 text-white rounded-lg p-4 mb-4">
                      <p className="text-6xl font-bold tracking-wide">{activeRide.otp}</p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-4">
                      <p className="text-blue-800 font-semibold text-lg">
                        📱 Share this OTP with your driver to start the trip
                      </p>
                      <p className="text-blue-600 text-sm mt-2">
                        Driver will enter this code to verify pickup
                      </p>
                    </div>
                  </div>
                )}

                {/* Debug info for OTP */}
                <div className="bg-gray-100 rounded-xl p-4 border text-center text-xs mb-4">
                  <p className="text-gray-600">Debug Info:</p>
                  <p className="text-gray-600">Active Ride Status: {activeRide?.status || 'none'}</p>
                  <p className="text-gray-600">Active Ride OTP: {activeRide?.otp || 'none'}</p>
                  <p className="text-gray-600">Active Ride ID: {activeRide?.id || 'none'}</p>
                  <p className="text-gray-600">Booking Status: {bookingStatus}</p>
                  <details className="mt-2">
                    <summary className="text-gray-500 cursor-pointer">Full Active Ride Object</summary>
                    <pre className="text-left text-gray-500 mt-2 text-xs overflow-auto">
                      {JSON.stringify(activeRide, null, 2)}
                    </pre>
                  </details>
                </div>

                {!activeRide.otp && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-center">
                    <p className="text-yellow-800">Waiting for driver to accept ride...</p>
                    <p className="text-sm text-yellow-600 mt-1">OTP will appear here once driver accepts</p>
                  </div>
                )}

                {/* Trip Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Trip Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm text-gray-600">Pickup</p>
                        <p className="font-medium">{activeRide.pickupLocation || activeRide.pickup_location?.address || pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm text-gray-600">Drop-off</p>
                        <p className="font-medium">{activeRide.dropLocation || activeRide.dropoff_location?.address || destination}</p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Estimated Fare</span>
                        <span className="text-2xl font-bold text-green-600">₹{activeRide.estimatedFare || activeRide.fare || activeRide.estimated_fare || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex space-x-4">
              <Button
                onClick={() => {
                  // Store active ride data for tracking
                  if (activeRide) {
                    console.log('💾 Saving ride to localStorage:', activeRide);

                    // Also pass current dest to global location store
                    if (dropCoords) {
                      setGlobalPickupLocation({
                        lat: dropCoords.lat,
                        lng: dropCoords.lng,
                        name: destination
                      });
                    }

                    console.log('   - distance_km:', activeRide.distance_km);
                    console.log('   - estimated_duration_min:', activeRide.estimated_duration_min);
                    console.log('   - estimated_fare:', activeRide.estimated_fare);
                    localStorage.setItem('activeRide', JSON.stringify(activeRide));

                    // Verify what was saved
                    const savedData = JSON.parse(localStorage.getItem('activeRide'));
                    console.log('✅ Verified saved data:', savedData);
                  } else {
                    console.error('❌ No activeRide to save!');
                  }
                  navigate('/customer/tracking');
                }}
                className="flex-1 bg-black text-white hover:bg-gray-800 py-4 text-lg"
                disabled={bookingStatus === 'driver_search'}
              >
                {bookingStatus === 'driver_assigned' ? 'Track Ride' : 'Waiting for Driver...'}
              </Button>
              {bookingStatus === 'driver_assigned' && (
                <Button
                  onClick={handleNavigateToDestination}
                  className="bg-blue-600 text-white hover:bg-blue-700 py-4 px-6 flex items-center justify-center gap-2"
                >
                  <Navigation size={20} />
                  Navigate
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setActiveRide(null);
                  setBookingStatus(null);
                  setPickup('');
                  setDestination('');
                }}
                className="px-8 py-4 border-2 border-gray-300 hover:border-red-500 hover:text-red-500"
              >
                Cancel Request
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section - Uber Style */}
      <div className="w-full min-h-screen bg-white">
        {/* Main Hero Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 min-h-[80vh] items-center">

            {/* Left Side - Booking Form */}
            <div className="space-y-8 lg:pr-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-black leading-tight">
                  Go anywhere with us
                </h1>

                {/* Pickup Time Options */}
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-sm font-medium">
                    <Clock size={16} />
                    Pickup now
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => navigate('/customer/services')}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors text-sm font-medium shadow-sm cursor-pointer"
                  >
                    <Calendar size={16} />
                    Pickup after
                  </button>
                </div>

                {/* Booking Form */}
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-black rounded-full"></div>
                    <input
                      type="text"
                      placeholder="Pickup location (e.g., Koramangala, MG Road)"
                      value={pickup}
                      onChange={(e) => { setPickup(e.target.value); setShowPickupSuggestions(true); }}
                      onFocus={() => setShowPickupSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
                      className="w-full pl-12 pr-16 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-colors bg-gray-50"
                    />
                    <button
                      onClick={useCurrentLocation}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors bg-transparent border-0 z-10"
                      title="Use current location"
                    >
                      <Navigation size={20} />
                    </button>
                    {showPickupSuggestions && pickupSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {pickupSuggestions.map(suggestion => (
                          <div
                            key={suggestion.id}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                            onClick={() => handleSelectPickup(suggestion)}
                          >
                            <div className="font-semibold text-gray-800">{suggestion.text}</div>
                            <div className="text-sm text-gray-500 truncate">{suggestion.place_name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-gray-400 rounded-sm"></div>
                    <input
                      type="text"
                      placeholder="Where to? (e.g., Indiranagar, Brigade Road)"
                      value={destination}
                      onChange={(e) => { setDestination(e.target.value); setShowDestinationSuggestions(true); }}
                      onFocus={() => setShowDestinationSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                      className="w-full pl-12 pr-16 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-colors bg-gray-50"
                    />
                    <button
                      onClick={toggleVoiceRecording}
                      disabled={voiceLoading}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-all z-10 bg-transparent border-0 ${isRecording
                        ? 'text-red-600 animate-pulse'
                        : voiceLoading
                          ? 'text-gray-400'
                          : 'text-blue-600 hover:text-blue-800'
                        }`}
                      title={isRecording ? 'Stop recording' : 'Start voice input'}
                    >
                      {voiceLoading ? (
                        <Loader size={20} className="animate-spin" />
                      ) : isRecording ? (
                        <MicOff size={20} />
                      ) : (
                        <Mic size={20} />
                      )}
                    </button>
                    {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {destinationSuggestions.map(suggestion => (
                          <div
                            key={suggestion.id}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                            onClick={() => handleSelectDestination(suggestion)}
                          >
                            <div className="font-semibold text-gray-800">{suggestion.text}</div>
                            <div className="text-sm text-gray-500 truncate">{suggestion.place_name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={showVehicleSelection ? handleBookRide : handleSearchRides}
                    disabled={!pickup.trim() || !destination.trim() || isLoading || (showVehicleSelection && !selectedVehicle)}
                    className="w-full bg-black text-white py-5 px-8 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="animate-spin" size={20} />
                        <span>{showVehicleSelection ? 'Booking Ride...' : 'Finding Routes...'}</span>
                      </div>
                    ) : showVehicleSelection ? (
                      selectedVehicle ? `Book ${selectedVehicle.name} - ₹${estimatedFares[selectedVehicle.id]}` : 'Select Vehicle Type'
                    ) : (
                      'Search Rides'
                    )}
                  </button>
                </div>

                {/* Vehicle Selection */}
                {showVehicleSelection && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-800 font-medium">Distance: {distance?.toFixed(1)} km</span>
                        <span className="text-blue-800 font-medium">Duration: {duration?.toFixed(0)} min</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">Choose your ride</h3>
                      {vehicleTypes.map((vehicle) => (
                        <motion.div
                          key={vehicle.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowFareExplanation(false);
                          }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${selectedVehicle?.id === vehicle.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                {vehicle.icon}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{vehicle.name}</h4>
                                <p className="text-sm text-gray-600">{vehicle.description}</p>
                                <p className="text-xs text-gray-500">{vehicle.capacity} • {vehicle.time}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">₹{estimatedFares[vehicle.id] || '--'}</p>
                              <p className="text-sm text-gray-500">Est. fare</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Explain Why Button */}
                    {selectedVehicle && fareExplanations[selectedVehicle.id] && !showFareExplanation && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setShowFareExplanation(true)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <Zap size={18} />
                        <span>Explain why?</span>
                      </motion.button>
                    )}

                    {/* Dynamic Fare Explanation */}
                    {selectedVehicle && fareExplanations[selectedVehicle.id] && showFareExplanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Zap className="text-purple-600" size={20} />
                            <h4 className="font-semibold text-gray-900">Dynamic Fare Breakdown</h4>
                          </div>
                          <button
                            onClick={() => setShowFareExplanation(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Close explanation"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                          {fareExplanations[selectedVehicle.id].explanation}
                        </div>

                        {/* Traffic & Weather Info */}
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {fareExplanations[selectedVehicle.id].traffic_info && (
                            <div className="bg-white/60 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Traffic Impact</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {fareExplanations[selectedVehicle.id].traffic_info.traffic_multiplier}x
                              </p>
                              {fareExplanations[selectedVehicle.id].traffic_info.delay_minutes > 0 && (
                                <p className="text-xs text-orange-600">
                                  +{fareExplanations[selectedVehicle.id].traffic_info.delay_minutes.toFixed(0)} min delay
                                </p>
                              )}
                            </div>
                          )}

                          {fareExplanations[selectedVehicle.id].weather_info && (
                            <div className="bg-white/60 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Weather Impact</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {fareExplanations[selectedVehicle.id].weather_info.weather_multiplier}x
                              </p>
                              {fareExplanations[selectedVehicle.id].weather_info.summary && (
                                <p className="text-xs text-blue-600">
                                  {fareExplanations[selectedVehicle.id].weather_info.summary}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Policy References - Optional */}
                        {fareExplanations[selectedVehicle.id].retrieved_policies &&
                          fareExplanations[selectedVehicle.id].retrieved_policies.length > 0 && (
                            <div className="text-xs text-gray-500 pt-2 border-t border-purple-200">
                              <p>Based on: {fareExplanations[selectedVehicle.id].retrieved_policies.join(', ')}</p>
                            </div>
                          )}
                      </motion.div>
                    )}

                    <button
                      onClick={() => {
                        setShowVehicleSelection(false);
                        setSelectedVehicle(null);
                        setEstimatedFares({});
                        setFareExplanations({});
                        setShowFareExplanation(false);
                        setDistance(null);
                        setDuration(null);
                        setPickupCoords(null);
                        setDropCoords(null);
                      }}
                      className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ← Back to route search
                    </button>
                  </motion.div>
                )}

                {/* Login Link */}
                {!showVehicleSelection && (
                  <p className="text-sm text-gray-600">
                    <a href="#" className="text-black underline hover:no-underline">
                      Log in to see your recent activity
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Right Side - Travel Illustration + Map */}
            <div className="relative h-full min-h-[600px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl overflow-hidden">
              {/* Travel Illustration Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20">
                <div className="w-full h-full relative">
                  {/* Map Container */}
                  <div className="absolute inset-4 rounded-2xl overflow-hidden" style={{ height: 'calc(100% - 2rem)' }}>
                    {locationLoading ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <Loader className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
                          <p className="text-gray-600">Finding your location...</p>
                        </div>
                      </div>
                    ) : (
                      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '500px' }} />
                    )}
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-8 right-8 w-16 h-16 bg-yellow-400 rounded-full opacity-60"></div>
                  <div className="absolute top-20 left-8 w-8 h-8 bg-green-400 rounded-full opacity-40"></div>
                  <div className="absolute bottom-32 left-16 w-12 h-12 bg-blue-400 rounded-full opacity-50"></div>
                </div>
              </div>

              {/* Floating Schedule Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 left-8 right-8 bg-white rounded-2xl p-6 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Ready to travel?</h3>
                    <p className="text-sm text-gray-600">Schedule ahead</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-600" size={20} />
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Places with Images */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Suggested Places</h2>
          <p className="text-gray-600">Discover popular destinations in Bangalore</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Place 1: Lalbagh Botanical Garden */}
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.95 }}
            className="group cursor-pointer"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/302769/pexels-photo-302769.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Lalbagh Botanical Garden"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Star className="text-yellow-300" size={20} fill="currentColor" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">Lalbagh</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-2">Lalbagh Botanical Garden</h4>
                <p className="text-gray-600 text-sm">Beautiful botanical garden with diverse flora and the famous Glass House</p>
              </div>
            </Card>
          </motion.div>

          {/* Place 2: Bangalore Palace */}
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.95 }}
            className="group cursor-pointer"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/753639/pexels-photo-753639.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Bangalore Palace"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Star className="text-yellow-300" size={20} fill="currentColor" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">Palace</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-2">Bangalore Palace</h4>
                <p className="text-gray-600 text-sm">Historic palace with stunning architecture and royal heritage</p>
              </div>
            </Card>
          </motion.div>

          {/* Place 3: Commercial Street */}
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.95 }}
            className="group cursor-pointer"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Commercial Street Shopping"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Star className="text-yellow-300" size={20} fill="currentColor" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">Shopping</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-2">Commercial Street</h4>
                <p className="text-gray-600 text-sm">Popular shopping destination with diverse stores and eateries</p>
              </div>
            </Card>
          </motion.div>

          {/* Place 4: Cubbon Park */}
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.95 }}
            className="group cursor-pointer"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Cubbon Park"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Star className="text-yellow-300" size={20} fill="currentColor" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">Park</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-2">Cubbon Park</h4>
                <p className="text-gray-600 text-sm">Green lung of the city perfect for morning walks and relaxation</p>
              </div>
            </Card>
          </motion.div>

          {/* Place 5: UB City Mall */}
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.95 }}
            className="group cursor-pointer"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="UB City Mall"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Star className="text-yellow-300" size={20} fill="currentColor" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">Mall</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-2">UB City Mall</h4>
                <p className="text-gray-600 text-sm">Premium shopping and dining destination in the heart of the city</p>
              </div>
            </Card>
          </motion.div>

          {/* Place 6: Kempegowda International Airport */}
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.95 }}
            className="group cursor-pointer"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/358220/pexels-photo-358220.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Bangalore Airport"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Star className="text-yellow-300" size={20} fill="currentColor" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">Airport</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-2">Bangalore Airport</h4>
                <p className="text-gray-600 text-sm">International airport connecting Bangalore to the world</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* About App Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 text-lg">Your reliable ride companion in Bangalore</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Service</h3>
              <p className="text-gray-600">Available round the clock for your convenience</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-gray-600">Verified drivers and secure payment options</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">Track your ride in real-time with precise location</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with transparent fare structure</p>
            </motion.div>
          </div>

          {/* App Download Section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Get the App</h3>
            <p className="text-gray-600 mb-8">Download our mobile app for a better experience</p>
            <div className="flex justify-center space-x-4">
              <Button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                <span className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>Download App</span>
                </span>
              </Button>
              <Button variant="outline" className="px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-black transition-colors">
                Learn More
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Verified Drivers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Rides Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CustomerHome };
