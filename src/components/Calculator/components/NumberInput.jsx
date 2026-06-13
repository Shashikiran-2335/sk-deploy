import React, { useState } from 'react';

const NumberInput = ({ onCalculate }) => {
  const [numberId, setNumberId] = useState('p');

  const handleCalculate = () => {
    onCalculate(numberId);
  };

  return (
    <div>
      <label htmlFor="numberId">Select Number ID:</label>
      <select
        id="numberId"
        value={numberId}
        onChange={(e) => setNumberId(e.target.value)}
      >
        <option value="p">Prime</option>
        <option value="f">Fibonacci</option>
        <option value="e">Even</option>
        <option value="r">Random</option>
      </select>
      <button onClick={handleCalculate}>Calculate</button>
    </div>
  );
};

export default NumberInput;