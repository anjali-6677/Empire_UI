import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { CreatableCombobox } from '../../components/ui/CreatableCombobox';
import { ControlledSelect } from '../../components/ui/ControlledSelect';
import { Plus, Users, Search, Mail } from 'lucide-react';

export interface EmployeeRecord {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designationId: string;
  designationName: string;
  status: 'Active' | 'Inactive';
}

const INITIAL_DEPARTMENTS = [
  { id: 'dept-eng', label: 'Engineering & Projects', description: 'Civil, MEP and site execution team' },
  { id: 'dept-proc', label: 'Procurement & Supply Chain', description: 'Sourcing, vendor & inventory management' },
  { id: 'dept-est', label: 'Estimation & Commercial', description: 'BOQ, tenders and cost estimation' },
  { id: 'dept-fin', label: 'Finance & Accounts', description: 'Billing, accounts payable and payroll' },
];

const INITIAL_DESIGNATIONS = [
  { id: 'desig-pm', label: 'Project Manager', description: 'Site project lead' },
  { id: 'desig-[#B39A6A]', label: 'Quantity Surveyor', description: 'BOQ and cost measurement engineer' },
  { id: 'desig-proc', label: 'Procurement Specialist', description: 'PO and vendor relationship lead' },
  { id: 'desig-eng', label: 'Site Engineer', description: 'Field supervisor' },
];

const INITIAL_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'emp-1',
    employeeCode: 'EMP-01',
    fullName: 'Rajesh Sharma',
    email: 'rajesh.sharma@empire.in',
    phone: '+91 98765 43210',
    departmentId: 'dept-eng',
    departmentName: 'Engineering & Projects',
    designationId: 'desig-pm',
    designationName: 'Project Manager',
    status: 'Active',
  },
  {
    id: 'emp-2',
    employeeCode: 'EMP-02',
    fullName: 'Ananya Verma',
    email: 'ananya.verma@empire.in',
    phone: '+91 98765 43211',
    departmentId: 'dept-proc',
    departmentName: 'Procurement & Supply Chain',
    designationId: 'desig-proc',
    designationName: 'Procurement Specialist',
    status: 'Active',
  },
];

export const UsersEmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>(INITIAL_EMPLOYEES);
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [designations, setDesignations] = useState(INITIAL_DESIGNATIONS);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesigModal, setShowDesigModal] = useState(false);
  // Quick Create Form Fields
  const [deptFormName, setDeptFormName] = useState('');
  const [deptFormCode, setDeptFormCode] = useState('');
  const [deptFormDesc, setDeptFormDesc] = useState('');

  const [desigFormName, setDesigFormName] = useState('');
  const [desigFormCode, setDesigFormCode] = useState('');
  const [desigFormDesc, setDesigFormDesc] = useState('');

  // Employee Form State
  const [empFullName, setEmpFullName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDesigId, setSelectedDesigId] = useState('');
  const [empStatus, setEmpStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenDeptModal = (query: string) => {
    setDeptFormName(query);
    setDeptFormCode(`DEPT-${String(departments.length + 1).padStart(2, '0')}`);
    setDeptFormDesc('');
    setShowDeptModal(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptFormName.trim()) return;
    const newId = `dept-${Date.now()}`;
    const newDept = {
      id: newId,
      label: deptFormName.trim(),
      description: deptFormDesc.trim() || 'Custom department',
    };
    setDepartments((prev) => [...prev, newDept]);
    setSelectedDeptId(newId);
    setShowDeptModal(false);
  };

  const handleOpenDesigModal = (query: string) => {
    setDesigFormName(query);
    setDesigFormCode(`DSG-${String(designations.length + 1).padStart(2, '0')}`);
    setDesigFormDesc('');
    setShowDesigModal(true);
  };

  const handleSaveDesig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigFormName.trim()) return;
    const newId = `desig-${Date.now()}`;
    const newDesig = {
      id: newId,
      label: desigFormName.trim(),
      description: desigFormDesc.trim() || 'Custom designation',
    };
    setDesignations((prev) => [...prev, newDesig]);
    setSelectedDesigId(newId);
    setShowDesigModal(false);
  };

  const handleOpenEmpModal = () => {
    setEmpFullName('');
    setEmpEmail('');
    setEmpPhone('');
    setSelectedDeptId('');
    setSelectedDesigId('');
    setEmpStatus('Active');
    setFormError(null);
    setShowEmpModal(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empFullName.trim() || !empEmail.trim()) {
      setFormError('Full Name and Email are required.');
      return;
    }
    const deptObj = departments.find((d) => d.id === selectedDeptId);
    const desigObj = designations.find((d) => d.id === selectedDesigId);

    const newEmp: EmployeeRecord = {
      id: `emp-${Date.now()}`,
      employeeCode: `EMP-${String(employees.length + 1).padStart(2, '0')}`,
      fullName: empFullName.trim(),
      email: empEmail.trim(),
      phone: empPhone.trim() || 'N/A',
      departmentId: selectedDeptId,
      departmentName: deptObj ? deptObj.label : 'General',
      designationId: selectedDesigId,
      designationName: desigObj ? desigObj.label : 'Staff',
      status: empStatus,
    };
    setEmployees((prev) => [newEmp, ...prev]);
    setShowEmpModal(false);
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.designationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9DEE7] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[#172033] flex items-center gap-2">
            <Users className="h-5 w-5 text-[#B39A6A]" /> Employees & Users
          </h1>
          <p className="text-xs text-[#6E7889] mt-0.5">
            Manage organization staff, roles, departments and user access.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={handleOpenEmpModal}>
          Add Employee
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-[#D9DEE7] rounded-lg shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6E7889]" />
          <input
            type="text"
            placeholder="Search employee, department or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D9DEE7] rounded-md text-xs text-[#172033] focus:border-[#7186A2] outline-none"
          />
        </div>
        <span className="text-xs text-[#6E7889] font-medium">
          Showing {filteredEmployees.length} of {employees.length} Employees
        </span>
      </div>

      {/* Employees Table */}
      <div className="bg-white border border-[#D9DEE7] rounded-lg shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1F3F6] border-b border-[#D9DEE7] text-[11px] font-bold text-[#6E7889] uppercase tracking-wider">
              <th className="py-3 px-4">Emp Code</th>
              <th className="py-3 px-4">Full Name</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3F6] text-xs text-[#172033]">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#6E7889]">
                  No employees found.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#F6F7F9] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#172033]">{emp.employeeCode}</td>
                  <td className="py-3 px-4 font-semibold">{emp.fullName}</td>
                  <td className="py-3 px-4">{emp.departmentName}</td>
                  <td className="py-3 px-4">{emp.designationName}</td>
                  <td className="py-3 px-4 text-[#6E7889]">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-[#6E7889]" /> {emp.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D9DEE7] shadow-xl w-full max-w-[600px] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#172033]">Add Employee</h2>
                <p className="text-xs text-[#6E7889]">Register a new employee record and assign department.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEmpModal(false)}
                className="text-[#6E7889] hover:text-[#172033] p-1 rounded hover:bg-[#F1F3F6]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-[#F8E9EA] border border-[#B35E62]/30 rounded text-[#B35E62] text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Full Name <span className="text-[#B35E62]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Vikram Singh"
                    value={empFullName}
                    onChange={(e) => setEmpFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-md outline-none focus:border-[#7186A2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">
                    Email Address <span className="text-[#B35E62]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@empire.in"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-md outline-none focus:border-[#7186A2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CreatableCombobox
                  label="Department"
                  value={selectedDeptId}
                  options={departments}
                  searchPlaceholder="Search or create department..."
                  canCreate={true}
                  createLabel={(q) => `+ Create Department "${q}"`}
                  onChange={(id) => setSelectedDeptId(id)}
                  onCreate={handleOpenDeptModal}
                />

                <CreatableCombobox
                  label="Designation"
                  value={selectedDesigId}
                  options={designations}
                  searchPlaceholder="Search or create designation..."
                  canCreate={true}
                  createLabel={(q) => `+ Create Designation "${q}"`}
                  onChange={(id) => setSelectedDesigId(id)}
                  onCreate={handleOpenDesigModal}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-md outline-none focus:border-[#7186A2]"
                  />
                </div>

                <ControlledSelect
                  label="Status"
                  value={empStatus}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                  onChange={(v) => setEmpStatus(v as any)}
                />
              </div>

              <div className="pt-4 border-t border-[#D9DEE7] flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowEmpModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Employee
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Create Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D9DEE7] shadow-xl w-full max-w-[480px] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#172033]">Add Department</h3>
                <p className="text-xs text-[#6E7889]">Create a new organizational department record.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="text-[#6E7889] hover:text-[#172033]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Department Code</label>
                <input
                  type="text"
                  disabled
                  value={deptFormCode}
                  className="w-full px-3 py-2 text-xs font-mono text-[#6E7889] bg-[#F1F3F6] border border-[#D9DEE7] rounded-md cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Department Name <span className="text-[#B35E62]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deptFormName}
                  onChange={(e) => setDeptFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-md outline-none focus:border-[#7186A2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={deptFormDesc}
                  onChange={(e) => setDeptFormDesc(e.target.value)}
                  placeholder="Short summary of department responsibilities..."
                  className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-md outline-none focus:border-[#7186A2] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#D9DEE7] flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDeptModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Department
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Create Designation Modal */}
      {showDesigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D9DEE7] shadow-xl w-full max-w-[480px] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9DEE7] bg-[#F6F7F9] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#172033]">Add Designation</h3>
                <p className="text-xs text-[#6E7889]">Create a new job title / designation record.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDesigModal(false)}
                className="text-[#6E7889] hover:text-[#172033]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDesig} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Designation Code</label>
                <input
                  type="text"
                  disabled
                  value={desigFormCode}
                  className="w-full px-3 py-2 text-xs font-mono text-[#6E7889] bg-[#F1F3F6] border border-[#D9DEE7] rounded-md cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Designation Title <span className="text-[#B35E62]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={desigFormName}
                  onChange={(e) => setDesigFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-md outline-none focus:border-[#7186A2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={desigFormDesc}
                  onChange={(e) => setDesigFormDesc(e.target.value)}
                  placeholder="Short description of designation duties..."
                  className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-[#D9DEE7] rounded-md outline-none focus:border-[#7186A2] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#D9DEE7] flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDesigModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Designation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default UsersEmployeesPage;
