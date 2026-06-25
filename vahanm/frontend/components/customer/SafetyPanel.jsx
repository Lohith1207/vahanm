import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, AlertTriangle, Phone, Sparkles, Search, Send } from 'lucide-react';
import { SafetyActionCard } from './SafetyActionCard';
import { SafetySummaryCard } from './SafetySummaryCard';
import { useState } from 'react';
import { safetyApi } from '../../services/safetyApi';

export const SafetyPanel = ({ isOpen, onClose, driverId, rideId }) => {
  const [latestIncident, setLatestIncident] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastApiResponse, setLastApiResponse] = useState(null);

  const handleReportRashDriving = async () => {
    setLoading(true);
    try {
      // Generate mock speed data (in a real app, this would come from device sensors)
      const speedData = safetyApi.generateMockSpeedData(true);
      
      const actualDriverId = driverId;
      const actualRideId = rideId;
      
      console.log('🚗 Reporting rash driving:', {
        driverId: actualDriverId,
        rideId: actualRideId,
        speedData,
        speedDataLength: speedData.length
      });
      
      const result = await safetyApi.reportRashDriving(
        actualDriverId, 
        actualRideId,
        speedData
      );
      
      console.log('✅ Rash driving report result:', result);
      setLastApiResponse({
        type: 'Rash Driving',
        driverId: actualDriverId,
        severity: result.severity,
        warned: result.driver_warned
      });
      setLastApiResponse({
        type: 'Rash Driving',
        driverId: actualDriverId,
        rideId: actualRideId,
        severity: result.severity,
        warned: result.driver_warned,
        escalated: result.escalated
      });
      
      setLatestIncident({
        severity: result.severity,
        summary: result.details?.message || 'Rash driving incident reported successfully',
        timestamp: new Date().toLocaleTimeString(),
        recommendation: result.details?.action_taken || 'Driver has been notified'
      });

      // Get AI summary
      const aiResponse = await safetyApi.getSupportResponse(
        `Driver reported for rash driving with ${result.details?.violations_in_window || 0} violations. Speed ranged from ${Math.min(...speedData)} to ${Math.max(...speedData)} km/h.`
      );
      setAiSummary(aiResponse.reply);
      
    } catch (error) {
      console.error('❌ Error reporting rash driving:', error);
      console.error('Error details:', error.message, error.stack);
      setLatestIncident({
        severity: 'high',
        summary: `Failed to submit report: ${error.message}. Please check console for details.`,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportPhoneUsage = async () => {
    setLoading(true);
    try {
      const timestamps = safetyApi.generateMockPhoneTimestamps(3);
      
      const actualDriverId = driverId;
      const actualRideId = rideId;
      
      console.log('📱 Reporting phone usage:', {
        driverId: actualDriverId,
        rideId: actualRideId,
        timestamps
      });
      
      const result = await safetyApi.reportPhoneUsage(
        actualDriverId,
        actualRideId,
        timestamps
      );
      
      console.log('✅ Phone usage report result:', result);
      setLastApiResponse({
        type: 'Phone Usage',
        driverId: actualDriverId,
        severity: result.severity,
        warned: result.driver_warned
      });
      
      console.log('✅ Phone usage report result:', result);
      setLastApiResponse({
        type: 'Phone Usage',
        driverId: actualDriverId,
        rideId: actualRideId,
        severity: result.severity,
        warned: result.driver_warned,
        escalated: result.escalated
      });
      
      setLatestIncident({
        severity: result.severity,
        summary: result.details?.message || 'Phone usage incident reported successfully',
        timestamp: new Date().toLocaleTimeString(),
        recommendation: result.details?.action_taken || 'Driver has been notified'
      });

      // Get AI summary
      const aiResponse = await safetyApi.getSupportResponse(
        `Driver reported for phone usage while driving. ${result.details?.detections_count || 0} instances detected.`
      );
      setAiSummary(aiResponse.reply);
      
    } catch (error) {
      console.error('Error reporting phone usage:', error);
      setLatestIncident({
        severity: 'medium',
        summary: 'Failed to submit report. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      console.log('🔍 Searching knowledge base:', searchQuery);
      
      const response = await safetyApi.getSupportResponse(searchQuery);
      
      setAiSummary(response.reply);
      setLatestIncident({
        severity: 'low',
        summary: `Search results for: "${searchQuery}"`,
        timestamp: new Date().toLocaleTimeString(),
        recommendation: 'Knowledge base query completed'
      });
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      setAiSummary('Failed to search knowledge base. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 bottom-0 md:bottom-6 md:right-6 w-full md:w-[420px] h-[85vh] md:h-[600px] bg-white md:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border-t md:border border-gray-200"
          >
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-5 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">SAFETY COPILOT</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600 font-medium">AI ENGINE ACTIVE</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                <div className="font-medium text-blue-900">Safety Assistant is active for your ride. Your reports are monitored in real-time.</div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
              {/* Welcome Text */}
              {!latestIncident && !loading && (
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Welcome to the Safety assistant. I can help with safety concerns, incident reports, and emergency assistance during your ride.
                  </p>
                </div>
              )}

              {/* Quick Safety Actions */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <SafetyActionCard
                    icon={AlertTriangle}
                    title="Report Rash Driving"
                    description="Driver exceeding speed limits or driving aggressively"
                    onClick={handleReportRashDriving}
                    variant="danger"
                  />
                  <SafetyActionCard
                    icon={Phone}
                    title="Driver Using Phone"
                    description="Report unsafe phone usage while driving"
                    onClick={handleReportPhoneUsage}
                    variant="warning"
                  />
                </div>
              </section>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* Latest Incident */}
              {latestIncident && !loading && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Incident Status</h3>
                  <SafetySummaryCard incident={latestIncident} />
                </section>
              )}

              {/* AI Safety Summary */}
              {aiSummary && !loading && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    AI Analysis
                  </h3>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {aiSummary}
                    </p>
                  </div>
                </section>
              )}

              {/* Help Text */}
              {!latestIncident && !loading && !aiSummary && (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    No active safety incidents
                  </p>
                </div>
              )}

              {/* Search Bar */}
              <section className="sticky bottom-0 bg-white p-4 border-t border-gray-200 -mx-5 -mb-5">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ask Safety AI about your concerns..."
                        disabled={loading}
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !searchQuery.trim()}
                      className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 flex items-center justify-center text-white shadow-md hover:shadow-lg disabled:cursor-not-allowed transition-all duration-200 disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
