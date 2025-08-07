import React, { useState } from 'react';
import axios from 'axios';

const AddBorrowPage = () => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/borrow', { name, amount });
    alert('Borrow added');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer Name" />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
      <button type="submit">Submit</button>
    </form>
  );
};

export default AddBorrowPage;
