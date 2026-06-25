import { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  Clock,
  DollarSign,
  User,
  Car,
  Star,
  AlertCircle,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { SafetyFloatingButton } from '../../components/customer/SafetyFloatingButton';
import { SafetyPanel } from '../../components/customer/SafetyPanel';
import { customerAPI, appRideAPI } from '../../services/api';

export const RideTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const driverMarker = useRef(null);
  const customerMarker = useRef(null);
  const routeSource = useRef(null);

  // State for dynamic ride data
  const [activeRide, setActiveRide] = useState(null);
  const [rideStatus, setRideStatus] = useState('searching_driver');
  const [driverLocation, setDriverLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [safetyPanelOpen, setSafetyPanelOpen] = useState(false);

  // Mapbox access token
  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidmFtc2kyOTI5IiwiYSI6ImNtZGVxcGI3NTA0azIya3IxNjgwNDU1NTMifQ.m8MGXkFHTO7RyDmmBuoorA';

  useEffect(() => {
    console.log('🚀 RideTracking component mounted');
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    // Fetch ride data from backend `/api/v1/rides/current` instead of relying solely on localStorage
    const fetchCurrentRide = async () => {
      try {
        const response = await customerAPI.getRideById('current');
        if (response.data && response.data.data) {
          const apiRide = response.data.data;
          console.log('📍 Loaded CURRENT ride from API:', apiRide);
          setActiveRide(apiRide);
          setRideStatus(apiRide.status);

          if (apiRide.distance_km) {
            setDistance(`${apiRide.distance_km.toFixed(1)} km`);
          }
          if (apiRide.estimated_duration_min) {
            setEta(`${Math.round(apiRide.estimated_duration_min)} min`);
          }
          // Optionally save back to localStorage
          localStorage.setItem('activeRide', JSON.stringify(apiRide));
        } else {
          // Fallback to local storage if API didn't return an active ride
          fallbackToLocalStorage();
        }
      } catch (error) {
        console.error('Failed to fetch current ride from API', error);
        fallbackToLocalStorage();
      }
    };

    const fallbackToLocalStorage = () => {
      const rideData = localStorage.getItem('activeRide');
      if (rideData) {
        const parsedRide = JSON.parse(rideData);
        console.log('📍 Loaded ride from localStorage (Fallback):', parsedRide);
        setActiveRide(parsedRide);
        if (parsedRide.distance_km) setDistance(`${parsedRide.distance_km.toFixed(1)} km`);
        if (parsedRide.estimated_duration_min) setEta(`${Math.round(parsedRide.estimated_duration_min)} min`);
      } else {
        console.warn('⚠️ No active ride found from API or LocalStorage');
      }
    };

    fetchCurrentRide();

    // Initialize map after a brief delay to ensure DOM is ready
    setTimeout(() => {
      initializeMap();
    }, 100);

    // Start real-time polling for ride updates
    startRealTimeUpdates();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up RideTracking component');
      if (window.rideTrackingPolling) {
        clearInterval(window.rideTrackingPolling);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    console.log('🗺️ Attempting to initialize map...');
    console.log('📦 mapContainer.current:', mapContainer.current);
    console.log('🗺️ map.current:', map.current);

    if (!mapContainer.current) {
      console.error('❌ Map container not found!');
      return;
    }

    if (map.current) {
      console.log('ℹ️ Map already initialized');
      return;
    }

    try {
      console.log('🔑 Mapbox token:', MAPBOX_ACCESS_TOKEN ? 'Set ✓' : 'Missing ✗');

      // Default to Bangalore coordinates
      const defaultLat = 12.9716;
      const defaultLng = 77.5946;

      console.log('🌍 Creating map with center:', [defaultLng, defaultLat]);

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [defaultLng, defaultLat],
        zoom: 12,
        trackResize: false,
        // Completely disable Mapbox telemetry and analytics
        collectResourceTiming: false,
        fadeDuration: 0,
        crossSourceCollisions: false
      });

      console.log('✅ Map object created successfully');

      map.current.on('load', () => {
        console.log('✅ Tracking map loaded successfully');
        setMapLoading(false);

        // Add route source for drawing line between driver and customer
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });

        // Add route layer with high visibility
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3B82F6',  // Bright blue
            'line-width': 6,           // Thicker line
            'line-opacity': 1          // Fully opaque
          }
        });

        console.log('✅ Route source and layer added with high visibility');
        console.log('   - Color: #3B82F6 (blue)');
        console.log('   - Width: 6px');
        console.log('   - Opacity: 1');

        // Set initial locations after a small delay to ensure everything is ready
        setTimeout(() => {
          updateMapLocations();
        }, 500);
      });

      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        setMapLoading(false);
      });

      // Add map controls
      map.current.addControl(new mapboxgl.NavigationControl());

    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setMapLoading(false);
    }
  };

  const updateMapLocations = async () => {
    // Check if map is initialized and loaded
    if (!map.current || !map.current.isStyleLoaded()) {
      console.log('⏳ Map not ready yet, skipping location update');
      return;
    }

    // Check if route source exists
    if (!map.current.getSource('route')) {
      console.log('⏳ Route source not ready yet, skipping location update');
      return;
    }

    if (!activeRide) {
      console.log('⚠️ No active ride data');
      return;
    }

    // Get pickup and dropoff locations from ride data
    const pickupLat = activeRide.pickup_location?.latitude || activeRide.pickup_location?.coordinates?.[1] || 12.9716;
    const pickupLng = activeRide.pickup_location?.longitude || activeRide.pickup_location?.coordinates?.[0] || 77.5946;
    const dropoffLat = activeRide.dropoff_location?.latitude || activeRide.dropoff_location?.coordinates?.[1] || 12.9784;
    const dropoffLng = activeRide.dropoff_location?.longitude || activeRide.dropoff_location?.coordinates?.[0] || 77.6413;

    console.log('📍 === LOCATION COORDINATES ===');
    console.log('📍 Pickup:  [' + pickupLng + ', ' + pickupLat + ']');
    console.log('📍 Dropoff: [' + dropoffLng + ', ' + dropoffLat + ']');
    console.log('📍 Distance between points:', Math.abs(pickupLng - dropoffLng) + Math.abs(pickupLat - dropoffLat));

    // Update pickup marker (green)
    if (customerMarker.current) {
      customerMarker.current.remove();
    }
    customerMarker.current = new mapboxgl.Marker({ color: '#10B981' })
      .setLngLat([pickupLng, pickupLat])
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Pickup Location</h3><p>' + (activeRide.pickup_location?.address || 'Pickup') + '</p>'))
      .addTo(map.current);

    // Update dropoff marker (red)
    if (driverMarker.current) {
      driverMarker.current.remove();
    }
    driverMarker.current = new mapboxgl.Marker({ color: '#EF4444' })
      .setLngLat([dropoffLng, dropoffLat])
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Dropoff Location</h3><p>' + (activeRide.dropoff_location?.address || 'Destination') + '</p>'))
      .addTo(map.current);

    // Get actual route from Mapbox Directions API
    try {
      console.log('🛣️ Fetching route from Mapbox Directions API...');
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;

      const response = await fetch(directionsUrl);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Directions API response:', data);

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const routeSource = map.current.getSource('route');

          if (routeSource) {
            console.log('✅ Setting route data with', route.geometry.coordinates.length, 'points');
            routeSource.setData({
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            });
            console.log('✅ Route line drawn successfully!');
          } else {
            console.log('⚠️ Route source not found');
          }
        } else {
          console.log('⚠️ No routes in API response');
        }
      } else {
        console.log('⚠️ Directions API failed, using straight line');
        // Fallback to straight line
        const routeSource = map.current.getSource('route');
        if (routeSource) {
          routeSource.setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [pickupLng, pickupLat],
                [dropoffLng, dropoffLat]
              ]
            }
          });
          console.log('✅ Straight line fallback drawn');
        }
      }
    } catch (error) {
      console.log('❌ Error updating route:', error);
      // Fallback to straight line
      try {
        const routeSource = map.current.getSource('route');
        if (routeSource) {
          routeSource.setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [pickupLng, pickupLat],
                [dropoffLng, dropoffLat]
              ]
            }
          });
          console.log('✅ Straight line fallback drawn after error');
        }
      } catch (fallbackError) {
        console.log('❌ Even fallback failed:', fallbackError);
      }
    }

    // Verify route layer is visible
    try {
      const routeLayer = map.current.getLayer('route');
      const routeSource = map.current.getSource('route');

      if (routeLayer && routeSource) {
        console.log('✅ Route verification:');
        console.log('   - Layer exists:', !!routeLayer);
        console.log('   - Source exists:', !!routeSource);
        console.log('   - Layer visibility:', map.current.getLayoutProperty('route', 'visibility') || 'visible');
        console.log('   - Line color:', map.current.getPaintProperty('route', 'line-color'));
        console.log('   - Line width:', map.current.getPaintProperty('route', 'line-width'));
      } else {
        console.log('⚠️ Route layer or source missing after update');
      }
    } catch (verifyError) {
      console.log('⚠️ Could not verify route:', verifyError);
    }

    // Fit map to show both markers
    try {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([pickupLng, pickupLat]);
      bounds.extend([dropoffLng, dropoffLat]);
      map.current.fitBounds(bounds, { padding: 80 });
    } catch (error) {
      console.log('⚠️ Error fitting bounds:', error.message);
    }

    // Calculate distance between pickup and dropoff
    const distanceKm = activeRide.distance_km || calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const durationMin = activeRide.estimated_duration_min || Math.round(distanceKm * 3);

    setDistance(`${distanceKm.toFixed(1)} km`);
    setEta(`${Math.round(durationMin)} min`);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startRealTimeUpdates = () => {
    // Poll for ride updates every 5 seconds
    window.rideTrackingPolling = setInterval(async () => {
      try {
        // Fetch current ride data from localStorage (this has our booking data)
        const rideData = localStorage.getItem('activeRide');
        if (rideData) {
          const ride = JSON.parse(rideData);
          console.log('📡 Polling ride status for:', ride.id);

          try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const customerId = user.id || user.customer_id || ride.customerId;
            if (!customerId) return;
            const response = await appRideAPI.getCustomerActiveRides(customerId);

            const rides = response.data?.data;
            if (!rides || rides.length === 0) return;

            const updatedRide = rides.find(r => r.id === ride.id) || rides[0];
            if (!updatedRide) return;

            console.log('📥 Backend response:', updatedRide);

            // ⚠️ CRITICAL: Preserve booking data! Backend might not return these fields
            const mergedRide = {
              ...updatedRide,
              // Keep original booking values if backend doesn't provide them
              distance_km: updatedRide.distance_km || ride.distance_km || 0,
              estimated_duration_min: updatedRide.estimated_duration_min || ride.estimated_duration_min || 0,
              estimated_fare: updatedRide.estimated_fare || ride.estimated_fare || 0,
              pickup_location: updatedRide.pickup_location || ride.pickup_location,
              dropoff_location: updatedRide.dropoff_location || ride.dropoff_location
            };

            console.log('✅ Merged ride with preserved booking data:', mergedRide);
            setActiveRide(mergedRide);
            setRideStatus(mergedRide.status);

            // Update localStorage with merged data
            localStorage.setItem('activeRide', JSON.stringify(mergedRide));

            // If ride is completed or cancelled, redirect to history
            if (mergedRide.status === 'completed') {
              console.log('🎯 Ride completed!');
              setShowCompletionModal(true);
              setTimeout(() => {
                clearInterval(window.rideTrackingPolling);
                navigate('/customer/history');
              }, 3000); // Give user 3 seconds to see the success message
            } else if (mergedRide.status === 'cancelled') {
              console.log('⚠️ Ride cancelled!');
              setShowCancellationModal(true);
              setTimeout(() => {
                clearInterval(window.rideTrackingPolling);
                navigate('/customer/history');
              }, 3000);
            }
          } catch (apiError) {
            console.warn('⚠️ Failed to fetch ride update, keeping existing data', apiError);
          }
        } else {
          console.warn('⚠️ No activeRide in localStorage, stopping polling');
          clearInterval(window.rideTrackingPolling);
        }

        // No need to update map locations every 5 seconds since we're showing static pickup/dropoff
        // updateMapLocations();

      } catch (error) {
        console.error('❌ Error updating ride tracking:', error);
        console.log('⚠️ Keeping existing ride data due to polling error');
      }
    }, 5000);
  };

  const handleCancelRide = async () => {
    if (!activeRide || !activeRide.id) {
      alert('No active ride to cancel');
      return;
    }

    const confirmCancel = window.confirm('Are you sure you want to cancel this ride?');
    if (!confirmCancel) return;

    try {
      console.log('🚫 Cancelling ride:', activeRide.id);

      try {
        const response = await customerAPI.cancelRide(activeRide.id, 'Cancelled by customer');
        const result = response.data.data;
        console.log('✅ Ride cancelled:', result);

        // Update ride status
        const updatedRide = { ...activeRide, status: 'cancelled' };
        setActiveRide(updatedRide);
        setRideStatus('cancelled');
        localStorage.setItem('activeRide', JSON.stringify(updatedRide));

        // Stop polling
        if (window.rideTrackingPolling) {
          clearInterval(window.rideTrackingPolling);
        }

        // Show success message and redirect
        alert('Ride cancelled successfully');
        navigate('/customer/history');
      } catch (apiError) {
        const errorDetail = apiError.response?.data?.detail || 'Unknown error';
        alert(`Failed to cancel ride: ${errorDetail}`);
      }
    } catch (error) {
      console.error('❌ Error cancelling ride:', error);
      alert('Failed to cancel ride. Please try again.');
    }
  };

  // Driver data
  const driver = {
    name: activeRide?.driver?.name || activeRide?.driver_name || 'Waiting for driver',
    rating: activeRide?.driver?.rating || 5.0,
    vehicle: activeRide?.driver?.vehicleType || activeRide?.vehicle_type || 'Car',
    plate: activeRide?.driver?.vehicleNumber || activeRide?.vehicle_number || 'N/A',
    phone: activeRide?.driver?.phone || activeRide?.driver_phone || 'N/A',
    photo: '👨‍✈️'
  };

  // Dynamic ride details
  const rideDetails = {
    pickup: activeRide?.pickup_location?.address || 'Pickup Location',
    destination: activeRide?.dropoff_location?.address || 'Destination',
    // Trip distance from pickup to dropoff (for fare and display)
    tripDistance: activeRide?.distance_km ? `${activeRide.distance_km.toFixed(1)} km` : 'N/A',
    // Original booking ETA
    bookingEta: activeRide?.estimated_duration_min ? `${Math.round(activeRide.estimated_duration_min)} min` : 'N/A',
    fare: (() => {
      const totalFare = activeRide?.estimated_fare || 0;
      const tripDistance = activeRide?.distance_km || 0;
      console.log('💰 Calculating fare breakdown. Total fare:', totalFare);
      console.log('📏 Trip distance (pickup to dropoff):', tripDistance, 'km');

      // Calculate breakdown based on actual total fare
      if (totalFare > 0) {
        const baseFare = 40; // Fixed base fare
        const insurance = 5; // Fixed insurance
        const discount = 10; // Fixed discount

        // Calculate distance and time charges to match total
        const remainingFare = totalFare + discount - baseFare - insurance;
        const distanceCharge = Math.round(remainingFare * 0.65); // 65% for distance
        const timeCharge = remainingFare - distanceCharge; // Remaining for time

        const breakdown = {
          base: baseFare,
          distance: distanceCharge,
          time: Math.round(timeCharge),
          insurance: insurance,
          discount: -discount,
          total: totalFare
        };

        console.log('✅ Fare breakdown:', breakdown);
        const calculatedTotal = breakdown.base + breakdown.distance + breakdown.time + breakdown.insurance + breakdown.discount;
        console.log('🔢 Breakdown sum:', calculatedTotal, '(should equal', totalFare + ')');

        return breakdown;
      }

      console.log('⚠️ No fare available, using zeros');
      // Fallback for when no fare is available
      return {
        base: 0,
        distance: 0,
        time: 0,
        insurance: 0,
        discount: 0,
        total: 0
      };
    })()
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customer/home')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </button>
        <div className="text-sm text-gray-500">
          Ride ID: {activeRide?.id?.slice(0, 8)}...
        </div>
      </div>

      {/* Real Mapbox Map */}
      <Card className="p-0 overflow-hidden h-96 relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Map Loading Indicator */}
        {mapLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading map...</p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 left-4 bg-white rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${rideStatus === 'driver_assigned' ? 'bg-green-500' :
              rideStatus === 'driver_arrived' ? 'bg-blue-500' :
                rideStatus === 'in_progress' ? 'bg-yellow-500' :
                  rideStatus === 'completed' ? 'bg-gray-500' : 'bg-orange-500'
              }`}></div>
            <span className="font-semibold text-gray-900 capitalize">
              {rideStatus === 'driver_assigned' ? 'Driver Assigned' :
                rideStatus === 'driver_arrived' ? 'Driver Arrived' :
                  rideStatus === 'in_progress' ? 'Trip in Progress' :
                    rideStatus === 'completed' ? 'Trip Completed' : 'Searching Driver'}
            </span>
          </div>
        </div>

        {/* Real-time Update Indicator */}
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>

        {/* Center Map Button */}
        <button
          onClick={updateMapLocations}
          className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Navigation size={24} />
        </button>
      </Card>

      {/* Trip ETA & Distance - From Booking */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Trip Duration</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{rideDetails.bookingEta}</p>
          <p className="text-xs text-gray-500 mt-1">Estimated time</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3 mb-2">
            <Navigation className="text-green-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Trip Distance</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{rideDetails.tripDistance}</p>
          <p className="text-xs text-gray-500 mt-1">Pickup to dropoff</p>
        </Card>
      </div>

      {/* OTP Display - When Driver is Assigned */}
      {activeRide?.otp && rideStatus === 'driver_assigned' && (
        <Card className="p-6 bg-blue-50 border-2 border-blue-300">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center justify-center gap-2">
              <CheckCircle className="text-blue-600" size={24} />
              🔐 Your Trip OTP
            </h3>
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
        </Card>
      )}

      {/* Debug Info for OTP */}
      <Card className="p-4 bg-gray-50 border text-center text-xs">
        <p className="text-gray-600 mb-2">Debug Info:</p>
        <p className="text-gray-600">Ride Status: {rideStatus}</p>
        <p className="text-gray-600">Active Ride OTP: {activeRide?.otp || 'none'}</p>
        <p className="text-gray-600">Active Ride ID: {activeRide?.id || 'none'}</p>
        <details className="mt-2">
          <summary className="text-gray-500 cursor-pointer">Full Active Ride Object</summary>
          <pre className="text-left text-gray-500 mt-2 text-xs overflow-auto">
            {JSON.stringify(activeRide, null, 2)}
          </pre>
        </details>
      </Card>

      {/* Trip Fare Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <DollarSign className="text-green-600 mt-0.5" size={20} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-green-900">Total Fare</p>
              <p className="text-2xl font-bold text-green-600">₹{activeRide?.estimated_fare || 0}</p>
            </div>
            <p className="text-xs text-green-700">
              {rideDetails.tripDistance} trip • {rideDetails.bookingEta} estimated
            </p>
          </div>
        </div>
      </div>

      {/* Driver Details - Dynamic Data */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Driver Details</h3>

        {activeRide && rideStatus !== 'searching_driver' ? (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-4xl">
                {driver.photo}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{driver.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <span className="font-semibold">{driver.rating}</span>
                </div>
                <p className="text-sm text-gray-600">{driver.vehicle} • {driver.plate}</p>
                <p className="text-xs text-green-600 font-medium">
                  {rideStatus === 'driver_assigned' ? 'On the way' :
                    rideStatus === 'driver_arrived' ? 'Arrived at pickup' :
                      rideStatus === 'in_progress' ? 'En route to destination' : 'Available'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="p-3 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors">
                <Phone size={20} />
              </button>
              <button className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                <MessageSquare size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto animate-pulse">
                🚗
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Finding Your Driver</h4>
              <p className="text-sm text-gray-600">Please wait while we assign a driver...</p>
            </div>
          </div>
        )}

        {/* Trip Route - Dynamic */}
        <div className="space-y-3 mt-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-blue-100 rounded-full">
              <MapPin className="text-blue-600" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Pickup</p>
              <p className="font-semibold text-gray-900">{rideDetails.pickup}</p>
            </div>
          </div>

          <div className="ml-5 border-l-2 border-dashed border-gray-300 h-8"></div>

          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-red-100 rounded-full">
              <MapPin className="text-red-600" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Destination</p>
              <p className="font-semibold text-gray-900">{rideDetails.destination}</p>
              {rideStatus === 'in_progress' && (
                <p className="text-xs text-green-600 mt-1">Trip in progress</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Fare Breakdown - Dynamic Data */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="text-green-600" size={24} />
          Fare Breakdown
          {activeRide && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              Ride #{activeRide.id?.slice(-6)}
            </span>
          )}
        </h3>

        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
          <MapPin size={14} />
          Based on trip from pickup to destination ({rideDetails.tripDistance})
        </p>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base Fare</span>
            <span className="font-semibold text-gray-900">₹{rideDetails.fare.base}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Distance Charge ({rideDetails.tripDistance})</span>
            <span className="font-semibold text-gray-900">₹{rideDetails.fare.distance}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Time Charge</span>
            <span className="font-semibold text-gray-900">₹{rideDetails.fare.time}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Ride Insurance</span>
            <span className="font-semibold text-gray-900">₹{rideDetails.fare.insurance}</span>
          </div>

          <div className="flex justify-between items-center text-green-600">
            <span>Discount Applied</span>
            <span className="font-semibold">-₹{Math.abs(rideDetails.fare.discount)}</span>
          </div>

          <div className="border-t-2 border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total Fare</span>
              <span className="text-2xl font-bold text-green-600">₹{rideDetails.fare.total}</span>
            </div>
            {activeRide?.created_at && (
              <p className="text-xs text-gray-500 mt-2">
                Booking confirmed at {new Date(activeRide.created_at).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="w-full" onClick={() => navigate('/customer/support')}>
          <AlertCircle size={20} />
          Report Issue
        </Button>
        <Button
          variant="danger"
          className="w-full"
          onClick={handleCancelRide}
          disabled={rideStatus === 'in_progress' || rideStatus === 'completed' || rideStatus === 'cancelled'}
        >
          {rideStatus === 'in_progress' ? 'Trip in Progress' :
            rideStatus === 'completed' ? 'Ride Completed' :
              rideStatus === 'cancelled' ? 'Ride Cancelled' :
                'Cancel Ride'}
        </Button>
      </div>

      {/* Real-time Updates Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-blue-900">Live Tracking Active</p>
            <p className="text-xs text-blue-700">
              Location and status updated every 5 seconds • Driver location simulated
            </p>
          </div>
        </div>
      </Card>

      {/* Ride Completion Success Modal */}
      {showCompletionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="text-green-600 w-12 h-12" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              🎉 Ride Completed!
            </h2>

            <p className="text-gray-600 mb-6 text-lg">
              Your ride has been successfully completed. Thank you for traveling with us!
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Total Fare</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{activeRide?.estimated_fare || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Distance</span>
                <span>{rideDetails.tripDistance}</span>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Redirecting to ride history in 3 seconds...
            </p>

            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="bg-green-600 h-1 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Ride Cancellation Modal */}
      {showCancellationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertCircle className="text-red-600 w-12 h-12" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Ride Cancelled
            </h2>

            <p className="text-gray-600 mb-6 text-lg">
              This ride has been cancelled and will be moved to your ride history.
            </p>

            <p className="text-sm text-gray-500">
              Redirecting to ride history in 3 seconds...
            </p>

            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="bg-red-600 h-1 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Safety Assistant */}
      <SafetyFloatingButton onClick={() => setSafetyPanelOpen(true)} />
      <SafetyPanel
        isOpen={safetyPanelOpen}
        onClose={() => setSafetyPanelOpen(false)}
        driverId={activeRide?.driver_id}
        rideId={activeRide?.id}
      />
    </div>
  );
};
