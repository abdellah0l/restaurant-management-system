import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { LogOut, Bell, Menu, Package, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { products } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'المدير';
      case 'cashier': return 'الكاشير';
      case 'server': return 'الخادم';
      default: return role;
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return 'critical';
    if (stock <= minStock * 2) return 'low';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical': return 'نافد';
      case 'low': return 'منخفض';
      default: return 'جيد';
    }
  };

  const lowStockProducts = products.filter(product => {
    const status = getStockStatus(product.stock, product.minStock);
    return status === 'low' || status === 'critical';
  });

  const notificationCount = lowStockProducts.length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-3 md:px-6 py-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-4 space-x-reverse">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            مرحباً، {user?.email}
          </h2>
          <span className="hidden sm:inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
            المستخدم
          </span>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="hidden md:flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute left-[-100px] mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50" ref={notificationRef}>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">التنبيهات</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    المنتجات ذات المخزون المنخفض
                  </p>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {lowStockProducts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>لا توجد منتجات منخفضة المخزون</p>
                    </div>
                  ) : (
                    lowStockProducts.map((product) => {
                      const status = getStockStatus(product.stock, product.minStock);
                      return (
                        <div key={product.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 space-x-reverse mb-1">
                                <h4 className="font-medium text-gray-900">{product.name}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                  {getStatusText(status)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                الفئة: {product.category}
                              </p>
                              <div className="flex items-center space-x-4 space-x-reverse text-sm">
                                <span className="text-gray-600">
                                  المخزون: <span className="font-medium">{product.stock} {product.unit}</span>
                                </span>
                                <span className="text-gray-600">
                                  الحد الأدنى: <span className="font-medium">{product.minStock} {product.unit}</span>
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                السعر: {formatCurrency(product.price)}
                              </p>
                            </div>
                            {status === 'critical' && (
                              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {lowStockProducts.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm text-gray-600 text-center">
                      إجمالي المنتجات المنخفضة: {lowStockProducts.length}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 space-x-reverse px-2 md:px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;