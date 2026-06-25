import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLocationStore } from '../../store/locationStore';
import { customerAPI, appRideAPI } from '../../services/api';
import {
  Car,
  Bike,
  Zap,
  Crown,
  Users,
  MapPin,
  DollarSign,
  Shield,
  Clock,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Services = () => {
  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidmFtc2kyOTI5IiwiYSI6ImNtZGVxcGI3NTA0azIya3IxNjgwNDU1NTMifQ.m8MGXkFHTO7RyDmmBuoorA';
  const pickupLocation = useLocationStore((state) => state.pickupLocation);
  const navigate = useNavigate();

  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [estimatedFares, setEstimatedFares] = useState({});
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pickupLocation && pickupLocation.name) {
      setPickup(pickupLocation.name);
    }
  }, [pickupLocation]);

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
    setPickupSuggestions([]);
    setShowPickupSuggestions(false);
  };

  const handleSelectDestination = (suggestion) => {
    setDestination(suggestion.place_name);
    setDestinationSuggestions([]);
    setShowDestinationSuggestions(false);
  };

  const geocodeAddress = async (address) => {
    try {
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=in&limit=1&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await fetch(geocodeUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          return { lat, lng };
        }
      }
    } catch (error) {
      console.error('Error geocoding:', error);
    }
    return null;
  };

  const rideServices = [
    {
      id: 1,
      name: 'Auto Rickshaw',
      icon: Car,
      description: 'Affordable rides for short distances',
      basePrice: '₹25',
      perKm: '₹12/km',
      time: '2-5 min arrival',
      color: 'yellow',
      capacity: '3 passengers',
      features: ['Budget friendly', 'Quick pickup', 'Local routes']
    },
    {
      id: 2,
      name: 'Bike Ride',
      icon: Bike,
      description: 'Fast and economical for solo travelers',
      basePrice: '₹20',
      perKm: '₹8/km',
      time: '1-3 min arrival',
      color: 'green',
      capacity: '1 passenger',
      features: ['Fastest delivery', 'Beat traffic', 'Eco-friendly']
    },
    {
      id: 3,
      name: 'Economy Car',
      icon: Car,
      description: 'Comfortable rides at affordable prices',
      basePrice: '₹40',
      perKm: '₹15/km',
      time: '3-7 min arrival',
      color: 'blue',
      capacity: '4 passengers',
      features: ['Air conditioning', 'Safe & secure', 'Door-to-door']
    },
    {
      id: 4,
      name: 'Premium Car',
      icon: Crown,
      description: 'Luxury vehicles for premium experience',
      basePrice: '₹80',
      perKm: '₹25/km',
      time: '5-10 min arrival',
      color: 'purple',
      capacity: '4 passengers',
      features: ['Luxury vehicles', 'Professional drivers', 'Premium service']
    },
    {
      id: 5,
      name: 'Share Ride',
      icon: Users,
      description: 'Share your ride and split the cost',
      basePrice: '₹20',
      perKm: '₹7/km',
      time: '5-15 min arrival',
      color: 'orange',
      capacity: '2-3 passengers',
      features: ['Cost effective', 'Meet new people', 'Eco-friendly']
    },
    {
      id: 6,
      name: 'Electric Vehicle',
      icon: Zap,
      description: 'Zero emission rides for eco-conscious travelers',
      basePrice: '₹35',
      perKm: '₹14/km',
      time: '4-8 min arrival',
      color: 'green',
      capacity: '4 passengers',
      features: ['Zero emissions', 'Silent ride', 'Environmentally friendly']
    }
  ];

  const recentRides = [
    { id: 1, type: 'Economy Car', from: 'Home', to: 'Office', status: 'completed', date: 'Today', fare: '₹180' },
    { id: 2, type: 'Auto Rickshaw', from: 'Mall', to: 'Metro Station', status: 'completed', date: 'Today', fare: '₹85' },
    { id: 3, type: 'Bike Ride', from: 'Office', to: 'Restaurant', status: 'completed', date: 'Yesterday', fare: '₹45' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Ride Booking */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Car className="text-blue-600" size={28} />
          Book a Ride
        </h2>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="📍 Pickup location"
              value={pickup}
              onChange={(e) => { setPickup(e.target.value); setShowPickupSuggestions(true); }}
              onFocus={() => setShowPickupSuggestions(true)}
              onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showPickupSuggestions && pickupSuggestions.length > 0 && (
              <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {pickupSuggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    onClick={() => handleSelectPickup(suggestion)}
                  >
                    <div className="font-medium text-gray-800">{suggestion.text}</div>
                    <div className="text-sm text-gray-500 truncate">{suggestion.place_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="📍 Drop location"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setShowDestinationSuggestions(true); }}
              onFocus={() => setShowDestinationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {destinationSuggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    onClick={() => handleSelectDestination(suggestion)}
                  >
                    <div className="font-medium text-gray-800">{suggestion.text}</div>
                    <div className="text-sm text-gray-500 truncate">{suggestion.place_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ride Type</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Economy Car</option>
                <option>Auto Rickshaw</option>
                <option>Bike Ride</option>
                <option>Premium Car</option>
                <option>Share Ride</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={async () => {
              if (!pickup || !destination) {
                alert("Please select pickup and destination");
                return;
              }
              setIsLoading(true);
              try {
                const pickupCoordsLocal = await geocodeAddress(pickup);
                const destCoordsLocal = await geocodeAddress(destination);

                if (!pickupCoordsLocal || !destCoordsLocal) {
                  alert("Could not geocode locations");
                  setIsLoading(false);
                  return;
                }

                setPickupCoords(pickupCoordsLocal);
                setDropoffCoords(destCoordsLocal);

                const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoordsLocal.lng},${pickupCoordsLocal.lat};${destCoordsLocal.lng},${destCoordsLocal.lat}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;

                const response = await fetch(directionsUrl);
                if (response.ok) {
                  const data = await response.json();
                  if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const distanceKm = route.distance / 1000;
                    const durationMin = route.duration / 60;

                    setDistance(distanceKm);
                    setDuration(durationMin);

                    const fares = {};
                    rideServices.forEach(service => {
                      const base = parseInt(service.basePrice.replace('₹', ''));
                      const perKm = parseInt(service.perKm.replace('₹', '').replace('/km', ''));
                      fares[service.id] = Math.round(base + (distanceKm * perKm));
                    });
                    setEstimatedFares(fares);
                  }
                }
              } catch (e) {
                console.error(e);
                alert("Failed to get quote");
              }
              setIsLoading(false);
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Calculating...' : 'Get Quote'}
          </Button>
        </div>
      </Card>

      {/* Ride Service Types */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Available Ride Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rideServices.map((service) => (
            <motion.div
              key={service.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className={`p-6 cursor-pointer border-2 border-${service.color}-200 hover:border-${service.color}-400 transition-colors h-full`}>
                <div className={`w-16 h-16 bg-${service.color}-100 rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                  <service.icon className={`text-${service.color}-600`} size={32} />
                </div>

                <div className="text-center mb-4">
                  <h4 className="font-bold text-gray-900 text-lg mb-2">{service.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                </div>

                <div className="space-y-3">
                  {/* Pricing */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Base fare:</span>
                      <span className="font-semibold text-gray-900">{service.basePrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Per km:</span>
                      <span className="font-semibold text-gray-900">{service.perKm}</span>
                    </div>
                    {estimatedFares[service.id] && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                        <span className="text-sm font-bold text-gray-900">Est Total:</span>
                        <span className="text-lg font-bold text-green-600">₹{estimatedFares[service.id]}</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="text-gray-400" size={16} />
                      <span className="text-gray-600">{service.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="text-gray-400" size={16} />
                      <span className="text-gray-600">{service.capacity}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 bg-${service.color}-100 text-${service.color}-700 rounded-full`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4"
                    size="sm"
                    onClick={async () => {
                      if (!distance || !estimatedFares[service.id]) {
                        alert("Please get a quote first");
                        return;
                      }
                      setIsLoading(true);
                      try {
                        const rideData = {
                          pickup_location: {
                            address: pickup,
                            longitude: pickupCoords.lng,
                            latitude: pickupCoords.lat,
                            coordinates: [pickupCoords.lng, pickupCoords.lat]
                          },
                          dropoff_location: {
                            address: destination,
                            longitude: dropoffCoords.lng,
                            latitude: dropoffCoords.lat,
                            coordinates: [dropoffCoords.lng, dropoffCoords.lat]
                          },
                          ride_type: service.name.toLowerCase().includes('auto') ? 'auto' :
                            service.name.toLowerCase().includes('bike') ? 'bike' :
                              service.name.toLowerCase().includes('premium') ? 'premium' : 'car',
                          passenger_count: 1,
                          fare: estimatedFares[service.id],
                          estimated_fare: estimatedFares[service.id],
                          distance_km: parseFloat(distance) || 0,
                          estimated_duration_min: parseFloat(duration) || 0
                        };

                        const response = await customerAPI.createRide({ ...rideData, status: 'REQUESTED' });
                        const newRide = response.data.data;

                        await appRideAPI.searchDrivers({
                          ...rideData,
                          customerId: newRide.customerId,
                          pickupLat: rideData.pickup_location.latitude,
                          pickupLng: rideData.pickup_location.longitude
                        }).catch(e => console.error('Driver finding error:', e));

                        const finalRideData = {
                          ...newRide,
                          status: 'searching_driver',
                          distance_km: distance || 0,
                          estimated_duration_min: duration || 0,
                          fare: estimatedFares[service.id],
                          estimated_fare: estimatedFares[service.id]
                        };

                        localStorage.setItem('activeRide', JSON.stringify(finalRideData));
                        navigate('/customer/tracking');
                      } catch (e) {
                        console.error(e);
                        alert("Failed to book ride");
                      }
                      setIsLoading(false);
                    }}
                    disabled={isLoading || !estimatedFares[service.id]}
                  >
                    Book {service.name}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Rides */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="text-gray-600" size={20} />
          Recent Rides
        </h3>
        <div className="space-y-3">
          {recentRides.map((ride) => (
            <Card key={ride.id} hoverable className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{ride.type}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span>{ride.from} → {ride.to}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{ride.date}</span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} />
                        {ride.fare}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ride.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : ride.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {ride.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-current" size={14} />
                    <span className="text-sm text-gray-600">4.8</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Ride Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-green-600" size={32} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Safe & Secure</h4>
          <p className="text-sm text-gray-600">Every ride is monitored for your safety with emergency assistance available 24/7</p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-blue-600" size={32} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Quick Pickup</h4>
          <p className="text-sm text-gray-600">Fast and reliable ride matching with drivers nearby for minimal wait times</p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="text-purple-600" size={32} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Fair Pricing</h4>
          <p className="text-sm text-gray-600">Transparent fare calculation with no hidden charges and multiple payment options</p>
        </Card>
      </div>
    </div>
  );
};

