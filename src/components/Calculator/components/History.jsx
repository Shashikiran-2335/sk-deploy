import React from 'react';

const History = ({ history }) => {
  return (
    <div>
      <h2>Calculation History</h2>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>
            {entry.type} - Numbers: {entry.numbers.join(', ')} | Average: {entry.average}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;