import { useState, useEffect } from 'react';
import { Table } from '../components/Table';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Edit2, Trash2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export const Allowances = () => {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [employees, setEmployees] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [form, setForm] = useState({ employee: '', amount: '', description: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, alRes] = await Promise.all([
          axiosInstance.get('/employees'),
          axiosInstance.get('/allowances')
        ]);
        setEmployees(empRes.data);
        setAllowances(alRes.data);
      } catch (err) {
        console.error('Failed to load allowances data', err);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setForm({ employee: '', amount: '', description: '' });
    setEditingAllowance(null);
    setView('list');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { employee: form.employee, amount: Number(form.amount), description: form.description };

      if (editingAllowance) {
        const res = await axiosInstance.put(`/allowances/${editingAllowance._id}`, payload);
        setAllowances(prev => prev.map(item => item._id === editingAllowance._id ? res.data : item));
        resetForm();
        return;
      }

      const res = await axiosInstance.post('/allowances', payload);
      setAllowances(prev => [res.data, ...prev]);
      resetForm();
    } catch (err) {
      console.error('Failed to save allowance', err);
      alert('Failed to save allowance');
    }
  };

  const handleEdit = (allowance) => {
    setEditingAllowance(allowance);
    setForm({ employee: allowance.employee?._id || '', amount: allowance.amount.toString(), description: allowance.description || '' });
    setView('form');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this allowance?')) return;
    try {
      await axiosInstance.delete(`/allowances/${id}`);
      setAllowances(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete allowance', err);
      alert('Failed to delete allowance');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Allowances</h1>
        <button onClick={() => setView('form')} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md">+ New</button>
      </div>

      <Table headers={["Employee Name", "Amount", "Description", "Actions"]} data={allowances} pageSize={3} renderRow={(a) => (
        <>
          <td className="px-6 py-4 font-medium">{a.employee?.name || 'Unknown'}</td>
          <td className="px-6 py-4 text-green-600 font-bold">{a.amount}</td>
          <td className="px-6 py-4 text-gray-500 italic">{a.description}</td>
          <td className="px-6 py-4 space-x-2">
            <button onClick={() => handleEdit(a)} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
              <Edit2 size={16} />
              Edit
            </button>
            <button onClick={() => handleDelete(a._id)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800">
              <Trash2 size={16} />
              Delete
            </button>
          </td>
        </>
      )} />

      {view === 'form' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border animate-slide-up">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Allowance</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-gray-600">Select Employee</label>
            <select className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.employee}
              onChange={e => setForm({...form, employee: e.target.value})}
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} — {emp.position}</option>
              ))}
            </select>
            <Input label="Amount" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
            <Input label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
            <div className="flex gap-4 pt-4">
              <Button variant="secondary" onClick={() => setView('list')}>Cancel</Button>
              <Button variant="primary" type="submit">Submit Allowance</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};