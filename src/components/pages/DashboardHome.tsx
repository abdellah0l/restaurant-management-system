import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  UserCheck, 
  AlertTriangle,
  DollarSign,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const   DashboardHome: React.FC = () => {
  const { products, suppliers, employees, getDailyReport, getMonthlyReport } = useData();
  const { user } = useAuth();

  const dailyReport = getDailyReport();
  const monthlyReport = getMonthlyReport();

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const totalDebt = suppliers.reduce((sum, supplier) => sum + supplier.totalDebt, 0);

  const monthlyData = [
    { name: 'المبيعات', value: monthlyReport.sales },
    { name: 'المشتريات', value: monthlyReport.purchases },
    { name: 'المصروفات', value: monthlyReport.expenses }
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center">
          {trend > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(trend)}%
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 md:p-6 text-white">
        <h1 className="text-xl md:text-3xl font-bold mb-2">مرحباً بك في نظام إدارة المطعم</h1>
        <p className="text-emerald-100">
          مرحباً {user?.name}، هنا ملخص شامل لأداء المطعم اليوم
        </p>
        <div className="mt-4 flex items-center space-x-4 space-x-reverse">
          <Calendar className="h-5 w-5" />
          <span>{new Date().toLocaleDateString('ar-EG')}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="مبيعات اليوم" 
          value={formatCurrency(dailyReport.sales)}
          icon={TrendingUp}
          color="bg-green-500"
          trend={5}
        />
        <StatCard
          title="المشتريات اليوم"
          value={formatCurrency(dailyReport.purchases)}
          icon={Package}
          color="bg-blue-500"
          trend={-2}
        />
        <StatCard
          title="صافي الربح اليوم"
          value={formatCurrency(dailyReport.netProfit)}
          icon={DollarSign}
          color={dailyReport.netProfit >= 0 ? "bg-green-500" : "bg-red-500"}
        />
        <StatCard
          title="إجمالي الديون"
          value={formatCurrency(totalDebt)}
          icon={AlertTriangle}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">التقرير المالي الشهري</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={monthlyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">الأداء المالي</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">منتجات قاربت على النفاد</h3>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
                <div className="text-left ltr">
                  <p className="text-sm font-medium text-orange-600">{product.stock} {product.unit}</p>
                  <p className="text-xs text-gray-500">الحد الأدنى: {product.minStock}</p>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="text-center text-gray-500 py-4">جميع المنتجات في حالة جيدة</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">الموردين</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {suppliers.slice(0, 5).map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{supplier.name}</p>
                  <p className="text-sm text-gray-600">{supplier.phone}</p>
                </div>
                <div className="text-left ltr">
                  <p className="text-sm font-medium text-blue-600">{formatCurrency(supplier.totalDebt)}</p>
                  <p className="text-xs text-gray-500">مديونية</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">الموظفين</h3>
            <UserCheck className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {employees.slice(0, 5).map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{employee.name}</p>
                  <p className="text-sm text-gray-600">{employee.position}</p>
                </div>
                <div className="text-left ltr">
                  <p className="text-sm font-medium text-green-600">{formatCurrency(employee.salary + employee.bonus - employee.advances - employee.penalties)}</p>
                  <p className="text-xs text-gray-500">الراتب الصافي</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">المعاملات الأخيرة</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 md:px-4 py-2 text-right text-xs md:text-sm font-medium text-gray-700">النوع</th>
                <th className="px-2 md:px-4 py-2 text-right text-xs md:text-sm font-medium text-gray-700">الوصف</th>
                <th className="px-2 md:px-4 py-2 text-right text-xs md:text-sm font-medium text-gray-700">المبلغ</th>
                <th className="px-2 md:px-4 py-2 text-right text-xs md:text-sm font-medium text-gray-700">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {dailyReport.transactions.slice(0, 5).map((transaction: any) => (
                <tr key={transaction.id} className="border-b border-gray-100">
                  <td className="px-2 md:px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'sale' ? 'bg-green-100 text-green-800' :
                      transaction.type === 'purchase' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'sale' ? 'مبيعات' : 
                       transaction.type === 'purchase' ? 'مشتريات' : 'مصروفات'}
                    </span>
                  </td>
                  <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-2 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-900 ">{formatCurrency(transaction.amount)}</td>
                  <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-gray-600">
                    {formatDate(transaction.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;