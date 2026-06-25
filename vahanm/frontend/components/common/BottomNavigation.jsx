import { NavLink, useLocation } from 'react-router-dom';
import { Home, Truck, Package, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/customer', icon: Home, label: 'Home' },
    { path: '/customer/services', icon: Truck, label: 'Services' },
    { path: '/customer/tracking', icon: Package, label: 'Track' },
    { path: '/customer/support', icon: MessageSquare, label: 'Support' },
    { path: '/customer/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <item.icon 
                  size={24} 
                  className={isActive ? 'text-blue-600' : 'text-gray-500'}
                />
                <span className={`text-xs mt-1 ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </motion.div>
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-b-full"
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
