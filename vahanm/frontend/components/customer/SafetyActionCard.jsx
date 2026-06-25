import { motion } from 'framer-motion';

export const SafetyActionCard = ({ icon: Icon, title, description, onClick, variant = 'default' }) => {
  const variants = {
    default: 'bg-white hover:bg-blue-50 border-gray-200',
    danger: 'bg-red-50 hover:bg-red-100 border-red-200',
    warning: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-xl border-2 ${variants[variant]} transition-all duration-200 text-left w-full group shadow-sm hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          variant === 'danger' ? 'bg-red-100 text-red-600' :
          variant === 'warning' ? 'bg-amber-100 text-amber-600' :
          'bg-blue-100 text-blue-600'
        } group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </motion.button>
  );
};
