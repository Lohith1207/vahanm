import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { CustomerHome } from './Home';
import { RideTracking } from './RideTracking';
import { Payments } from './Payments';
import { History } from './History';
import { Support } from './Support';
import { Safety } from './Safety'; // Import Safety component
import { Services } from './Services';
import { Offers } from './Offers';
import {
  Home,
  Car,
  Clock,
  CreditCard,
  MapPin,
  Shield,
  Gift,
  User,
  Truck,
  MessageSquare
} from 'lucide-react';

const sidebarItems = [
  { label: 'Home', path: '/customer', icon: Home },
  { label: 'Track Ride', path: '/customer/tracking', icon: Car },
  { label: 'Services', path: '/customer/services', icon: Truck },
  { label: 'Payments', path: '/customer/payments', icon: CreditCard },
  { label: 'History', path: '/customer/history', icon: Clock },
  { label: 'Support', path: '/customer/support', icon: MessageSquare },
  { label: 'Offers', path: '/customer/offers', icon: Gift },
  { label: 'Safety', path: '/customer/safety', icon: Shield },
];

export const CustomerDashboard = () => {
  return (
    <>
      <DashboardLayout sidebarItems={sidebarItems} userRole="customer">
        <Routes>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/tracking" element={<RideTracking />} />
          <Route path="/services" element={<Services />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/history" element={<History />} />
          <Route path="/support" element={<Support />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/profile" element={<CustomerHome />} />
        </Routes>
      </DashboardLayout>
      <BottomNavigation />
    </>
  );
};
