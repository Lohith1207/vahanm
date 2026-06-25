import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useState } from 'react';

export const SafetyFloatingButton = ({ onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg"
        >
          Safety Assistant
          <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </motion.div>
      )}

      {/* Floating Button */}
      <motion.button
        onClick={onClick}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center group"
      >
        {/* Ripple Effect */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-blue-400"
        />
        
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>

        {/* Icon */}
        <Shield className="w-7 h-7 relative z-10" />

        {/* Badge (optional notification dot) */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
        />
      </motion.button>
    </div>
  );
};
