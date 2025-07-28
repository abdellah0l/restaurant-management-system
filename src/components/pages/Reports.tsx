import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Download, FileText, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { generatePDFReport } from '../../utils/pdfGenerator';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
  const { products, suppliers, employees, getDailyReport, getMonthlyReport } = useData();
  const [selectedReport, setSelectedReport] = useState('daily');

  const dailyReport = getDailyReport();
  const monthlyReport = getMonthlyReport();

  // Generate chart data
  const financialData = [
    { name: 'المبيعات', daily: dailyReport.sales, monthly: monthlyReport.sales },
    { name: 'المشتريات', daily: dailyReport.purchases, monthly: monthlyReport.purchases },
    { name: 'المصروفات', daily: dailyReport.expenses, monthly: monthlyReport.expenses }
  ];

  const profitData = [
    { name: 'اليوم', profit: dailyReport.netProfit },
    { name: 'الشهر', profit: monthlyReport.netProfit }
  ];

  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += product.stock * product.price;
    } else {
      acc.push({ name: product.category, value: product.stock * product.price });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Export to PDF
  const exportToPDF = () => {
    const report = selectedReport === 'daily' ? dailyReport : monthlyReport;
    generatePDFReport(report, selectedReport as 'daily' | 'monthly');
  };

  // Export to Excel
  const exportToExcel = () => {
    const report = selectedReport === 'daily' ? dailyReport : monthlyReport;
    const title = selectedReport === 'daily' ? 'تقرير يومي' : 'تقرير شهري';
    
    const summaryData = [
      ['البيان', 'المبلغ'],
      ['المبيعات', `${report.sales.toLocaleString()} دج`],
      ['المشتريات', `${report.purchases.toLocaleString()} دج`],
      ['المصروفات', `${report.expenses.toLocaleString()} دج`],
      ['صافي الربح', `${report.netProfit.toLocaleString()} دج`]
    ];
    
    const transactionsData = [
      ['الوصف', 'المبلغ', 'النوع', 'التاريخ'],
      ...report.transactions.map((t: any) => [
        t.description,
        `${t.amount.toLocaleString()} دج`,
        t.type === 'sale' ? 'مبيعات' : t.type === 'purchase' ? 'مشتريات' : 'مصروفات',
        formatDate(t.date)
      ])
    ];
    
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    const ws2 = XLSX.utils.aoa_to_sheet(transactionsData);
    
    XLSX.utils.book_append_sheet(wb, ws1, 'ملخص');
    XLSX.utils.book_append_sheet(wb, ws2, 'المعاملات');
    
    XLSX.writeFile(wb, `${title}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
          <p className="text-gray-600">تقارير مالية وإحصائيات شاملة</p>
        </div>
        <div className="flex space-x-4 space-x-reverse">
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 space-x-reverse bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>تصدير PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 space-x-reverse bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="daily">التقرير اليومي</option>
            <option value="monthly">التقرير الشهري</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المبيعات</p>
              <p className="text-2xl font-bold text-green-600">
                <span className="ltr">{formatCurrency(selectedReport === 'daily' ? dailyReport.sales : monthlyReport.sales)}</span>
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المشتريات</p>
              <p className="text-2xl font-bold text-blue-600">
                <span className="ltr">{formatCurrency(selectedReport === 'daily' ? dailyReport.purchases : monthlyReport.purchases)}</span>
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المصروفات</p>
              <p className="text-2xl font-bold text-red-600">
                <span className="ltr">{formatCurrency(selectedReport === 'daily' ? dailyReport.expenses : monthlyReport.expenses)}</span>
              </p>
            </div>
            <FileText className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">صافي الربح</p>
              <p className={`text-2xl font-bold ${
                (selectedReport === 'daily' ? dailyReport.netProfit : monthlyReport.netProfit) >= 0 
                  ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className="ltr">{formatCurrency(selectedReport === 'daily' ? dailyReport.netProfit : monthlyReport.netProfit)}</span>
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الأداء المالي</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey={selectedReport === 'daily' ? 'daily' : 'monthly'} fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">اتجاه الربح</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع قيمة المخزون حسب الفئة</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Key Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات رئيسية</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">عدد المنتجات</span>
              <span className="text-lg font-bold text-blue-600">{products.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">عدد الموردين</span>
              <span className="text-lg font-bold text-green-600">{suppliers.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-600">عدد الموظفين</span>
              <span className="text-lg font-bold text-purple-600">{employees.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-gray-600">قيمة المخزون الإجمالية</span>
              <span className="text-lg font-bold text-orange-600 ltr">
                {formatCurrency(products.reduce((sum, p) => sum + (p.stock * p.price), 0))}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-600">إجمالي ديون الموردين</span>
              <span className="text-lg font-bold text-red-600 ltr">
                {formatCurrency(suppliers.reduce((sum, s) => sum + s.totalDebt, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          تفاصيل {selectedReport === 'daily' ? 'التقرير اليومي' : 'التقرير الشهري'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">الوصف</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">النوع</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">المبلغ</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(selectedReport === 'daily' ? dailyReport.transactions : monthlyReport.transactions).map((transaction: any) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'sale' ? 'bg-green-100 text-green-800' :
                      transaction.type === 'purchase' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'sale' ? 'مبيعات' : 
                       transaction.type === 'purchase' ? 'مشتريات' : 'مصروفات'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
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

export default Reports;