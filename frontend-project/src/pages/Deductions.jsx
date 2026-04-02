import { useState, useEffect, useMemo } from 'react';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../components/ToastProvider';
import { Edit2, Trash2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { formatCurrency } from '../utils/formatters';
import { getEmployeeRefId, getEmployeeRefName } from '../utils/employeeRefs';
import { getApiErrorMessage } from '../utils/apiError';
import { buildGeneratedCode, getDescendingGeneratedCodeForRow, getNextGeneratedCode } from '../utils/generatedIds';
import { sortRecordsDescending } from '../utils/sortRecords';

export const Deductions = () => {
  const actionButtonClass = "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all duration-200 hover:-translate-y-0.5";
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deductions, setDeductions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingDeduction, setEditingDeduction] = useState(null);
  const [formData, setFormData] = useState({ deductionCode: '', employeeId: '', amount: '', description: '' });
  const { showLoading, showSuccess, showError } = useToast();
  const nextDeductionCode = getNextGeneratedCode(deductions, 'deductionCode', 'DED_');
  const sortedDeductions = useMemo(() => sortRecordsDescending(deductions, ['deductionCode', '_id']), [deductions]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dedRes, empRes] = await Promise.all([
          axiosInstance.get('/deductions'),
          axiosInstance.get('/employees')
        ]);
        setDeductions(dedRes.data || []);
        setEmployees(empRes.data || []);
      } catch (err) {
        console.error('Error loading deductions data', err);
      }
    };

    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({ deductionCode: '', employeeId: '', amount: '', description: '' });
    setEditingDeduction(null);
    setIsEditing(false);
    setIsOpen(false);
  };

  const openCreateForm = () => {
    setFormData({ deductionCode: nextDeductionCode, employeeId: '', amount: '', description: '' });
    setEditingDeduction(null);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    showLoading(isEditing ? 'Updating deduction...' : 'Saving deduction...');

    try {
      const payload = {
        employee: formData.employeeId,
        amount: Number(formData.amount),
        description: formData.description
      };

      if (isEditing && editingDeduction) {
        const res = await axiosInstance.put(`/deductions/${editingDeduction._id}`, payload);
        setDeductions((prev) => prev.map((item) => item._id === editingDeduction._id ? res.data : item));
        showSuccess('Deduction updated successfully.');
        resetForm();
        return;
      }

      const res = await axiosInstance.post('/deductions', payload);
      setDeductions((prev) => [res.data, ...prev]);
      showSuccess('Deduction saved successfully.');
      resetForm();
    } catch (err) {
      console.error('Failed to save deduction', err);
      showError(getApiErrorMessage(err, 'Failed to save deduction.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (deduction, index) => {
    setEditingDeduction(deduction);
    setFormData({
      deductionCode: deduction.deductionCode || buildGeneratedCode('DED_', index + 1),
      employeeId: getEmployeeRefId(deduction.employee),
      amount: deduction.amount?.toString() || '',
      description: deduction.description || ''
    });
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deduction?')) return;
    showLoading('Deleting deduction...');

    try {
      await axiosInstance.delete(`/deductions/${id}`);
      setDeductions((prev) => prev.filter((item) => item._id !== id));
      showSuccess('Deduction deleted successfully.');
    } catch (err) {
      console.error('Failed to delete deduction', err);
      showError(getApiErrorMessage(err, 'Failed to delete deduction.'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Employee Deductions</h1>
            <p className="text-slate-300 mt-2 font-medium">Track and manage employee deductions</p>
            <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-4"></div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={openCreateForm}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
            >
              + New Deduction
            </button>
          </div>
        </div>

        <Table
          headers={["Deduction ID", "Employee Name", "Amount", "Description", "Actions"]}
          data={sortedDeductions}
          pageSize={3}
          variant="blue"
          renderRow={(item, index) => (
            <>
              <td className="px-6 py-4 font-mono text-sm text-blue-200 whitespace-nowrap">
                {getDescendingGeneratedCodeForRow(sortedDeductions.length, index, 'DED_')}
              </td>
              <td className="px-6 py-4 font-medium text-blue-50">
                {getEmployeeRefName(item.employee, employees)}
              </td>
              <td className="px-6 py-4 text-rose-300 font-bold whitespace-nowrap">
                -{formatCurrency(item.amount)}
              </td>
              <td className="px-6 py-4 text-blue-100/70 italic">
                {item.description || 'No description'}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(item, index)}
                    aria-label="Edit deduction"
                    title="Edit deduction"
                    className={`${actionButtonClass} text-blue-100 hover:bg-cyan-500 hover:text-slate-950`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    aria-label="Delete deduction"
                    title="Delete deduction"
                    className={`${actionButtonClass} text-blue-100 hover:bg-red-500 hover:text-white`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </>
          )}
        />

        {isOpen && (
          <Modal title={isEditing ? 'Edit Deduction' : 'Add New Deduction'} onClose={resetForm}>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <Input
                label="Deduction ID"
                value={formData.deductionCode}
                readOnly
              />
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase ml-1 tracking-wide">Employee Name</label>
                <select
                  className="mt-2 w-full p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Deduction Amount (FRW)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <Input
                label="Reason / Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={resetForm} disabled={isSubmitting} className="w-full">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Deduction' : 'Save Deduction'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};
