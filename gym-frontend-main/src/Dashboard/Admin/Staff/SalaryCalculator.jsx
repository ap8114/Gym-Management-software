// src/components/SalaryCalculator.js
import React, { useState } from 'react';
import { FaPlus, FaTrashAlt, FaEdit, FaEye } from 'react-icons/fa';

const SalaryCalculator = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedSalary, setSelectedSalary] = useState(null);
  
  // Add state for form data
  const [formData, setFormData] = useState({
    salary_id: '',
    staff_id: '',
    period_start: '',
    period_end: '',
    hours_worked: '',
    hourly_total: '',
    fixed_salary: '',
    commission_total: '',
    bonuses: [],
    deductions: [],
    net_pay: '',
    status: 'Generated',
    paid_at: ''
  });

  // Sample data — in real app, fetch from API
  const staffList = [
    { id: 101, staff_id: "STAFF001", first_name: "Alex", last_name: "Martinez", role: "Manager", fixed_salary: 60000, hourly_rate: null, commission_rate_percent: 0 },
    { id: 102, staff_id: "STAFF002", first_name: "Sarah", last_name: "Kim", role: "Trainer", fixed_salary: null, hourly_rate: 35, commission_rate_percent: 15 },
    { id: 103, staff_id: "STAFF003", first_name: "Raj", last_name: "Patel", role: "Receptionist", fixed_salary: 35000, hourly_rate: null, commission_rate_percent: 0 }
  ];

  const [salaries, setSalaries] = useState([
    {
      salary_id: "SAL001",
      staff_id: "STAFF002",
      period_start: "2025-04-01",
      period_end: "2025-04-30",
      hours_worked: 160,
      hourly_total: 5600,
      fixed_salary: null,
      commission_total: 1200,
      bonuses: [{ label: "Performance Bonus", amount: 500 }],
      deductions: [{ label: "Late Penalty", amount: 100 }],
      net_pay: 7200,
      status: "Paid",
      paid_at: "2025-05-02T10:30:00Z"
    },
    {
      salary_id: "SAL002",
      staff_id: "STAFF001",
      period_start: "2025-04-01",
      period_end: "2025-04-30",
      hours_worked: null,
      hourly_total: null,
      fixed_salary: 5000,
      commission_total: 0,
      bonuses: [],
      deductions: [{ label: "Tax", amount: 800 }],
      net_pay: 4200,
      status: "Approved",
      paid_at: null
    }
  ]);

  // ===== HANDLERS =====
  const handleAddNew = () => {
    setModalType('add');
    setSelectedSalary(null);
    // Reset form data for adding new salary
    setFormData({
      salary_id: getNextSalaryId(),
      staff_id: '',
      period_start: '',
      period_end: '',
      hours_worked: '',
      hourly_total: '',
      fixed_salary: '',
      commission_total: '',
      bonuses: [],
      deductions: [],
      net_pay: '',
      status: 'Generated',
      paid_at: ''
    });
    setIsModalOpen(true);
  };

  const handleView = (salary) => {
    setModalType('view');
    setSelectedSalary(salary);
    // Populate form with selected salary data
    setFormData({
      salary_id: salary.salary_id,
      staff_id: salary.staff_id,
      period_start: salary.period_start,
      period_end: salary.period_end,
      hours_worked: salary.hours_worked || '',
      hourly_total: salary.hourly_total || '',
      fixed_salary: salary.fixed_salary || '',
      commission_total: salary.commission_total || '',
      bonuses: salary.bonuses || [],
      deductions: salary.deductions || [],
      net_pay: salary.net_pay,
      status: salary.status,
      paid_at: salary.paid_at ? new Date(salary.paid_at).toISOString().slice(0,16) : ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (salary) => {
    setModalType('edit');
    setSelectedSalary(salary);
    // Populate form with selected salary data
    setFormData({
      salary_id: salary.salary_id,
      staff_id: salary.staff_id,
      period_start: salary.period_start,
      period_end: salary.period_end,
      hours_worked: salary.hours_worked || '',
      hourly_total: salary.hourly_total || '',
      fixed_salary: salary.fixed_salary || '',
      commission_total: salary.commission_total || '',
      bonuses: salary.bonuses || [],
      deductions: salary.deductions || [],
      net_pay: salary.net_pay,
      status: salary.status,
      paid_at: salary.paid_at ? new Date(salary.paid_at).toISOString().slice(0,16) : ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (salary) => {
    setSelectedSalary(salary);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSalary) {
      setSalaries(prev => prev.filter(s => s.salary_id !== selectedSalary.salary_id));
      alert(`Salary record ${selectedSalary.salary_id} deleted.`);
    }
    setIsDeleteModalOpen(false);
    setSelectedSalary(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSalary(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedSalary(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-calculate values when relevant fields change
    if (name === 'hours_worked' || name === 'fixed_salary' || name === 'commission_total') {
      const staff = staffList.find(s => s.staff_id === formData.staff_id);
      if (staff) {
        let hourlyTotal = formData.hourly_total;
        if (name === 'hours_worked') {
          hourlyTotal = calculateHourlyTotal(parseFloat(value) || 0, formData.staff_id);
        }
        
        const commissionTotal = name === 'commission_total' 
          ? parseFloat(value) || 0 
          : calculateCommissionTotal(hourlyTotal, parseFloat(formData.fixed_salary) || 0, formData.staff_id);
        
        const netPay = calculateNetPay(
          hourlyTotal, 
          parseFloat(name === 'fixed_salary' ? value : formData.fixed_salary) || 0, 
          commissionTotal, 
          formData.bonuses, 
          formData.deductions
        );
        
        setFormData(prev => ({
          ...prev,
          hourly_total: hourlyTotal,
          commission_total: commissionTotal,
          net_pay: netPay
        }));
      }
    }
  };

  // Handle staff selection change
  const handleStaffChange = (e) => {
    const staffId = e.target.value;
    setFormData(prev => ({
      ...prev,
      staff_id: staffId
    }));
    
    // Auto-calculate hourly total if hours are already entered
    if (formData.hours_worked) {
      const hourlyTotal = calculateHourlyTotal(parseFloat(formData.hours_worked) || 0, staffId);
      const commissionTotal = calculateCommissionTotal(hourlyTotal, parseFloat(formData.fixed_salary) || 0, staffId);
      const netPay = calculateNetPay(hourlyTotal, parseFloat(formData.fixed_salary) || 0, commissionTotal, formData.bonuses, formData.deductions);
      
      setFormData(prev => ({
        ...prev,
        hourly_total: hourlyTotal,
        commission_total: commissionTotal,
        net_pay: netPay
      }));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (modalType === 'add') {
      // Add new salary
      const newSalary = { ...formData };
      setSalaries(prev => [...prev, newSalary]);
      alert('Salary record added successfully!');
    } else if (modalType === 'edit') {
      // Update existing salary
      setSalaries(prev => prev.map(s => 
        s.salary_id === formData.salary_id ? { ...formData } : s
      ));
      alert('Salary record updated successfully!');
    }
    closeModal();
  };

  // Prevent background scroll
  React.useEffect(() => {
    if (isModalOpen || isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isDeleteModalOpen]);

  // ===== UI HELPERS =====
  const getStatusBadge = (status) => {
    const badges = {
      Generated: "bg-warning-subtle text-warning-emphasis",
      Approved: "bg-info-subtle text-info-emphasis",
      Paid: "bg-success-subtle text-success-emphasis"
    };
    return (
      <span className={`badge rounded-pill ${badges[status] || 'bg-secondary'} px-2 py-1`}>
        {status}
      </span>
    );
  };

  const getStaffInfo = (staffId) => {
    const staff = staffList.find(s => s.staff_id === staffId);
    return staff || { first_name: 'Unknown', last_name: '', role: 'Unknown' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getNextSalaryId = () => {
    const prefix = "SAL";
    const maxId = salaries.length > 0
      ? Math.max(...salaries.map(s => parseInt(s.salary_id.replace(prefix, '')) || 0))
      : 0;
    return `${prefix}${String(maxId + 1).padStart(3, '0')}`;
  };

  // Auto-calculate hourly total based on hours and staff's hourly rate
  const calculateHourlyTotal = (hoursWorked, staffId) => {
    const staff = staffList.find(s => s.staff_id === staffId);
    if (!hoursWorked || !staff?.hourly_rate) return 0;
    return hoursWorked * staff.hourly_rate;
  };

  // Auto-calculate commission total based on fixed/hourly earnings and commission rate
  const calculateCommissionTotal = (hourlyTotal, fixedSalary, staffId) => {
    const staff = staffList.find(s => s.staff_id === staffId);
    if (!staff?.commission_rate_percent || staff.commission_rate_percent === 0) return 0;

    const baseAmount = (hourlyTotal || 0) + (fixedSalary || 0);
    return (baseAmount * staff.commission_rate_percent) / 100;
  };

  // Auto-calculate net pay
  const calculateNetPay = (hourlyTotal, fixedSalary, commissionTotal, bonuses, deductions) => {
    const bonusSum = (bonuses || []).reduce((sum, b) => sum + b.amount, 0);
    const deductionSum = (deductions || []).reduce((sum, d) => sum + d.amount, 0);
    return (hourlyTotal || 0) + (fixedSalary || 0) + commissionTotal + bonusSum - deductionSum;
  };

  // ===== JSX =====
  return (
    <div className="container-fluid p-2 p-md-4">
      {/* Header */}
      <div className="row mb-3 mb-md-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold fs-4 fs-md-3">Salary Calculator</h2>
          <p className="text-muted mb-0 fs-6">Calculate and manage staff salaries based on role (Fixed, Hourly, Commission).</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
          <button
            className="btn w-100 w-md-auto"
            style={{
              backgroundColor: '#6EB2CC',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onClick={handleAddNew}
          >
            <FaPlus size={14} className="me-2" /> Add Salary 
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="row mb-3 mb-md-4 g-2 g-md-3">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="input-group">
            <span className="input-group-text bg-light border">
              <i className="fas fa-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border"
              placeholder="Search by staff name or ID..."
            />
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <select className="form-select form-select-sm">
            <option>All Status</option>
            <option>Generated</option>
            <option>Approved</option>
            <option>Paid</option>
          </select>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <select className="form-select form-select-sm">
            <option>All Roles</option>
            <option>Manager</option>
            <option>Trainer</option>
            <option>Receptionist</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-semibold d-none d-md-table-cell">SALARY ID</th>
                <th className="fw-semibold">STAFF</th>
                <th className="fw-semibold d-none d-lg-table-cell">ROLE</th>
                <th className="fw-semibold d-none d-md-table-cell">PERIOD</th>
                <th className="fw-semibold text-end">NET PAY</th>
                <th className="fw-semibold text-center d-none d-lg-table-cell">STATUS</th>
                <th className="fw-semibold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((salary) => {
                const staff = getStaffInfo(salary.staff_id);
                return (
                  <tr key={salary.salary_id}>
                    <td className="d-none d-md-table-cell"><strong>{salary.salary_id}</strong></td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="ms-2">
                          <div className="fw-bold">{staff.first_name} {staff.last_name}</div>
                          <div className="text-muted small d-md-none">{staff.role}</div>
                          <div className="text-muted small d-md-none">{salary.salary_id}</div>
                          <div className="text-muted small d-md-none">{formatDate(salary.period_start)} - {formatDate(salary.period_end)}</div>
                          <div className="d-lg-none mt-1">{getStatusBadge(salary.status)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="d-none d-lg-table-cell"><span className="badge bg-primary">{staff.role}</span></td>
                    <td className="d-none d-md-table-cell">
                      {formatDate(salary.period_start)}<br/>
                      <small className="text-muted">to {formatDate(salary.period_end)}</small>
                    </td>
                    <td className="text-end fw-bold">₹{(salary.net_pay)}</td>
                    <td className="text-center d-none d-lg-table-cell">{getStatusBadge(salary.status)}</td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="View"
                          onClick={() => handleView(salary)}
                        >
                          <FaEye size={12} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Edit"
                          onClick={() => handleEdit(salary)}
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDeleteClick(salary)}
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          // onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold fs-5">
                  {modalType === 'add' ? 'Add New Salary ' :
                   modalType === 'edit' ? 'Edit Salary ' : 'View Salary '}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-3 p-md-4">
                {/* Warning for editing paid salary */}
                {modalType === 'edit' && selectedSalary?.status === 'Paid' && (
                  <div className="alert alert-warning d-flex align-items-center mb-3" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <div>
                      <strong>Warning:</strong> You are editing a salary record that has already been marked as "Paid". 
                      This may affect financial records and reporting.
                    </div>
                  </div>
                )}
                
                <form>
                  {/* SECTION 1: Staff & Period */}
                  <h6 className="fw-bold mb-3 fs-6">Staff & Period</h6>
                  <div className="row g-2 g-md-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Salary ID</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.salary_id}
                        readOnly
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Staff Member <span className="text-danger">*</span></label>
                      <select
                        className="form-select form-select-sm"
                        name="staff_id"
                        value={formData.staff_id}
                        onChange={handleStaffChange}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="">Select Staff</option>
                        {staffList.map(staff => (
                          <option key={staff.staff_id} value={staff.staff_id}>
                            {staff.first_name} {staff.last_name} ({staff.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Role</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.staff_id ? getStaffInfo(formData.staff_id)?.role : ''}
                        readOnly
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Period Start <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        name="period_start"
                        value={formData.period_start}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Period End <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        name="period_end"
                        value={formData.period_end}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                  </div>

                  {/* SECTION 2: Compensation Details */}
                  <h6 className="fw-bold mb-3 fs-6">Compensation Details</h6>
                  <div className="row g-2 g-md-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Hours Worked</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g., 160"
                        name="hours_worked"
                        value={formData.hours_worked}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Hourly Rate (from profile)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Auto-filled from staff profile"
                        readOnly
                        value={formData.staff_id ? getStaffInfo(formData.staff_id)?.hourly_rate || 0 : 0}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Hourly Total</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Auto-calculated"
                        readOnly
                        value={formData.hourly_total}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Fixed Salary</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g., 5000"
                        name="fixed_salary"
                        value={formData.fixed_salary}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                        min="0"
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Commission Total</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g., 1200"
                        name="commission_total"
                        value={formData.commission_total}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* SECTION 3: Bonuses & Deductions */}
                  <h6 className="fw-bold mb-3 fs-6">Bonuses</h6>
                  <div className="mb-3">
                    <div className="row g-2 mb-2">
                      <div className="col-12 col-md-5">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Bonus label (e.g., Performance Bonus)"
                          disabled={modalType === 'view'}
                        />
                      </div>
                      <div className="col-12 col-md-5">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="Amount"
                          disabled={modalType === 'view'}
                          min="0"
                        />
                      </div>
                      <div className="col-12 col-md-2 d-flex align-items-center">
                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm w-100"
                          disabled={modalType === 'view'}
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="border rounded p-2 bg-light small">
                      {formData.bonuses?.length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {formData.bonuses.map((bonus, i) => (
                            <li key={i} className="d-flex justify-content-between">
                              <span>{bonus.label}</span>
                              <span>{formatCurrency(bonus.amount)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">No bonuses added</span>
                      )}
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3 fs-6">Deductions</h6>
                  <div className="mb-3">
                    <div className="row g-2 mb-2">
                      <div className="col-12 col-md-5">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Deduction label (e.g., Tax)"
                          disabled={modalType === 'view'}
                        />
                      </div>
                      <div className="col-12 col-md-5">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="Amount"
                          disabled={modalType === 'view'}
                          min="0"
                        />
                      </div>
                      <div className="col-12 col-md-2 d-flex align-items-center">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm w-100"
                          disabled={modalType === 'view'}
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="border rounded p-2 bg-light small">
                      {formData.deductions?.length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {formData.deductions.map((deduction, i) => (
                            <li key={i} className="d-flex justify-content-between">
                              <span>{deduction.label}</span>
                              <span>{formatCurrency(deduction.amount)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">No deductions added</span>
                      )}
                    </div>
                  </div>

                  {/* SECTION 4: Summary & Status */}
                  <h6 className="fw-bold mb-3 fs-6">Summary</h6>
                  <div className="row g-2 g-md-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Net Pay (auto-calculated)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm fw-bold"
                        value={formData.net_pay}
                        readOnly
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Status</label>
                      <select
                        className="form-select form-select-sm"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                      >
                        <option value="Generated">Generated</option>
                        <option value="Approved">Approved</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                    {formData.status === "Paid" && (
                      <div className="col-12">
                        <label className="form-label small">Paid At</label>
                        <input
                          type="datetime-local"
                          className="form-control form-control-sm"
                          name="paid_at"
                          value={formData.paid_at}
                          onChange={handleInputChange}
                          disabled={modalType === 'view'}
                        />
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-3 py-2 btn-sm"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    {modalType !== 'view' && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#6EB2CC',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontWeight: '500',
                        }}
                        onClick={handleSubmit}
                      >
                        {modalType === 'add' ? 'Generate Salary' : 'Update Record'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeDeleteModal}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold fs-5">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body text-center py-3">
                <div className="display-6 text-danger mb-3">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h5 className="fs-6">Are you sure?</h5>
                <p className="text-muted small">
                  This will permanently delete salary record <strong>{selectedSalary?.salary_id}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-3">
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3 btn-sm"
                    onClick={closeDeleteModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-3 btn-sm"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryCalculator;