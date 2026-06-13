import React from 'react';

const ResultDisplay = ({ result }) => {
  return (
    <div>
      <h2>Calculation Result</h2>
      <p>Numbers: {result.numbers.join(', ')}</p>
      <p>Average: {result.average}</p>
    </div>
  );
};

export default ResultDisplay;