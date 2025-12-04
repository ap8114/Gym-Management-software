import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaFileExport,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilePdf,
  FaTrash,
  FaArrowRight,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { BsEye } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";

const tabs = ["All Payments", "Failed Transactions", "Payment Settings"];

const transactions = [
  { id: "TXN-23456", date: "Jun 27, 2025", customer: "John Smith", method: { name: "Credit Card" }, amount: "$1,299.99", status: "Success", reason: "" },
  { id: "TXN-23455", date: "Jun 27, 2025", customer: "Emily Johnson", method: { name: "PayPal" }, amount: "$499.50", status: "Success", reason: "" },
  { id: "TXN-23454", date: "Jun 26, 2025", customer: "Michael Brown", method: { name: "Credit Card" }, amount: "$899.00", status: "Failed", reason: "Insufficient funds" },
  { id: "TXN-23453", date: "Jun 26, 2025", customer: "Sarah Williams", method: { name: "Bank Transfer" }, amount: "$149.99", status: "Success", reason: "" },
  { id: "TXN-23452", date: "Jun 25, 2025", customer: "David Miller", method: { name: "Credit Card" }, amount: "$2,499.00", status: "Pending", reason: "" },
  { id: "TXN-23451", date: "Jun 25, 2025", customer: "Jessica Davis", method: { name: "Digital Wallet" }, amount: "$349.95", status: "Success", reason: "" },
  { id: "TXN-23450", date: "Jun 24, 2025", customer: "Robert Wilson", method: { name: "Credit Card" }, amount: "$799.50", status: "Failed", reason: "Expired card" },
];

const Payments = () => {
  const [activeTab, setActiveTab] = useState("All Payments");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionsList, setTransactionsList] = useState(transactions);
  const [paymentSettings, setPaymentSettings] = useState({
    currency: "USD",
    autoRefund: true,
    notifications: true,
    paymentMethods: ["Credit Card", "PayPal", "Bank Transfer", "Digital Wallet"]
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    id: "",
    date: "",
    customer: "",
    method: "",
    amount: "",
    status: "",
    reason: ""
  });

  const handleViewDetails = (txn) => {
    setSelectedTransaction(txn);
    setShowModal(true);
  };

  const handleEditClick = (txn) => {
    setSelectedTransaction(txn);
    setEditForm({
      id: txn.id,
      date: txn.date,
      customer: txn.customer,
      method: txn.method.name,
      amount: txn.amount,
      status: txn.status,
      reason: txn.reason || ""
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (txn) => {
    setTransactionToDelete(txn);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedTransactions = transactionsList.map(txn => 
      txn.id === editForm.id 
        ? { ...txn, 
            customer: editForm.customer,
            method: { name: editForm.method },
            amount: editForm.amount,
            status: editForm.status,
            reason: editForm.reason
          }
        : txn
    );
    setTransactionsList(updatedTransactions);
    setShowEditModal(false);
    alert("Transaction updated successfully!");
  };

  const handleConfirmDelete = () => {
    setTransactionsList(transactionsList.filter(txn => txn.id !== transactionToDelete.id));
    setShowDeleteModal(false);
    setTransactionToDelete(null);
    alert("Transaction deleted successfully!");
  };

  const handleExportTransaction = (txn) => {
    alert(`Transaction ${txn.id} export requires html2canvas.`);
  };

  const handleExportAll = () => {
    const headers = ["ID", "Date", "Customer", "Method", "Amount", "Status"];
    const csvContent = [
      headers.join(","),
      ...transactionsList.map(txn =>
        [txn.id, txn.date, txn.customer, txn.method.name, txn.amount, txn.status].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePDFDownload = () => {
    alert("PDF requires html2canvas + jspdf.");
  };

  const handleSettingChange = (setting, value) => {
    setPaymentSettings({ ...paymentSettings, [setting]: value });
  };

  const filteredTransactions = transactionsList.filter(txn => {
    const matchesTab = activeTab === "Failed Transactions" ? txn.status === "Failed" : true;
    const matchesSearch = searchTerm === "" ||
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.customer.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Action buttons component for consistency - First Screenshot Style
  const ActionButtons1 = ({ txn }) => (
    <div className="d-flex gap-2">
      <button 
        className="action-btn arrow-btn" 
        onClick={() => alert("Forward action")}
        title="Forward"
      >
        <FaArrowRight size={14} />
      </button>
      <button 
        className="action-btn check-btn" 
        onClick={() => alert("Approve action")}
        title="Approve"
      >
        <FaCheck size={14} />
      </button>
      <button 
        className="action-btn trash-btn" 
        onClick={() => handleDeleteClick(txn)}
        title="Delete"
      >
        <FaTrash size={14} />
      </button>
    </div>
  );

  // Action buttons component for consistency - Second Screenshot Style
  const ActionButtons2 = ({ txn }) => (
    <div className="d-flex gap-2">
      <button 
        className="action-btn eye-btn" 
        onClick={() => handleViewDetails(txn)}
        title="View Details"
      >
        <BsEye size={14} />
      </button>
      <button 
        className="action-btn edit-btn" 
        onClick={() => handleEditClick(txn)}
        title="Edit Transaction"
      >
        <FaEdit size={14} />
      </button>
      <button 
        className="action-btn trash-btn" 
        onClick={() => handleDeleteClick(txn)}
        title="Delete Transaction"
      >
        <FaTrash size={14} />
      </button>
    </div>
  );

  return (
    <div className="container-fluid p-2 p-sm-3 p-md-4">

      {/* HEADER */}
      <div className="row mb-3 mb-md-4">
        <div className="col-12 col-md-8 mb-3 mb-md-0">
          <h4 className="fw-bold fs-4 fs-md-3">Payments</h4>
          <p className="text-muted mb-0 fs-6">Manage all your payment transactions</p>
        </div>
        <div className="col-12 col-md-4">
          <div className="d-flex gap-2 flex-wrap justify-content-md-end">
            <button className="btn btn-custom d-flex align-items-center gap-2 px-3 py-2 flex-fill flex-md-grow-0" onClick={handleExportAll}>
              <FaFileExport /> <span className="d-none d-sm-inline">Export CSV</span>
            </button>
            <button className="btn btn-custom px-3 py-2" onClick={handlePDFDownload}>
              <FaFilePdf size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="icon-card bg-info text-white"><FaChartLine /></div>
                <h6 className="text-muted mb-0">Total Revenue</h6>
              </div>
              <h5 className="fw-bold">$12,345.67</h5>
              <p className="text-success small mb-0">↑ 12.5% from last month</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="icon-card bg-success text-white"><FaCheckCircle /></div>
                <h6 className="text-muted mb-0">Success Rate</h6>
              </div>
              <h5 className="fw-bold">94.2%</h5>
              <p className="text-success small mb-0">↑ 2.1% from last month</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="icon-card bg-danger text-white"><FaExclamationTriangle /></div>
                <h6 className="text-muted mb-0">Failed Transactions</h6>
              </div>
              <h5 className="fw-bold text-danger">24</h5>
              <p className="text-danger small mb-0">↓ 5.3% from last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-3 overflow-auto">
        <ul className="nav nav-tabs flex-nowrap" style={{ minWidth: "max-content" }}>
          {tabs.map(tab => (
            <li className="nav-item" key={tab}>
              <button className={`nav-link ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* SEARCH BAR */}
      {(activeTab === "All Payments" || activeTab === "Failed Transactions") && (
        <div className="mb-3">
          <input
            type="text"
            className="form-control search-bar"
            placeholder="Search by transaction ID or customer name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* DESKTOP TABLE VIEW - SECOND SCREENSHOT STYLE (WITH FUNCTIONALITY) */}
      {(activeTab === "All Payments" || activeTab === "Failed Transactions") && (
        <div className="table-responsive bg-white rounded shadow-sm p-3 d-none d-md-block" id="transaction-table">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th><input type="checkbox" /></th>
                <th>ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((txn, idx) => (
                <tr key={idx}>
                  <td><input type="checkbox" /></td>
                  <td>{txn.id}</td>
                  <td>{txn.date}</td>
                  <td><strong>{txn.customer}</strong></td>
                  <td>{txn.method.name}</td>
                  <td>{txn.amount}</td>

                  <td>
                    {txn.status === "Success" && <span className="badge bg-success">Success</span>}
                    {txn.status === "Failed" && (
                      <>
                        <span className="badge bg-danger">Failed</span><br />
                        <small className="text-danger">{txn.reason}</small>
                      </>
                    )}
                    {txn.status === "Pending" && <span className="badge bg-warning text-dark">Pending</span>}
                  </td>

                  {/* FUNCTIONAL ACTION BUTTONS */}
                  <td>
                    <ActionButtons2 txn={txn} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE CARD VIEW */}
      {(activeTab === "All Payments" || activeTab === "Failed Transactions") && (
        <div className="d-md-none">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded shadow-sm p-4 text-center">
              <p className="text-muted">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((txn, idx) => (
              <div key={idx} className="card shadow-sm mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="card-title mb-1">{txn.id}</h6>
                      <p className="text-muted small mb-0">{txn.date}</p>
                    </div>
                    <div>
                      {txn.status === "Success" && <span className="badge bg-success">Success</span>}
                      {txn.status === "Failed" && <span className="badge bg-danger">Failed</span>}
                      {txn.status === "Pending" && <span className="badge bg-warning text-dark">Pending</span>}
                    </div>
                  </div>
                  
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <small className="text-muted d-block">Customer</small>
                      <span className="fw-semibold">{txn.customer}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Amount</small>
                      <span className="fw-semibold">{txn.amount}</span>
                    </div>
                  </div>
                  
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Method</small>
                      <span>{txn.method.name}</span>
                    </div>
                    {txn.status === "Failed" && txn.reason && (
                      <div className="col-12">
                        <small className="text-muted d-block">Reason</small>
                        <span className="text-danger small">{txn.reason}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* FUNCTIONAL ACTION BUTTONS FOR MOBILE */}
                  <div className="d-flex justify-content-end gap-2">
                    <ActionButtons2 txn={txn} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PAYMENT SETTINGS */}
      {activeTab === "Payment Settings" && (
        <div className="bg-white rounded shadow-sm p-4">
          <h5 className="mb-4">Payment Settings</h5>
          
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label className="form-label fw-semibold">Default Currency</label>
                <select 
                  className="form-select" 
                  value={paymentSettings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>
            </div>
            
            <div className="col-12 col-md-6">
              <div className="mb-3">
                <label className="form-label fw-semibold">Payment Methods</label>
                <div className="d-flex flex-wrap gap-2">
                  {paymentSettings.paymentMethods.map((method, idx) => (
                    <span key={idx} className="badge bg-light text-dark p-2">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="col-12">
              <div className="form-check form-switch mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="autoRefund"
                  checked={paymentSettings.autoRefund}
                  onChange={(e) => handleSettingChange('autoRefund', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="autoRefund">
                  Enable automatic refunds for failed transactions
                </label>
              </div>
              
              <div className="form-check form-switch">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="notifications"
                  checked={paymentSettings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="notifications">
                  Send email notifications for payment status changes
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button className="btn btn-custom">Save Settings</button>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL - COMPACT SIZE */}
      {showModal && selectedTransaction && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-compact">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h5 className="modal-title">Transaction Details</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body py-3">
                <div className="card border-0 bg-light mb-3">
                  <div className="card-body p-3">
                    <div className="row g-2">
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small mb-1">Transaction ID</label>
                        <p className="fw-bold mb-0">{selectedTransaction.id}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small mb-1">Date</label>
                        <p className="fw-bold mb-0">{selectedTransaction.date}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small mb-1">Customer Name</label>
                        <p className="fw-bold mb-0">{selectedTransaction.customer}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small mb-1">Payment Method</label>
                        <p className="fw-bold mb-0">{selectedTransaction.method.name}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small mb-1">Amount</label>
                        <p className="fw-bold mb-0 text-success">{selectedTransaction.amount}</p>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small mb-1">Status</label>
                        <div>
                          {selectedTransaction.status === "Success" && <span className="badge bg-success">Success</span>}
                          {selectedTransaction.status === "Failed" && <span className="badge bg-danger">Failed</span>}
                          {selectedTransaction.status === "Pending" && <span className="badge bg-warning text-dark">Pending</span>}
                        </div>
                      </div>
                      {selectedTransaction.reason && (
                        <div className="col-12">
                          <label className="form-label text-muted small mb-1">Reason</label>
                          <p className="fw-bold mb-0 text-danger">{selectedTransaction.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer py-2">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TRANSACTION MODAL - COMPACT SIZE */}
      {showEditModal && selectedTransaction && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-compact">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h5 className="modal-title">Edit Transaction</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body py-3">
                  <div className="row g-2">
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Transaction ID</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        value={editForm.id} 
                        disabled
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Customer Name</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        value={editForm.customer} 
                        onChange={(e) => setEditForm({...editForm, customer: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Payment Method</label>
                      <select 
                        className="form-select form-select-sm" 
                        value={editForm.method} 
                        onChange={(e) => setEditForm({...editForm, method: e.target.value})}
                        required
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Digital Wallet">Digital Wallet</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Amount</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        value={editForm.amount} 
                        onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold small">Status</label>
                      <select 
                        className="form-select form-select-sm" 
                        value={editForm.status} 
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        required
                      >
                        <option value="Success">Success</option>
                        <option value="Failed">Failed</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    {editForm.status === "Failed" && (
                      <div className="col-12">
                        <label className="form-label fw-semibold small">Reason</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          value={editForm.reason} 
                          onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                          placeholder="Enter reason for failure"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-custom btn-sm">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL - COMPACT SIZE */}
      {showDeleteModal && transactionToDelete && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-compact">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h5 className="modal-title">Confirm Delete</h5>
                <button className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body py-3">
                <div className="text-center py-2">
                  <div className="mb-2">
                    <FaTrash size={36} className="text-danger" />
                  </div>
                  <h6>Are you sure?</h6>
                  <p className="text-muted small">This action cannot be undone. This will permanently delete the transaction.</p>
                  <div className="alert alert-danger py-2">
                    <strong>Transaction ID:</strong> {transactionToDelete.id}<br />
                    <strong>Customer:</strong> {transactionToDelete.customer}<br />
                    <strong>Amount:</strong> {transactionToDelete.amount}
                  </div>
                </div>
              </div>
              <div className="modal-footer py-2">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger btn-sm" onClick={handleConfirmDelete}>Delete Transaction</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .search-bar { 
          border-radius:10px; 
          padding:0.6rem 1rem; 
          border: 1px solid #e0e0e0;
        }
        
        .btn-custom { 
          background-color:#6EB2CC; 
          color:white; 
          border:none; 
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .btn-custom:hover {
          background-color:#5a9db5;
          transform: translateY(-1px);
        }
        
        .icon-card { 
          width:40px; 
          height:40px; 
          border-radius:8px; 
          display:flex; 
          align-items:center; 
          justify-content:center; 
          font-size: 18px;
        }

        /* SECOND SCREENSHOT STYLE ACTION BUTTONS */
        .action-btn {
          width: 38px;
          height: 38px;
          border-radius: 6px;
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        }
        
        .eye-btn {
          background: white;
          border-color: #c9c9c9;
          color: #333;
        }
        
        .eye-btn:hover {
          background: #f8f9fa;
          border-color: #a0a0a0;
        }
        
        .edit-btn {
          background: #e6f7ff;
          border-color: #86c9ef;
          color: #0077b6;
        }
        
        .edit-btn:hover {
          background: #d0ebff;
          border-color: #5ca9d9;
        }
        
        .trash-btn {
          background: #ffe5e5;
          border-color: #ff4d4d;
          color: #d90429;
        }
        
        .trash-btn:hover {
          background: #ffcccc;
          border-color: #e63946;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .action-btn {
            width: 35px;
            height: 35px;
          }
          
          .action-btn svg {
            font-size: 12px;
          }
        }

        /* Tab responsiveness */
        .nav-tabs .nav-link {
          white-space: nowrap;
          padding: 0.5rem 1rem;
        }

        /* Card hover effects */
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        /* Table hover effects */
        .table-hover tbody tr:hover {
          background-color: #f8f9fa;
        }

        /* Modal enhancements - COMPACT SIZE */
        .modal-compact {
          max-width: 500px;
        }
        
        @media (max-width: 576px) {
          .modal-compact {
            max-width: 95%;
            margin: 10px;
          }
        }

        .modal-content {
          border-radius: 12px;
          border: none;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }

        .modal-header {
          border-bottom: 1px solid #e9ecef;
          padding: 1rem 1.5rem;
        }

        .modal-body {
          padding: 1rem 1.5rem;
        }

        .modal-footer {
          border-top: 1px solid #e9ecef;
          padding: 1rem 1.5rem;
        }
      `}</style>

    </div>
  );
};

export default Payments;