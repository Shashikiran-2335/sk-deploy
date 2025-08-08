import React, { useState, useEffect } from 'react';
import './BorrowLogList.css';
import axios from 'axios';

const calculateSubtotal = (item) => item.quantity * item.rate;
const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + calculateSubtotal(item), 0);

const BorrowLogList = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(' https://sk-deploy-backend.onrender.com/borrow');
      const sortedLogs = response.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setLogs(sortedLogs);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure this customer has paid and the log should be deleted?");
    if (!confirmDelete) return;
    try {
      await axios.delete(` https://sk-deploy-backend.onrender.com/borrow/${id}`);
      fetchLogs(); // Refresh list after deletion
    } catch (err) {
      console.error("Error deleting log:", err);
    }
  };

  const isWithinDateRange = (dateStr) => {
    const date = new Date(dateStr);
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;

    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  };

  const filteredLogs = logs.filter((log) =>
    log.customerName.toLowerCase().includes(search.toLowerCase()) &&
    isWithinDateRange(log.date)
  );

  return (
    <div className="log-container">
      <h1>Borrow Logs</h1>

      <input
        type="text"
        className="search-input"
        placeholder="Search by customer name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="date-filter">
        <label>
          From:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          To:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {filteredLogs.length === 0 ? (
        <p className="no-results">No customer found.</p>
      ) : (
        filteredLogs.map((log) => (
          <div className="log-card" key={log._id}>
            <div className="log-header">
              <strong>{log.customerName}</strong> — {log.date}
              <button
                className="delete-btn"
                onClick={() => handleDelete(log._id)}
                title="Mark as paid and remove"
              >
                Mark as Paid ✖
              </button>
            </div>
            <table className="log-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {log.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.itemName}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.rate}</td>
                    <td>₹{calculateSubtotal(item).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="log-total">
                  <td colSpan="3"><strong>Total</strong></td>
                  <td><strong>₹{calculateTotal(log.items).toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default BorrowLogList;
