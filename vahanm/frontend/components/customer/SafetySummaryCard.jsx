import { Clock, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const SafetySummaryCard = ({ incident }) => {
  if (!incident) return null;

  const severityConfig = {
    low: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Low'
    },
    medium: {
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertCircle,
      label: 'Medium'
    },
    high: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertTriangle,
      label: 'High'
    }
  };

  const config = severityConfig[incident.severity] || severityConfig.low;
  const SeverityIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color} border flex items-center gap-1`}>
            <SeverityIcon className="w-3 h-3" />
            {config.label} Severity
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {incident.timestamp}
        </div>
      </div>
      
      <p className="text-sm text-gray-700 leading-relaxed mb-3">
        {incident.summary}
      </p>
      
      {incident.recommendation && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <p className="text-xs font-medium text-blue-900 mb-1">Recommendation</p>
          <p className="text-xs text-blue-700">{incident.recommendation}</p>
        </div>
      )}
    </motion.div>
  );
};
