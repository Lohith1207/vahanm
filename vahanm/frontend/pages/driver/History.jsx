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
  User,
  ChevronDown,
  ChevronUp,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { appRideAPI } from '../../services/api';

export const DriverHistory = () => {
  const [filter, setFilter] = useState('all'); // all, completed, cancelled
  const [expandedRide, setExpandedRide] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ride history from backend
  useEffect(() => {
    fetchRideHistory();
  }, []);

  const fetchRideHistory = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching driver ride history...');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const driverId = user.id || user.driver_id;
      if (!driverId) {
        console.warn("No driver context for history");
        setLoading(false);
        return;
      }

      const response = await appRideAPI.getDriverRideHistory(driverId);

      if (response.data && response.data.data) {
        const ridesList = response.data.data;
        console.log('✅ Driver history fetched:', ridesList);

        // Format rides for display
        const formattedRides = ridesList.map(ride => {
          const createdAt = new Date(ride.created_at);
          const completedAt = ride.completed_at ? new Date(ride.completed_at) : null;
          const cancelledAt = ride.cancelled_at ? new Date(ride.cancelled_at) : null;

          return {
            id: ride.id,
            date: formatDate(createdAt),
            time: createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            customer: `Customer ${ride.customer_id.substring(0, 8)}...`,
            customerRating: (Math.random() * 2 + 3).toFixed(1), // Mock for now
            pickup: ride.pickup_location?.address || 'Pickup Location',
            destination: ride.dropoff_location?.address || 'Destination',
            distance: `${(ride.distance_km || 0).toFixed(1)} km`,
            duration: `${Math.round(ride.estimated_duration_min || 0)} min`,
            fare: ride.estimated_fare || 0,
            tip: 0, // Mock for now
            status: ride.status,
            rating: null, // Mock for now
            feedback: null,
            completedAt: completedAt,
            cancelledAt: cancelledAt
          };
        });

        setRides(formattedRides);
      } else {
        console.warn('⚠️ Failed to fetch driver history, using empty array');
        setRides([]);
      }
    } catch (error) {
      console.error('❌ Error fetching driver history:', error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 0) return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredRides = rides.filter(ride =>
    filter === 'all' || ride.status === filter
  );

  // Stats
  const totalRides = rides.filter(r => r.status === 'completed').length;
  const totalEarnings = rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.fare + r.tip, 0);
  const avgRating = rides.filter(r => r.rating).length > 0
    ? (rides.filter(r => r.rating).reduce((sum, r) => sum + r.rating, 0) / rides.filter(r => r.rating).length).toFixed(1)
    : '0.0';
  const totalDistance = rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + parseFloat(r.distance), 0).toFixed(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading ride history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{totalRides}</div>
          <p className="text-sm text-gray-600">Total Rides</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">₹{totalEarnings}</div>
          <p className="text-sm text-gray-600">Total Earned</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-1">⭐ {avgRating}</div>
          <p className="text-sm text-gray-600">Avg Rating</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">{totalDistance}</div>
          <p className="text-sm text-gray-600">Distance (km)</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-semibold">Filter:</span>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Rides ({rides.length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'success' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completed ({rides.filter(r => r.status === 'completed').length})
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'danger' : 'outline'}
              size="sm"
              onClick={() => setFilter('cancelled')}
            >
              Cancelled ({rides.filter(r => r.status === 'cancelled').length})
            </Button>
          </div>
        </div>
      </Card>

      {/* Rides List */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="text-blue-600" size={24} />
          Last 30 Days
        </h3>

        {filteredRides.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Rides Found</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'You haven\'t completed any rides yet.'
                : filter === 'completed'
                  ? 'No completed rides found.'
                  : 'No cancelled rides found.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredRides.map((ride) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className={`p-5 ${ride.status === 'cancelled' ? 'bg-red-50 border-red-200' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${ride.status === 'completed' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                          {ride.customer.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{ride.customer}</p>
                          <p className="text-sm text-gray-600">⭐ {ride.customerRating} • {ride.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ₹{ride.fare + ride.tip}
                        </p>
                        {ride.tip > 0 && (
                          <p className="text-xs text-gray-600">+ ₹{ride.tip} tip</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Pickup</p>
                          <p className="font-medium text-gray-900">{ride.pickup}</p>
                        </div>
                      </div>
                      <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-4"></div>
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full mt-1"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Destination</p>
                          <p className="font-medium text-gray-900">{ride.destination}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{ride.distance}</span>
                        <span>•</span>
                        <span>{ride.duration}</span>
                        <span>•</span>
                        <span>{ride.date}</span>
                      </div>
                      {ride.status === 'completed' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedRide(expandedRide === ride.id ? null : ride.id)}
                        >
                          {expandedRide === ride.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          Details
                        </Button>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          Cancelled
                        </span>
                      )}
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedRide === ride.id && ride.status === 'completed' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t space-y-3">
                            <div className="flex items-center gap-2">
                              <Star className="text-yellow-500" size={20} />
                              <span className="font-semibold">Your Rating:</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={18}
                                    className={star <= ride.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                            </div>
                            {ride.feedback && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  <strong>Customer Feedback:</strong> "{ride.feedback}"
                                </p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-600">Base Fare</p>
                                <p className="font-semibold">₹{Math.round(ride.fare * 0.6)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Distance Charge</p>
                                <p className="font-semibold">₹{Math.round(ride.fare * 0.4)}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
