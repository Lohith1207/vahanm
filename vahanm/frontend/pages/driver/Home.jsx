import { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CheckCircle, X, Navigation, Clock, User, MapPin, Phone, MapPinIcon, Target, DollarSign, Activity, Shield, Car, Flag, Power, Zap, Bell, AlertCircle } from 'lucide-react';
import { SafetyWarningModal } from '../../components/driver/SafetyWarningModal';
import { motion, AnimatePresence } from 'framer-motion';
import { driverAPI, customerAPI, appRideAPI } from '../../services/api';

export const DriverHome = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [rideRequests, setRideRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpValidated, setOtpValidated] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [safetyWarning, setSafetyWarning] = useState(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState(new Set());
  const [currentRideWarningCount, setCurrentRideWarningCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState({
    lastPoll: null,
    incidentCount: 0,
    latestSeverity: null,
    polling: false
  });

  // Leftover python safety polling removed to clear legacy fastAPI references.

  // Poll for ride status when driver has an active ride
  useEffect(() => {
    if (!activeRide || !activeRide.id) {
      return;
    }

    console.log('👀 Driver polling ride status for:', activeRide.id);

    const pollRideStatus = async () => {
      try {
        const response = await customerAPI.getRideById(activeRide.id);
        const rideData = response.data.data;
        console.log('📡 Driver received ride update:', rideData.status);

        // Check if ride was cancelled by customer
        if (rideData.status === 'CANCELLED') {
          console.log('🚫 Customer cancelled the ride!');
          alert('⚠️ Customer has cancelled this ride');
          setActiveRide(null);
          clearInterval(window.driverRidePolling);
        }
        // Check if ride was completed (shouldn't happen from customer side, but handle it)
        else if (rideData.status === 'COMPLETED' && activeRide.status !== 'COMPLETED') {
          console.log('✅ Ride marked as completed');
          setActiveRide(null);
          clearInterval(window.driverRidePolling);
        }
      } catch (error) {
        console.error('❌ Error polling ride status:', error);
      }
    };

    // Poll every 3 seconds
    window.driverRidePolling = setInterval(pollRideStatus, 3000);

    // Cleanup
    return () => {
      if (window.driverRidePolling) {
        clearInterval(window.driverRidePolling);
      }
    };
  }, [activeRide]);

  // Fetch real ride requests from backend
  useEffect(() => {
    if (!isOnline) {
      setRideRequests([]);
      return;
    }

    const fetchRideRequests = async () => {
      try {
        // Get available rides from backend
        const response = await appRideAPI.getPendingRides();
        const data = response.data.data;
        console.log('📡 Fetched ride requests from backend:', data);

        // Convert backend format to frontend format
        const formattedRequests = data?.map(req => {
          const formatted = {
            id: req.id,
            pickup_location: { address: req.pickupLocation || 'Unknown pickup' },
            dropoff_location: { address: req.dropLocation || 'Unknown destination' },
            customer_name: 'Customer',
            estimated_fare: req.fare || req.estimatedFare || 150,
            distance_km: req.distanceKm || 0,
            estimated_duration: 15, // Mocking duration for UI based on generic distance
            expires_at: (Date.now() + 300000) // 5 minutes
          };

          console.log(`\n🚕 Formatted ride request ${formatted.id}:`);
          console.log(`  - Fare: ₹${formatted.estimated_fare}`);
          console.log(`  - Distance: ${formatted.distance_km} km`);
          console.log(`  - Duration: ${formatted.estimated_duration} min`);

          return formatted;
        }) || [];

        console.log(`\n📋 Total formatted ride requests: ${formattedRequests.length}`);

        console.log('Formatted ride requests:', formattedRequests);
        setRideRequests(formattedRequests);
      } catch (error) {
        console.error('Error fetching ride requests:', error);
        setRideRequests([]);
      }
    };

    // Fetch immediately
    fetchRideRequests();

    // Poll for new requests every 3 seconds for faster live updates
    const interval = setInterval(fetchRideRequests, 3000);

    return () => clearInterval(interval);
  }, [isOnline]);

  const handleAcceptRide = async (rideId) => {
    setLoading(true);
    try {
      console.log('Attempting to accept ride:', rideId);

      // Try to accept ride via backend API
      const response = await appRideAPI.acceptRide(rideId);
      const result = { ride: response.data.data };
      console.log('\n✅ Ride accepted via API:', result);
      console.log('✅ Ride data from backend:');
      console.log('  - Fare:', result.ride.fare || result.ride.estimated_fare);
      console.log('  - Distance:', result.ride.distance_km);
      console.log('  - Duration:', result.ride.estimated_duration || result.ride.estimated_duration_min);

      // Convert backend response to active ride
      const activeRideData = {
        ...result.ride,
        id: result.ride.id,
        pickup_location: { address: result.ride.pickupLocation || 'Unknown pickup' },
        dropoff_location: { address: result.ride.dropLocation || 'Unknown destination' },
        estimated_fare: result.ride.estimated_fare || result.ride.fare || 150,
        distance_km: result.ride.distance_km || result.ride.distanceKm || 0,
        customer_info: {
          name: result.ride.customer_name || 'Customer',
          phone: "+919876543210",
          rating: "4.5"
        }
      };

      console.log('💾 Setting activeRide with data:');
      console.log('  - Fare:', activeRideData.estimated_fare);
      console.log('  - Distance:', activeRideData.distance_km, 'km');

      setActiveRide(activeRideData);

      // Reset OTP validation state
      setOtpInput('');
      setOtpValidated(false);
      setOtpError('');

      setRideRequests([]);
      alert(`✅ Ride accepted successfully!`);
    } catch (error) {
      console.error('Error accepting ride:', error);
      alert('❌ Failed to accept ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateOtp = async () => {
    if (otpInput.length !== 4) {
      setOtpError('Please enter a 4-digit OTP');
      return;
    }

    setLoading(true);
    setOtpError('');

    try {
      const response = await driverAPI.startRide(activeRide.id, otpInput);
      const result = response.data;

      if (result.success) {
        setOtpValidated(true);
        setOtpError('');

        // Update active ride with the latest data from backend (including fare)
        if (result.data) {
          setActiveRide(prev => ({
            ...prev,
            ...result.data,
            estimated_fare: result.data.fare || result.data.estimated_fare || prev.estimated_fare,
            customer_info: prev.customer_info // Preserve customer info
          }));
        }

        alert('✅ OTP verified successfully! Trip Started.');
      } else {
        setOtpError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (apiError) {
      console.error('OTP validation failed:', apiError);
      const errorMsg = apiError.response?.data?.detail || 'Failed to validate OTP. Please try again.';
      setOtpError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRide = (rideId) => {
    setRideRequests(prev => prev.filter(req => req.id !== rideId));
  };

  // Start trip after OTP validation
  const handleStartTrip = async () => {
    // Already started by OTP verification, just advance UI
    if (!activeRide?.id) return;
    alert('🚗 Trip already started via OTP verification. You can now complete the ride when you reach destination.');
  };

  // Navigate using Google Maps — pickup to drop coordinates from the actual ride
  const handleNavigateToCustomer = () => {
    console.log('🗺️ DEBUG: Full activeRide object:', activeRide);

    if (!activeRide) {
      alert('No active ride available to navigate to');
      return;
    }

    // Use actual ride coordinates from the backend Ride model
    // Fallback to nested location objects if flat fields are missing
    const pickupLat = activeRide.pickupLat || activeRide.pickup_location?.latitude || activeRide.pickupLocation?.latitude || 0;
    const pickupLng = activeRide.pickupLng || activeRide.pickup_location?.longitude || activeRide.pickupLocation?.longitude || 0;
    const dropLat = activeRide.dropLat || activeRide.dropoff_location?.latitude || activeRide.dropLocation?.latitude || 0;
    const dropLng = activeRide.dropLng || activeRide.dropoff_location?.longitude || activeRide.dropLocation?.longitude || 0;

    console.log('🗺️ Navigation data:', {
      pickup: { lat: pickupLat, lng: pickupLng },
      drop: { lat: dropLat, lng: dropLng }
    });

    if (pickupLat === 0 && dropLat === 0) {
      alert('⚠️ Missing location coordinates. Cannot start navigation.');
      return;
    }

    // Correct Google Maps Directions URL format: origin to destination
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${pickupLat},${pickupLng}&destination=${dropLat},${dropLng}&travelmode=driving`;

    console.log('🗺️ Opening Google Maps navigation:', googleMapsUrl);

    // Open Google Maps in new tab
    window.open(googleMapsUrl, '_blank');
  };

  const handleCompleteRide = async () => {
    if (!activeRide || !activeRide.id) {
      alert('No active ride to complete');
      return;
    }

    console.log('🔍 Debug: Current ride status before completion:', activeRide.status);
    console.log('🔍 Debug: OTP validated status:', otpValidated);
    console.log('🔍 Debug: Full ride object:', activeRide);

    const confirmComplete = window.confirm('Mark this ride as completed?');
    if (!confirmComplete) return;

    setLoading(true);
    try {
      console.log('✅ Driver completing ride:', activeRide.id);
      const response = await appRideAPI.completeRide(activeRide.id);
      const result = response.data;

      if (result.success) {
        console.log('✅ Ride completed successfully:', result);

        // Stop polling
        if (window.driverRidePolling) {
          clearInterval(window.driverRidePolling);
        }

        setActiveRide(null);
        alert('🎉 Ride completed successfully! Customer will be notified.');
      }
    } catch (apiError) {
      console.error('❌ Error completing ride:', apiError);
      const detail = apiError.response?.data?.detail || 'Unknown error';
      alert(`Failed to complete ride: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  const renderRideRequest = (request) => {
    const timeLeft = Math.max(0, Math.floor((request.expires_at - Date.now()) / 1000));

    return (
      <motion.div
        key={request.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          {/* Pulsing indicator for new request */}
          <div className="absolute top-4 right-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <Activity size={20} />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900">New Ride Request</h4>
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <User size={16} className="mr-2" />
                  <span className="font-medium">{request.customer_name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
                  <div className="flex items-center justify-end space-x-1 mb-1">
                    <DollarSign size={16} className="text-green-600" />
                    <p className="text-2xl font-bold text-green-700">₹{request.estimated_fare}</p>
                  </div>
                  <p className="text-xs text-green-600 font-medium">Estimated Fare</p>
                </div>
              </div>
            </div>

            {/* Timer Badge */}
            <div className="mb-6 inline-flex items-center space-x-2 bg-gradient-to-r from-red-50 to-orange-50 px-4 py-2 rounded-full border border-red-200">
              <Clock size={16} className="text-red-600" />
              <span className={`font-bold ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
                {timeLeft}s remaining
              </span>
            </div>

            {/* Route Information */}
            <div className="space-y-4 mb-6 bg-gray-50 rounded-xl p-4">
              {/* Pickup */}
              <div className="flex items-start space-x-3 group">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <MapPin size={18} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Pickup Location</p>
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">{request.pickup_location.address}</p>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="ml-5 w-0.5 h-6 bg-gradient-to-b from-green-300 to-red-300"></div>

              {/* Dropoff */}
              <div className="flex items-start space-x-3 group">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                    <Target size={18} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Drop-off Location</p>
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">{request.dropoff_location.address}</p>
                </div>
              </div>
            </div>

            {/* Trip Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Navigation size={14} />
                  <span className="text-xs font-medium uppercase">Distance</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{request.distance_km} km</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <Clock size={14} />
                  <span className="text-xs font-medium uppercase">Duration</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{request.estimated_duration} min</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={() => handleAcceptRide(request.id)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <CheckCircle size={18} className="mr-2" />
                Accept Ride
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRejectRide(request.id)}
                className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-5 rounded-xl transition-all duration-200"
              >
                <X size={20} />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Driver Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl shadow-lg ${isOnline
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                    {isOnline ? (
                      <Zap size={28} className="text-white" />
                    ) : (
                      <Power size={28} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Driver Dashboard</h2>
                    <p className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'
                      }`}>
                      {isOnline ? 'You are online and ready to accept rides' : 'Go online to start receiving ride requests'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <motion.button
                    onClick={async () => {
                      const newStatus = !isOnline;
                      setIsOnline(newStatus);
                      try {
                        await appRideAPI.updateDriverStatus({
                          isOnline: newStatus,
                          currentLat: 12.9716, // Default or fetch from navigator
                          currentLng: 77.5946
                        });
                      } catch (e) { console.error('Failed to change driver status', e); }
                    }}
                    className={`relative w-16 h-8 rounded-full flex items-center transition-all duration-300 shadow-lg ${isOnline ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-300'
                      }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className={`w-6 h-6 bg-white rounded-full shadow-md`}
                      animate={{ x: isOnline ? 38 : 4 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                  <span className={`text-sm font-bold uppercase tracking-wide ${isOnline ? 'text-green-600' : 'text-gray-500'
                    }`}>
                    {isOnline ? '● Online' : '○ Offline'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Active Ride */}
        <AnimatePresence>
          {activeRide && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="relative overflow-hidden border-0 shadow-xl">
                {/* Gradient top border */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                        <Car size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Active Ride</h3>
                        <div className="flex items-center mt-1 space-x-2">
                          <User size={16} className="text-gray-500" />
                          <p className="text-gray-600 font-medium">{activeRide.customer_info.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right bg-gradient-to-br from-green-50 to-emerald-50 px-5 py-3 rounded-xl border-2 border-green-200">
                      <div className="flex items-center justify-end space-x-1">
                        <DollarSign size={20} className="text-green-600" />
                        <p className="text-3xl font-bold text-green-700">₹{activeRide.estimated_fare}</p>
                      </div>
                      <p className="text-sm text-green-600 font-medium mt-1">{activeRide.distance_km} km</p>
                    </div>
                  </div>

                  {/* Navigation and Ride Details */}
                  <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-5 shadow-inner">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin size={18} className="text-green-600" />
                          <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wide">Pickup Location</h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium ml-6">
                          {activeRide.pickup_location?.address ||
                            activeRide.pickupLocation?.address ||
                            activeRide.pickup?.address ||
                            'Address not available'}
                        </p>
                      </div>
                      <Button
                        onClick={handleNavigateToCustomer}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ml-4"
                      >
                        <Navigation size={16} />
                        Navigate
                      </Button>
                    </div>
                    <div className="space-y-2 ml-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Phone size={14} />
                        <p className="font-medium">{activeRide.customer_info?.phone || '+91-XXXXXXXXXX'}</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Target size={14} className="mt-0.5" />
                        <p className="font-medium flex-1">
                          {activeRide.dropoff_location?.address ||
                            activeRide.dropoffLocation?.address ||
                            activeRide.destination?.address ||
                            'Destination address'}
                        </p>
                      </div>
                    </div>
                    {/* Debug info */}
                    <details className="mt-3 ml-6">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">Debug: Location Data</summary>
                      <pre className="text-xs text-gray-400 mt-2 overflow-auto bg-white p-2 rounded border border-gray-200">
                        {JSON.stringify(activeRide.pickup_location || activeRide.pickupLocation || activeRide.pickup, null, 2)}
                      </pre>
                    </details>
                  </div>

                  {/* OTP Validation */}
                  {activeRide.status === 'ACCEPTED' && !otpValidated && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 shadow-lg"
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <Shield size={20} className="text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-blue-900">Verify Customer OTP</h4>
                      </div>
                      <p className="text-sm text-blue-700 mb-4 ml-10 font-medium">
                        Ask the customer for their 4-digit OTP to confirm pickup
                      </p>
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          maxLength="4"
                          placeholder="• • • •"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-bold tracking-widest transition-all"
                        />
                        <Button
                          onClick={validateOtp}
                          disabled={loading || otpInput.length !== 4}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
                        >
                          {loading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                      </div>
                      {otpError && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-600 text-sm mt-3 ml-1 font-medium flex items-center space-x-1"
                        >
                          <AlertCircle size={14} />
                          <span>{otpError}</span>
                        </motion.p>
                      )}
                    </motion.div>
                  )}

                  {/* OTP Verified - Show Start Trip Button */}
                  {activeRide.status === 'ACCEPTED' && otpValidated && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 shadow-lg"
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="bg-green-600 p-2 rounded-lg">
                          <CheckCircle size={20} className="text-white" />
                        </div>
                        <p className="text-lg font-bold text-green-900">OTP Verified Successfully</p>
                      </div>
                      <p className="text-sm text-green-700 mb-4 ml-10 font-medium">
                        Customer pickup confirmed. You're ready to start the trip.
                      </p>
                      <Button
                        onClick={handleStartTrip}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 text-lg"
                      >
                        <Car size={20} />
                        <span>{loading ? 'Starting Trip...' : 'Start Trip'}</span>
                      </Button>
                    </motion.div>
                  )}

                  {/* Trip In Progress - Show Complete Trip Button */}
                  {activeRide.status === 'IN_PROGRESS' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 shadow-lg"
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg animate-pulse">
                          <Navigation size={20} className="text-white" />
                        </div>
                        <p className="text-lg font-bold text-amber-900">Trip In Progress</p>
                      </div>
                      <p className="text-sm text-amber-700 mb-4 ml-10 font-medium">
                        Drive safely to the destination. Complete the ride when you arrive.
                      </p>
                      <Button
                        onClick={handleCompleteRide}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 text-lg"
                      >
                        <Flag size={20} />
                        <span>{loading ? 'Completing...' : 'Complete Ride'}</span>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ride Requests */}
        {isOnline && !activeRide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Bell size={24} className="text-blue-600" />
                <span>Incoming Ride Requests</span>
                {rideRequests.length > 0 && (
                  <span className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                    {rideRequests.length}
                  </span>
                )}
              </h3>
            </div>

            {rideRequests.length === 0 ? (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-6"
                  >
                    <Navigation size={64} className="text-gray-300" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-gray-700 mb-2">Waiting for ride requests...</h4>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    New ride requests from nearby customers will appear here automatically when available
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 bg-blue-600 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-blue-600 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-blue-600 rounded-full"
                    />
                    <span className="ml-3 font-medium">Listening for requests...</span>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {rideRequests.map(renderRideRequest)}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* Offline Message */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="p-12 text-center">
                <div className="bg-gradient-to-br from-gray-400 to-gray-500 p-6 rounded-full inline-block mb-6 shadow-lg">
                  <Power size={56} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">You're Currently Offline</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Turn on your online status to start receiving ride requests from nearby customers and begin earning
                </p>
                <Button
                  onClick={() => setIsOnline(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 text-lg flex items-center space-x-2 mx-auto"
                >
                  <Zap size={20} />
                  <span>Go Online Now</span>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Safety Warning Modal */}
        <SafetyWarningModal
          isOpen={showSafetyModal}
          onClose={() => {
            setShowSafetyModal(false);
            if (safetyWarning) {
              const incidentId = safetyWarning.timestamp || Date.now();
              setAcknowledgedWarnings(prev => new Set([...prev, incidentId]));
            }
          }}
          incident={safetyWarning}
          rideWarningCount={currentRideWarningCount}
        />
      </div>
    </div>
  );
};
