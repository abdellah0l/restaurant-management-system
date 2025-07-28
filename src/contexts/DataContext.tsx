import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: number;
  minStock: number;
  lastUpdated: Date;
}

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  totalDebt: number;
  totalPaid: number;
}

export interface Employee {
  id: number;
  name: string;
  phone: string;
  position: string;
  salary: number;
  advances: number;
  bonus: number;
  penalties: number;
  hireDate: Date;
  netSalary: number;
}

export interface Transaction {
  id: number;
  type: 'purchase' | 'sale' | 'expense';
  amount: number;
  description: string;
  date: Date;
}

interface DataContextType {
  products: Product[];
  suppliers: Supplier[];
  employees: Employee[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: number, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: number) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: number, employee: Partial<Employee>) => void;
  deleteEmployee: (id: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: number, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: number) => void;
  getDailyReport: () => any;
  getMonthlyReport: () => any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Use environment variable for API URL in production, fallback to proxy in development
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch all data on mount
  useEffect(() => {
    // Products
    axios.get(`${API_BASE}/products/`).then(res => {
      const products = (res.data as any[]).map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        stock: parseFloat(p.stock),
        unit: p.unit,
        price: parseFloat(p.price),
        minStock: p.min_stock,
        lastUpdated: new Date(p.last_updated)
      }));
      setProducts(products);
    })
    .catch(err => {
      console.error('Error fetching products:', err);
    });

    // Suppliers
    axios.get(`${API_BASE}/suppliers/`).then(res => {
      const suppliers = (res.data as any[]).map((s: any) => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        email: s.email,
        address: s.address,
        totalDebt: parseFloat(s.total_debt),
        totalPaid: parseFloat(s.total_paid)
      }));
      setSuppliers(suppliers);
    })
    .catch(err => {
      console.error('Error fetching suppliers:', err);
    });

    // Employees
    axios.get(`${API_BASE}/employees/`).then(res => {
      const employees = (res.data as any[]).map((e: any) => ({
        id: e.id,
        name: e.name,
        phone: e.phone,
        position: e.position,
        salary: parseFloat(e.salary),
        advances: parseFloat(e.advances),
        bonus: parseFloat(e.bonus),
        penalties: parseFloat(e.penalties),
        hireDate: new Date(e.hire_date),
        netSalary: typeof e.net_salary === 'number' ? e.net_salary : parseFloat(e.net_salary)
      }));
      setEmployees(employees);
    })
    .catch(err => {
      console.error('Error fetching employees:', err);
    });

    // Transactions
    axios.get(`${API_BASE}/transactions/`).then(res => {
      const transactions = (res.data as any[]).map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount),
        description: t.description,
        date: new Date(t.date),
      }));
      setTransactions(transactions);
    })
    .catch(err => {
      console.error('Error fetching transactions:', err);
    });
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const payload = {
      name: product.name,
      category: product.category,
      stock: product.stock,
      unit: product.unit, // always string
      price: product.price,
      min_stock: product.minStock,
    };
    const res = await axios.post<Product>(`${API_BASE}/products`, payload);
    // Map backend response to frontend interface
    const newProduct = {
      id: res.data.id,
      name: res.data.name,
      category: res.data.category,
      stock: typeof res.data.stock === 'string' ? parseFloat(res.data.stock) : res.data.stock,
      unit: res.data.unit,
      price: typeof res.data.price === 'string' ? parseFloat(res.data.price) : res.data.price,
      minStock: (res.data as any).min_stock || res.data.minStock,
      lastUpdated: (res.data as any).last_updated ? new Date((res.data as any).last_updated) : new Date()
    };
    setProducts(prev => [newProduct, ...prev.filter(p => p.id !== newProduct.id)]);
  };
  const updateProduct = async (id: string, product: Partial<Product>) => {
    const found = products.find(p => p.id === id);
    console.log(found);
    if (!found) return;
    const payload = {
      name: product.name ?? found.name,
      category: product.category ?? found.category,
      stock: product.stock ?? found.stock,
      unit: product.unit ?? found.unit,
      price: product.price ?? found.price,
      min_stock: product.minStock ?? found.minStock,
    };
    const res = await axios.put<Product>(`${API_BASE}/products/${id}`, payload);
    // Map backend response to frontend interface
    const updated = {
      id: res.data.id,
      name: res.data.name,
      category: res.data.category,
      stock: typeof res.data.stock === 'string' ? parseFloat(res.data.stock) : res.data.stock,
      unit: res.data.unit,
      price: typeof res.data.price === 'string' ? parseFloat(res.data.price) : res.data.price,
      minStock: (res.data as any).min_stock || res.data.minStock,
      lastUpdated: (res.data as any).last_updated ? new Date((res.data as any).last_updated) : new Date()
    };
    console.log(updated);
    setProducts(prev => [updated, ...prev.filter(p => p.id !== id)]);
  };
  const deleteProduct = async (id: string) => {
    await axios.delete(`${API_BASE}/products/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const payload = {
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      total_debt: supplier.totalDebt,
      total_paid: supplier.totalPaid
    };
    const res = await axios.post<Supplier>(`${API_BASE}/suppliers`, payload);
    // Map backend response to frontend interface
    const newSupplier = {
      id: res.data.id,
      name: res.data.name,
      phone: res.data.phone,
      email: res.data.email,
      address: res.data.address,
      totalDebt: typeof (res.data as any).total_debt === 'string' ? parseFloat((res.data as any).total_debt) : (res.data as any).total_debt || 0,
      totalPaid: typeof (res.data as any).total_paid === 'string' ? parseFloat((res.data as any).total_paid) : (res.data as any).total_paid || 0
    };
    setSuppliers(prev => [newSupplier, ...prev.filter(s => s.id !== newSupplier.id)]);
  };

  const updateSupplier = async (id: number, supplier: Partial<Supplier>) => {
    const found = suppliers.find(s => s.id === id);
    console.log(found);
    if (!found) return;
    const payload = {
      name: supplier.name ?? found.name,
      phone: supplier.phone ?? found.phone,
      email: supplier.email ?? found.email,
      address: supplier.address ?? found.address,
      total_debt: supplier.totalDebt ?? found.totalDebt,
      total_paid: supplier.totalPaid ?? found.totalPaid
    };
    const res = await axios.put<Supplier>(`${API_BASE}/suppliers/${id}`, payload);
    // Map backend response to frontend interface
    const updated = {
      id: res.data.id,
      name: res.data.name,
      phone: res.data.phone,
      email: res.data.email,
      address: res.data.address,
      totalDebt: typeof (res.data as any).total_debt === 'string' ? parseFloat((res.data as any).total_debt) : (res.data as any).total_debt || 0,
      totalPaid: typeof (res.data as any).total_paid === 'string' ? parseFloat((res.data as any).total_paid) : (res.data as any).total_paid || 0
    };
    console.log(updated);
    setSuppliers(prev => [updated, ...prev.filter(s => s.id !== id)]);
  };

  const deleteSupplier = async (id: number) => {
    await axios.delete(`${API_BASE}/suppliers/${id}`);
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const payload = {
      name: employee.name,
      phone: employee.phone,
      position: employee.position,
      salary: employee.salary,
      advances: employee.advances,
      bonus: employee.bonus,
      penalties: employee.penalties,
      hire_date: employee.hireDate
    };
    const res = await axios.post<Employee>(`${API_BASE}/employees`, payload);
    // Map backend response to frontend interface
    const newEmployee = {
      id: res.data.id,
      name: res.data.name,
      phone: res.data.phone,
      position: res.data.position,
      salary: typeof res.data.salary === 'string' ? parseFloat(res.data.salary) : res.data.salary,
      advances: typeof res.data.advances === 'string' ? parseFloat(res.data.advances) : res.data.advances,
      bonus: typeof res.data.bonus === 'string' ? parseFloat(res.data.bonus) : res.data.bonus,
      penalties: typeof res.data.penalties === 'string' ? parseFloat(res.data.penalties) : res.data.penalties,
      hireDate: (res.data as any).hire_date ? new Date((res.data as any).hire_date) : new Date(),
      netSalary: typeof (res.data as any).net_salary === 'string' ? parseFloat((res.data as any).net_salary) : (res.data as any).net_salary
    };
    setEmployees(prev => [newEmployee, ...prev.filter(e => e.id !== newEmployee.id)]);
  };
  
  const updateEmployee = async (id: number, employee: Partial<Employee>) => {
    const found = employees.find(e => e.id === id);
    console.log(found);
    if (!found) return;
    const payload = {
      name: employee.name ?? found.name,
      phone: employee.phone ?? found.phone,
      position: employee.position ?? found.position,
      salary: employee.salary ?? found.salary,
      advances: employee.advances ?? found.advances,
      bonus: employee.bonus ?? found.bonus,
      penalties: employee.penalties ?? found.penalties,
      hire_date: employee.hireDate ?? found.hireDate
    };
    const res = await axios.put<Employee>(`${API_BASE}/employees/${id}`, payload);
    // Map backend response to frontend interface
    const updated = {
      id: res.data.id,
      name: res.data.name,
      phone: res.data.phone,
      position: res.data.position,
      salary: typeof res.data.salary === 'string' ? parseFloat(res.data.salary) : res.data.salary,
      advances: typeof res.data.advances === 'string' ? parseFloat(res.data.advances) : res.data.advances,
      bonus: typeof res.data.bonus === 'string' ? parseFloat(res.data.bonus) : res.data.bonus,
      penalties: typeof res.data.penalties === 'string' ? parseFloat(res.data.penalties) : res.data.penalties,
      hireDate: (res.data as any).hire_date ? new Date((res.data as any).hire_date) : new Date(),
      netSalary: typeof (res.data as any).net_salary === 'string' ? parseFloat((res.data as any).net_salary) : (res.data as any).net_salary
    };
    console.log(updated);
    setEmployees(prev => [updated, ...prev.filter(e => e.id !== id)]);
  };

  const deleteEmployee = async (id: number) => {
    await axios.delete(`${API_BASE}/employees/${id}`);
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const payload = {
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date
    };
    const res = await axios.post<Transaction>(`${API_BASE}/transactions`, payload);
    const newTransaction = { ...res.data, date: new Date(res.data.date) };
    setTransactions(prev => [newTransaction, ...prev]);
  };
  const updateTransaction = async (id: number, transaction: Partial<Transaction>) => {
    const found = transactions.find(t => t.id === id);
    if (!found) return;
    const payload = {
      type: transaction.type ?? found.type,
      amount: transaction.amount ?? found.amount,
      description: transaction.description ?? found.description,
      date: transaction.date ?? found.date
    };
    const res = await axios.put<Transaction>(`${API_BASE}/transactions/${id}`, payload);
    const updated = { ...res.data, date: new Date(res.data.date) };
    setTransactions(prev => [updated, ...prev.filter(t => t.id !== id)]);
  };
  const deleteTransaction = async (id: number) => {
    await axios.delete(`${API_BASE}/transactions/${id}`);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getDailyReport = () => {
    const today = new Date();
    const todayTransactions = transactions.filter(t => 
      t.date.toDateString() === today.toDateString()
    );
    
    const sales = todayTransactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
    const purchases = todayTransactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0);
    const expenses = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      sales,
      purchases,
      expenses,
      netProfit: sales - purchases - expenses,
      transactions: todayTransactions
    };
  };

  const getMonthlyReport = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => 
      t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear
    );
    
    const sales = monthlyTransactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
    const purchases = monthlyTransactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      sales,
      purchases,
      expenses,
      netProfit: sales - purchases - expenses,
      transactions: monthlyTransactions
    };
  };

  return (
    <DataContext.Provider value={{
      products,
      suppliers,
      employees,
      transactions,
      addProduct,
      updateProduct,
      deleteProduct,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getDailyReport,
      getMonthlyReport
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};