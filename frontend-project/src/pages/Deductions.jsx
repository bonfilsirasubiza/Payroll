import { useState, useEffect } from 'react';
import { Table } from '../components/Table';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Edit2, Trash2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { formatCurrency } from '../utils/formatters';

export const Deductions = () => {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [deductions, setDeductions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingDeduction, setEditingDeduction] = useState(null);
  const [formData, setFormData] = useState({ employeeId: '', amount: '', description: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dedRes, empRes] = await Promise.all([
          axiosInstance.get('/deductions'),
          axiosInstance.get('/employees')
        ]);
        setDeductions(dedRes.data);
        setEmployees(empRes.data);
      } catch (err) {
        console.error("Error loading deductions data", err);
      }
    };
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({ employeeId: '', amount: '', description: '' });
    setEditingDeduction(null);
    setView('list');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDeduction) {
        const res = await axiosInstance.put(`/deductions/${editingDeduction._id}`, formData);
        setDeductions(prev => prev.map(item => item._id === editingDeduction._id ? res.data : item));
        resetForm();
        return;
      }

      const res = await axiosInstance.post('/deductions', formData);
      setDeductions(prev => [res.data, ...prev]);
      resetForm();
    } catch (err) {
      alert("Failed to save deduction");
    }
  };

  const handleEdit = (deduction) => {
    setEditingDeduction(deduction);
    setFormData({ employeeId: deduction.employee?._id || '', amount: deduction.amount.toString(), description: deduction.description || '' });
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deduction?')) return;
    try {
      await axiosInstance.delete(`/deductions/${id}`);
      setDeductions(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      alert('Failed to delete deduction');
    }
  };

  if (view === 'form') {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-slide-up">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Deduction</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Employee Name</label>
            <select 
              className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>
          
          <Input 
            label="Deduction Amount (FRW)" 
            type="number" 
            onChange={(e) => setFormData({...formData, amount: e.target.value})} 
            required 
          />
          
          <Input 
            label="Reason / Description" 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            required 
          />

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={resetForm} 
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <Button variant="danger" type="submit" className="flex-1">
              {editingDeduction ? 'Update Deduction' : 'Save Deduction'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Deductions</h1>
          <div className="h-1 w-12 bg-yellow-400 mt-1"></div>
        </div>
        <button 
          onClick={() => setView('form')} 
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95"
        >
          + New Deduction
        </button>
      </div>

      <Table 
        headers={["Employee Name", "Amount", "Description", "Actions"]} 
        data={deductions} 
        pageSize={3}
        renderRow={(item) => (
          <>
            <td className="px-6 py-4 font-medium text-gray-900">{item.employee?.name || 'Unknown'}</td>
            <td className="px-6 py-4 text-red-600 font-bold">-{formatCurrency(item.amount)}</td>
            <td className="px-6 py-4 text-gray-500 italic">{item.description}</td>
            <td className="px-6 py-4 space-x-2">
              <button onClick={() => handleEdit(item)} aria-label="Edit deduction" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(item._id)} aria-label="Delete deduction" className="inline-flex items-center text-red-600 hover:text-red-800">
                <Trash2 size={16} />
              </button>
            </td>
          </>
        )} 
      />
    </div>
  );
};