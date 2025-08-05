import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { LogOut, Bell, Menu, AlertTriangle, Settings, X, Mail } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout, updateProfile, requestVerificationCode, error: authError } = useAuth();
  const { products } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [verificationForm, setVerificationForm] = useState({
    code: ''
  });
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const verificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
      if (verificationRef.current && !verificationRef.current.contains(event.target as Node)) {
        setShowVerification(false);
      }
    };

    if (showNotifications || showSettings || showVerification) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showSettings, showVerification]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);

    if (!settingsForm.email && !settingsForm.password) {
      setSettingsError('يرجى إدخال البريد الإلكتروني أو كلمة المرور');
      return;
    }

    if (settingsForm.password && settingsForm.password.length < 6) {
      setSettingsError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (settingsForm.password && settingsForm.password !== settingsForm.confirmPassword) {
      setSettingsError('كلمة المرور وتأكيد كلمة المرور غير متطابقين');
      return;
    }

    // Request verification code
    setIsRequestingCode(true);
    const success = await requestVerificationCode(
      settingsForm.email || undefined,
      settingsForm.password || undefined
    );

    console.log('Verification code request result:', success);
    if (success) {
      console.log('Closing settings modal and opening verification modal');
      setShowSettings(false);
      setShowVerification(true);
    } else {
      console.log('Failed to request verification code');
    }
    setIsRequestingCode(false);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (!verificationForm.code) {
      setVerificationError('يرجى إدخال رمز التحقق');
      return;
    }

    if (verificationForm.code.length !== 6) {
      setVerificationError('رمز التحقق يجب أن يكون 6 أرقام');
      return;
    }

    const success = await updateProfile(
      verificationForm.code,
      settingsForm.email || undefined,
      settingsForm.password || undefined
    );

    if (success) {
      setSettingsSuccess('تم تحديث الملف الشخصي بنجاح');
      setSettingsForm({ email: '', password: '', confirmPassword: '' });
      setVerificationForm({ code: '' });
      setShowVerification(false);
      setTimeout(() => {
        setSettingsSuccess(null);
      }, 2000);
    } else {
      setVerificationError('رمز التحقق غير صحيح أو منتهي الصلاحية');
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
      case 'critical': return 'حرج';
      case 'low': return 'منخفض';
      default: return 'جيد';
    }
  };

  const lowStockProducts = products.filter(product => 
    product.stock <= product.minStock * 2
  );

  const notificationCount = lowStockProducts.filter(product => 
    product.stock <= product.minStock
  ).length;

  return (
    <>
    <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
        <button
          onClick={onMenuClick}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
              <div className="ml-4 md:ml-0">
                <h1 className="text-xl font-semibold text-gray-900">نظام إدارة المخزون</h1>
              </div>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative" ref={notificationRef}>
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

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">تنبيهات المخزون</h3>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {lowStockProducts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          لا توجد منتجات منخفضة في المخزون
                        </div>
                      ) : (
                        lowStockProducts.map((product) => {
                          const status = getStockStatus(product.stock, product.minStock);
                          return (
                            <div key={product.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    المخزون الحالي: {product.stock} {product.unit}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    الحد الأدنى: {product.minStock} {product.unit}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                                    {getStatusText(status)}
                                  </span>
                                  {status === 'critical' && (
                                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                  )}
                                </div>
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
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="h-5 w-5" />
          </button>
          
          <button
                onClick={handleLogout}
            className="flex items-center space-x-2 space-x-reverse px-2 md:px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
            </div>
        </div>
      </div>
    </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6" ref={settingsRef}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">إعدادات الحساب</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              {(settingsError || authError) && (
                <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm">
                  {settingsError || authError}
                </div>
              )}

              {settingsSuccess && (
                <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm">
                  {settingsSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني الجديد (اختياري)
                </label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="أدخل البريد الإلكتروني الجديد"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور الجديدة (اختياري)
                </label>
                <input
                  type="password"
                  value={settingsForm.password}
                  onChange={(e) => setSettingsForm({...settingsForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="أدخل كلمة المرور الجديدة"
                  autoComplete="new-password"
                />
              </div>

              {settingsForm.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={settingsForm.confirmPassword}
                    onChange={(e) => setSettingsForm({...settingsForm, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="أعد إدخال كلمة المرور"
                    autoComplete="new-password"
                  />
                </div>
              )}

              <div className="flex space-x-4 space-x-reverse pt-4">
                <button
                  type="submit"
                  disabled={isRequestingCode}
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequestingCode ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {console.log('showVerification state:', showVerification)}
      {showVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6" ref={verificationRef}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">رمز التحقق</h2>
              <button
                onClick={() => setShowVerification(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <Mail className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                تم إرسال رمز التحقق إلى:
              </p>
              <p className="font-medium text-gray-900">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                يرجى إدخال الرمز المكون من 6 أرقام
              </p>
            </div>

            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              {verificationError && (
                <div className="bg-red-100 text-red-800 p-3 rounded-lg text-sm">
                  {verificationError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رمز التحقق
                </label>
                <input
                  type="text"
                  value={verificationForm.code}
                  onChange={(e) => setVerificationForm({...verificationForm, code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-4 space-x-reverse pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  تأكيد التحديث
                </button>
                <button
                  type="button"
                  onClick={() => setShowVerification(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;