import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Shield } from 'lucide-react';
import { useEffect } from 'react';

export const SafetyWarningModal = ({ isOpen, onClose, incident, rideWarningCount = 0 }) => {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!incident) return null;

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'medium':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          badge: 'bg-amber-100 text-amber-800',
          button: 'bg-amber-600 hover:bg-amber-700'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const colors = getSeverityColor(incident.severity);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
          >
            <div className={`${colors.bg} ${colors.border} border-2 rounded-2xl shadow-2xl overflow-hidden`}>
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 ${colors.badge} rounded-xl`}>
                      <AlertTriangle className={`w-8 h-8 ${colors.icon}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Safety Warning</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-3 py-1 ${colors.badge} text-xs font-semibold rounded-full uppercase`}>
                          {incident.severity} Severity
                        </span>
                        {rideWarningCount > 0 && (
                          <span className="inline-block px-3 py-1 bg-gray-700 text-white text-xs font-semibold rounded-full">
                            Warning #{rideWarningCount} this ride
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Warning Message */}
                <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Incident Report
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {incident.data?.ai_summary?.summary || 
                     incident.ai_summary?.summary || 
                     'You have received a safety warning. Please drive safely and follow all traffic rules.'}
                  </p>
                </div>

                {/* Details */}
                {incident.data?.metrics && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">Details:</h4>
                    {incident.data.metrics.sudden_spikes_count !== undefined && (
                      <p className="text-xs text-gray-600">
                        • Sudden speed changes: {incident.data.metrics.sudden_spikes_count}
                      </p>
                    )}
                    {incident.data.metrics.max_speed_kmh !== undefined && (
                      <p className="text-xs text-gray-600">
                        • Maximum speed: {incident.data.metrics.max_speed_kmh} km/h
                      </p>
                    )}
                    {incident.data.metrics.average_speed_kmh !== undefined && (
                      <p className="text-xs text-gray-600">
                        • Average speed: {incident.data.metrics.average_speed_kmh} km/h
                      </p>
                    )}
                    {incident.data.phone_detections !== undefined && (
                      <p className="text-xs text-gray-600">
                        • Phone usage detections: {incident.data.phone_detections}
                      </p>
                    )}
                    {incident.type && (
                      <p className="text-xs text-gray-600">
                        • Incident type: {incident.type.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                )}

                {/* AI Recommendation */}
                {(incident.data?.ai_summary?.recommended_action || incident.ai_summary?.recommended_action) && (
                  <div className="mt-4 bg-white rounded-xl p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Recommended Action:</h4>
                    <p className="text-xs text-gray-700">
                      {incident.data?.ai_summary?.recommended_action || incident.ai_summary?.recommended_action}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 pt-0">
                <button
                  onClick={onClose}
                  className={`w-full ${colors.button} text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg`}
                >
                  I Understand
                </button>
                <p className="mt-3 text-xs text-gray-600 text-center">
                  This warning will auto-dismiss in 5 seconds. Repeated violations may result in account suspension.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
