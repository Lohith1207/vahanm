import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const DashboardLayout = ({ children, sidebarItems, userRole }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar items={sidebarItems} userRole={userRole} />
      <div className="ml-64">
        <Navbar userRole={userRole} />
        <main className="pt-16 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
