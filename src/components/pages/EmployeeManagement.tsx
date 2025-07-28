import React, { useState } from 'react';
import { useData, Employee } from '../../contexts/DataContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Search, Edit, Trash2, UserCheck, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const EmployeeManagement: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    position: '',
    salary: 0,
    advances: 0,
    bonus: 0,
    penalties: 0,
    hireDate: new Date().toISOString().split('T')[0]
  });

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    // calculateNetSalary(); // This line is removed as per the edit hint
  }, [formData.salary, formData.advances, formData.bonus, formData.penalties]);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      position: '',
      salary: 0,
      advances: 0,
      bonus: 0,
      penalties: 0,
      hireDate: new Date().toISOString().split('T')[0]
    });
    setEditingEmployee(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employeeData = {
      ...formData,
      hireDate: new Date(formData.hireDate)
    };
    
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
    } else {
      addEmployee(employeeData as Omit<Employee, "id">);
    }
    resetForm();
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name,
     phone: employee.phone,
      position: employee.position,
      salary: employee.salary,
      advances: employee.advances,
      bonus: employee.bonus,
      penalties: employee.penalties,
      hireDate: employee.hireDate.toISOString().split('T')[0]
    });
    setEditingEmployee(employee);
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      deleteEmployee(id);
    }
  };

  const totalSalaries = employees.reduce((sum, emp) => sum + (typeof emp.salary === 'number' && !isNaN(emp.salary) ? emp.salary : 0), 0);
  const totalNetSalaries = employees.reduce((sum, emp) => sum + (typeof emp.netSalary === 'number' && !isNaN(emp.netSalary) ? emp.netSalary : 0), 0);
  const totalAdvances = employees.reduce((sum, emp) => sum + (typeof emp.advances === 'number' && !isNaN(emp.advances) ? emp.advances : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموظفين</h1>
          <p className="text-gray-600">إدارة الموظفين والرواتب</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 space-x-reverse bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الموظفين</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الرواتب</p>
              <p className="text-2xl font-bold text-green-600 ltr">{formatCurrency(totalSalaries)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الرواتب الصافية</p>
              <p className="text-2xl font-bold text-purple-600 ltr">{formatCurrency(totalNetSalaries)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">السلف المدفوعة</p>
              <p className="text-2xl font-bold text-orange-600 ltr">{formatCurrency(totalAdvances)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في الموظفين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">اسم الموظف</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">رقم الهاتف</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">المنصب</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">الراتب الأساسي</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">السلف</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">البونص</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">الخصومات</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">الراتب الصافي</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">تاريخ التوظيف</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 ltr">{employee.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{employee.position}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 ltr">{formatCurrency(employee.salary)}</td>
                  <td className="px-6 py-4 text-sm text-red-600 ltr">{formatCurrency(employee.advances)}</td>
                  <td className="px-6 py-4 text-sm text-green-600 ltr">{formatCurrency(employee.bonus)}</td>
                  <td className="px-6 py-4 text-sm text-red-600 ltr">{formatCurrency(employee.penalties)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600 ltr">{formatCurrency(typeof employee.netSalary === 'number' && !isNaN(employee.netSalary) ? employee.netSalary : 0)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(employee.hireDate)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
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

      {/* Add/Edit Employee Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6 my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingEmployee ? 'تعديل الموظف' : 'إضافة موظف جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الموظف</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">المنصب</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الراتب الأساسي (دج)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ltr"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السلف (دج)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.advances}
                    onChange={(e) => setFormData({...formData, advances: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البونص (دج)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.bonus}
                    onChange={(e) => setFormData({...formData, bonus: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الخصومات (دج)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.penalties}
                    onChange={(e) => setFormData({...formData, penalties: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ltr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التوظيف</label>
                <input
                  type="date"
                  required
                  value={formData.hireDate}
                  onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">الراتب الصافي:</span>
                  <span className="text-lg font-bold text-emerald-600 ltr">{formatCurrency(formData.salary + formData.bonus - formData.advances - formData.penalties)}</span>
                </div>
              </div>
              <div className="flex space-x-4 space-x-reverse pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  {editingEmployee ? 'تحديث' : 'إضافة'}
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

export default EmployeeManagement;