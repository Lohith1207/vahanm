import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DriverHome } from './Home';
import { DriverEarnings } from './Earnings';
import { VehicleManagement } from './VehicleManagement';
import { Subscriptions } from './Subscriptions';
import { DriverHistory } from './History';
import { DriverNotifications } from './Notifications';
import {
  Home,
  DollarSign,
  Car,
  Crown,
  Clock,
  Bell,
  User
} from 'lucide-react';

const sidebarItems = [
  { label: 'Home', path: '/driver', icon: Home },
  { label: 'Earnings', path: '/driver/earnings', icon: DollarSign },
  { label: 'Vehicle', path: '/driver/vehicle', icon: Car },
  { label: 'Subscriptions', path: '/driver/subscriptions', icon: Crown },
  { label: 'History', path: '/driver/history', icon: Clock },
  { label: 'Notifications', path: '/driver/notifications', icon: Bell },
  { label: 'Profile', path: '/driver/profile', icon: User },
];

export const DriverDashboard = () => {
  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="driver">
      <Routes>
        <Route path="/" element={<DriverHome />} />
        <Route path="/earnings" element={<DriverEarnings />} />
        <Route path="/vehicle" element={<VehicleManagement />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/history" element={<DriverHistory />} />
        <Route path="/notifications" element={<DriverNotifications />} />
        <Route path="/profile" element={<DriverHome />} />
      </Routes>
    </DashboardLayout>
  );
};
