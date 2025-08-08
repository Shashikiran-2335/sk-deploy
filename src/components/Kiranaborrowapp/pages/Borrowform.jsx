import React, { useState, useEffect } from 'react';
import './BorrowEntryForm.css';
import axios from 'axios';

const BorrowEntryForm = () => {
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([{ itemName: '', quantity: '', rate: '' }]);
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch unique customer names from backend
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(' https://sk-deploy-backend.onrender.com/borrow/customers');
        console.log(response.data);
        setCustomerList(response.data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { itemName: '', quantity: '', rate: '' }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const getSubtotal = (item) => {
    const q = parseFloat(item.quantity) || 0;
    const r = parseFloat(item.rate) || 0;
    return q * r;
  };

  const totalCost = items.reduce((total, item) => total + getSubtotal(item), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const borrowData = {
      customerName,
      date,
      items,
      totalCost,
    };

    try {
      setLoading(true);
      const response = await axios.post(' https://sk-deploy-backend.onrender.com/borrow', borrowData);
      alert('Borrow entry saved successfully!');
      console.log(response.data);

      // Reset form
      setCustomerName('');
      setDate(new Date().toISOString().split('T')[0]);
      setItems([{ itemName: '', quantity: '', rate: '' }]);
    } catch (error) {
      alert('Error saving borrow entry. Please try again.');
      console.error('Submit Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Kirana Borrow Entry</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Customer Name:</label>
          <input
            list="customer-suggestions"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
          <datalist id="customer-suggestions">
            {customerList.map((name, index) => (
              <option key={index} value={name} />
            ))}
          </datalist>
        </div>

        <div className="form-row">
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <h2>Items</h2>
        {items.map((item, index) => (
          <div className="item-row" key={index}>
            <input
              type="text"
              placeholder="Item Name"
              value={item.itemName}
              onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Rate"
              value={item.rate}
              onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
              required
            />
            <span className="subtotal">₹{getSubtotal(item).toFixed(2)}</span>
            {items.length > 1 && (
              <button type="button" className="remove-btn" onClick={() => removeItem(index)}>
                ❌
              </button>
            )}
          </div>
        ))}

        <button type="button" className="add-btn" onClick={addItem}>+ Add Item</button>

        <div className="total-cost">
          <strong>Total: ₹{totalCost.toFixed(2)}</strong>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default BorrowEntryForm;
