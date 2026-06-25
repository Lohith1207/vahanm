import { Outlet, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  LayoutDashboard,
  Users, 
  Car, 
  MessageSquare,
  Shield,
  BarChart3,
  Settings
} from 'lucide-react';
import { LiveMonitor } from './LiveMonitor';
import { UserManagement } from './UserManagement';
import { DriverManagement } from './DriverManagement';
import { SupportTickets } from './SupportTickets';
import { SafetyIncidents } from './SafetyIncidents';
import { ReportsAnalytics } from './ReportsAnalytics';
import { SystemSettings } from './SystemSettings';

const sidebarItems = [
  { label: 'Live Monitor', path: '/admin', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Drivers', path: '/admin/drivers', icon: Car },
  { label: 'Support', path: '/admin/support', icon: MessageSquare },
  { label: 'Safety', path: '/admin/safety', icon: Shield },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export const AdminDashboard = () => {
  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="admin">
      <Routes>
        <Route path="/" element={<LiveMonitor />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/drivers" element={<DriverManagement />} />
        <Route path="/support" element={<SupportTickets />} />
        <Route path="/safety" element={<SafetyIncidents />} />
        <Route path="/reports" element={<ReportsAnalytics />} />
        <Route path="/settings" element={<SystemSettings />} />
      </Routes>
    </DashboardLayout>
  );
};
