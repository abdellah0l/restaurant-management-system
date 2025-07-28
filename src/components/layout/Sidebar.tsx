import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Users, 
  UserCheck, 
  DollarSign, 
  FileText,
  ChefHat,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'الرئيسية' },
    { path: '/dashboard/stock', icon: Package, label: 'إدارة المخزون' },
    { path: '/dashboard/suppliers', icon: Users, label: 'إدارة الموردين' },
    { path: '/dashboard/employees', icon: UserCheck, label: 'إدارة الموظفين' },
    { path: '/dashboard/financial', icon: DollarSign, label: 'الإدارة المالية' },
    { path: '/dashboard/reports', icon: FileText, label: 'التقارير' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">القائمة</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">إدارة المطعم</h1>
              <p className="text-sm text-gray-600">نظام متكامل</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 space-x-reverse px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-emerald-100 text-emerald-700 border-l-4 border-emerald-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;