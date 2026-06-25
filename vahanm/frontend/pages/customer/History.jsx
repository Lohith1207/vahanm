import { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Clock,
  MapPin,
  Star,
  DollarSign,
  Calendar,
  Filter,
  Download,
  MessageSquare,
  ThumbsUp,
  User,
  Loader
} from 'lucide-react';
import { motion } from 'framer-motion';
import { appRideAPI } from '../../services/api';

export const History = () => {
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState('all'); // all, completed, cancelled
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ride history on component mount
  useEffect(() => {
    fetchRideHistory();
  }, []);

  const fetchRideHistory = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching ride history...');

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user.customer_id;
      if (!userId) {
        console.warn("No user context for history");
        setLoading(false);
        return;
      }

      const response = await appRideAPI.getCustomerRideHistory(userId);

      if (response.data && response.data.data) {
        const ridesList = response.data.data;
        console.log('✅ Ride history fetched:', ridesList);

        // Format rides for display
        const formattedRides = ridesList.map(ride => ({
          id: ride.id,
          date: formatDate(ride.created_at),
          from: ride.pickup_location?.address || 'Unknown',
          to: ride.dropoff_location?.address || 'Unknown',
          driver: 'Driver', // Will be populated when driver info is available
          driverPhoto: '👨‍✈️',
          vehicle: ride.ride_type || 'Car',
          fare: ride.estimated_fare || ride.fare || 0,
          distance: ride.distance_km ? `${ride.distance_km.toFixed(1)} km` : 'N/A',
          duration: ride.estimated_duration_min ? `${Math.round(ride.estimated_duration_min)} min` : 'N/A',
          status: ride.status,
          rating: 0,
          paymentMethod: 'Wallet',
          created_at: ride.created_at,
          completed_at: ride.completed_at,
          cancelled_at: ride.cancelled_at
        }));

      } else {
        console.error('Failed to fetch ride history');
        setRides([]);
      }
    } catch (error) {
      console.error('❌ Error fetching ride history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const filteredRides = rides.filter(ride =>
    filter === 'all' || ride.status === filter
  );

  const handleRateRide = (ride) => {
    setSelectedRide(ride);
    setRating(ride.rating || 0);
    setShowRating(true);
  };

  const submitRating = () => {
    console.log('Rating submitted:', { rideId: selectedRide.id, rating, feedback });
    setShowRating(false);
    setRating(0);
    setFeedback('');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading ride history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Total Rides</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{rides.length}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Total Spent</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{rides.reduce((sum, ride) => sum + ride.fare, 0)}
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center gap-3 mb-2">
            <Star className="text-yellow-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Avg Rating</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">4.7</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="text-purple-600" size={24} />
            <span className="text-sm font-medium text-gray-600">Distance</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">142 km</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <div className="flex gap-2">
              {['all', 'completed', 'cancelled'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" icon={Download}>
            Export
          </Button>
        </div>
      </Card>

      {/* Ride History */}
      <div className="space-y-4">
        {filteredRides.map((ride, index) => (
          <motion.div
            key={ride.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hoverable className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">{ride.date}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ride.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {ride.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="font-semibold text-gray-900">{ride.from}</span>
                    </div>
                    <div className="ml-1 border-l-2 border-dashed border-gray-300 h-6"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span className="font-semibold text-gray-900">{ride.to}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 mb-1">₹{ride.fare}</p>
                  <p className="text-sm text-gray-500">{ride.paymentMethod}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{ride.driverPhoto}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{ride.driver}</p>
                    <p className="text-sm text-gray-600">{ride.vehicle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <p className="text-sm text-gray-600">{ride.distance}</p>
                    <p className="text-sm text-gray-600">{ride.duration}</p>
                  </div>

                  {ride.status === 'completed' && (
                    <>
                      {ride.rating > 0 ? (
                        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-2 rounded-lg">
                          <Star className="text-yellow-500 fill-yellow-500" size={16} />
                          <span className="font-semibold text-gray-900">{ride.rating}</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRateRide(ride)}
                          icon={Star}
                        >
                          Rate
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Rating Modal */}
      <Modal
        isOpen={showRating}
        onClose={() => setShowRating(false)}
        title="Rate Your Ride"
        size="md"
      >
        {selectedRide && (
          <div className="space-y-6">
            {/* Driver Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-4xl">{selectedRide.driverPhoto}</div>
              <div>
                <p className="font-bold text-gray-900">{selectedRide.driver}</p>
                <p className="text-sm text-gray-600">{selectedRide.vehicle}</p>
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Rate your experience</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Feedback Tags */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">What went well?</p>
              <div className="flex flex-wrap gap-2">
                {['Clean Car', 'Safe Driving', 'Polite', 'On Time', 'Good Music'].map((tag) => (
                  <button
                    key={tag}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <ThumbsUp size={14} className="inline mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your experience..."
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={submitRating}
              disabled={rating === 0}
            >
              Submit Rating
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
