import React, { useState } from 'react';
import { useData, Supplier } from '../../contexts/DataContext';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Search, Edit, Trash2, Users, Phone, Mail, MapPin } from 'lucide-react';

const SupplierManagement: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '' as string | undefined,
    address: '',
    totalDebt: 0,
    totalPaid: 0
  });

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      totalDebt: 0,
      totalPaid: 0
    });
    setEditingSupplier(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, { ...formData });
    } else {
      addSupplier({ ...formData });
    }
    resetForm();
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      totalDebt: supplier.totalDebt,
      totalPaid: supplier.totalPaid
    });
    setEditingSupplier(supplier);
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      deleteSupplier(id);
    }
  };

  const totalDebt = suppliers.reduce((sum, supplier) => sum + supplier.totalDebt, 0);
  const totalPaid = suppliers.reduce((sum, supplier) => sum + supplier.totalPaid, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموردين</h1>
          <p className="text-gray-600">إدارة الموردين والمدفوعات</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 space-x-reverse bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة مورد جديد</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الموردين</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المدفوعات</p>
              <p className="text-2xl font-bold text-green-600 ltr">{formatCurrency(totalPaid)}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الديون</p>
              <p className="text-2xl font-bold text-red-600 ltr">{formatCurrency(totalDebt)}</p>
            </div>
            <Users className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في الموردين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 ltr">{supplier.phone}</span>
              </div>
              {supplier.email && (
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 ltr">{supplier.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-3 space-x-reverse">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{supplier.address}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">المدفوع:</span>
                <span className="text-sm font-medium text-green-600 ltr">{formatCurrency(supplier.totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">المديونية:</span>
                <span className="text-sm font-medium text-red-600 ltr">{formatCurrency(supplier.totalDebt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Supplier Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المورد</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ltr"
                  placeholder="0555123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ltr"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المدفوع (دج)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.totalPaid}
                    onChange={(e) => setFormData({...formData, totalPaid: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المديونية (دج)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.totalDebt}
                    onChange={(e) => setFormData({...formData, totalDebt: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ltr"
                  />
                </div>
              </div>
              <div className="flex space-x-4 space-x-reverse pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  {editingSupplier ? 'تحديث' : 'إضافة'}
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

export default SupplierManagement;