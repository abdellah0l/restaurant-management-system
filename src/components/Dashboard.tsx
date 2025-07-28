import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import DashboardHome from './pages/DashboardHome';
import StockManagement from './pages/StockManagement';
import SupplierManagement from './pages/SupplierManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import FinancialManagement from './pages/FinancialManagement';
import Reports from './pages/Reports';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/stock" element={<StockManagement />} />
            <Route path="/suppliers" element={<SupplierManagement />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/financial" element={<FinancialManagement />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;