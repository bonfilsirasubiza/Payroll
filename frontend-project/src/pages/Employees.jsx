import { useState, useEffect } from 'react';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Edit2, Trash2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export const Employees = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: '', position: '', phone: '' });
  const headers = ["Name", "Position", "Phone", "Actions"];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get('/employees');
        setEmployees(res.data);
      } catch (err) {
        console.error('Failed to load employees', err);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setForm({ name: '', position: '', phone: '' });
    setEditingEmployee(null);
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (isEditing && editingEmployee) {
        const res = await axiosInstance.put(`/employees/${editingEmployee._id}`, form);
        setEmployees(prev => prev.map((emp) => emp._id === editingEmployee._id ? res.data : emp));
        resetForm();
        return;
      }

      const res = await axiosInstance.post('/employees', form);
      setEmployees(prev => [res.data, ...prev]);
      resetForm();
    } catch (err) {
      console.error('Save employee failed', err);
      alert('Failed to save employee');
    }
  };

  const handleEdit = (employee) => {
    setForm({ name: employee.name, position: employee.position, phone: employee.phone });
    setEditingEmployee(employee);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axiosInstance.delete(`/employees/${employeeId}`);
      setEmployees(prev => prev.filter(emp => emp._id !== employeeId));
    } catch (err) {
      console.error('Delete employee failed', err);
      alert('Failed to delete employee');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Employee Records</h1>
        <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg">+ New Employee</button>
      </div>

      <Table 
        headers={headers}
        data={employees}
        pageSize={3}
        renderRow={(emp) => (
          <>
            <td className="px-6 py-4 font-bold">{emp.name}</td>
            <td className="px-6 py-4">{emp.position}</td>
            <td className="px-6 py-4">{emp.phone}</td>
            <td className="px-6 py-4 space-x-2">
              <button onClick={() => handleEdit(emp)} aria-label="Edit employee" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(emp._id)} aria-label="Delete employee" className="inline-flex items-center text-red-600 hover:text-red-800">
                <Trash2 size={16} />
              </button>
            </td>
          </>
        )}
        renderCard={(emp) => (
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="text-xs text-gray-500">Name</div>
              <div className="font-bold text-gray-800">{emp.name}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-xs text-gray-500">Position</div>
              <div className="text-sm text-gray-700">{emp.position}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-xs text-gray-500">Phone</div>
              <div className="text-sm text-gray-700">{emp.phone}</div>
            </div>
            <div className="pt-2 flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">Edit</button>
            </div>
          </div>
        )}
      />

      {isOpen && (
        <Modal title={isEditing ? 'Edit Employee' : 'Register New Employee'} onClose={resetForm}>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <Input label="Position" value={form.position} onChange={e => setForm({...form, position: e.target.value})} required />
            <Input label="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={resetForm} className="w-full">Cancel</Button>
              <Button type="submit" className="w-full">{isEditing ? 'Update Employee' : 'Save Employee'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};