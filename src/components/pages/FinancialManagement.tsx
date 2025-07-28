import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Edit, Trash2 } from 'lucide-react';

const FinancialManagement: React.FC = () => {
  const { addTransaction, updateTransaction, deleteTransaction, getDailyReport, getMonthlyReport } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'sale' as 'sale' | 'purchase' | 'expense',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  let dailyReport, monthlyReport, currentReport;
  try {
    dailyReport = getDailyReport();
    monthlyReport = getMonthlyReport();
    currentReport = selectedPeriod === 'today' ? dailyReport : monthlyReport;
  } catch (err: any) {
    dailyReport = monthlyReport = currentReport = { sales: 0, purchases: 0, expenses: 0, netProfit: 0, transactions: [] };
  }

  const resetForm = () => {
    setFormData({
      type: 'sale',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
    setEditingTransaction(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        updateTransaction(editingTransaction.id, {
          ...formData,
          date: new Date(formData.date)
        });
      } else {
        addTransaction({
          ...formData,
          date: new Date(formData.date)
        });
      }
      resetForm();
    } catch (err: any) {
      setError('تعذر إضافة/تحديث المعاملة.');
    }
  };

  const handleEdit = (transaction: any) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
    setEditingTransaction(transaction);
    setShowAddForm(true);
    setError(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
      deleteTransaction(id);
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-100 text-green-800';
      case 'purchase': return 'bg-blue-100 text-blue-800';
      case 'expense': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionText = (type: string) => {
    switch (type) {
      case 'sale': return 'مبيعات';
      case 'purchase': return 'مشتريات';
      case 'expense': return 'مصروفات';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center font-bold">
          {error}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإدارة المالية</h1>
          <p className="text-gray-600">إدارة المبيعات والمشتريات والمصروفات</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 space-x-reverse bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة معاملة جديدة</span>
        </button>
      </div>
      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="today">اليوم</option>
            <option value="month">هذا الشهر</option>
          </select>
        </div>
      </div>
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المبيعات</p>
              <p className="text-2xl font-bold text-green-600 ltr">{formatCurrency(currentReport.sales)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المشتريات</p>
              <p className="text-2xl font-bold text-blue-600 ltr">{formatCurrency(currentReport.purchases)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المصروفات</p>
              <p className="text-2xl font-bold text-red-600 ltr">{formatCurrency(currentReport.expenses)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">صافي الربح</p>
              <p className={`text-2xl font-bold ${currentReport.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="ltr">{formatCurrency(currentReport.netProfit)}</span>
              </p>
            </div>
            <div className={`p-3 rounded-full ${currentReport.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {currentReport.netProfit >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">المعاملات الأخيرة</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">النوع</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">الوصف</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">المبلغ</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">التاريخ</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentReport.transactions.map((transaction: any) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionColor(transaction.type)}`}>
                      {getTransactionText(transaction.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Transaction Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editingTransaction ? 'تعديل المعاملة' : 'إضافة معاملة جديدة'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع المعاملة</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'sale' | 'purchase' | 'expense'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="sale">مبيعات</option>
                  <option value="purchase">مشتريات</option>
                  <option value="expense">مصروفات</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="وصف المعاملة..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (دج)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ltr"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex space-x-4 space-x-reverse pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  {editingTransaction ? 'تحديث المعاملة' : 'إضافة المعاملة'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;