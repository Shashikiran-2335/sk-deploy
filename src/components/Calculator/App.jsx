import React, { useState } from 'react';

const CalculatorApp = () => {
  const [primes, setPrimes] = useState([]);
  const [fibonacci, setFibonacci] = useState([]);
  const [even, setEven] = useState([]);
  const [random, setRandom] = useState([]);

  // Timeout function to reject promise if it takes more than 500ms
  const timeoutPromise = (ms, promise) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, ms);

      promise
        .then((response) => {
          clearTimeout(timeout);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  };

  const fetchPrimes = async () => {
    try {
      const response = await timeoutPromise(
        500,
        fetch('http://localhost:3000/test/primes')
      );
      const data = await response.json();
      setPrimes(data.numbers);
      return data.numbers;
    } catch (error) {
      return []; // Return empty array if there's an error or timeout
    }
  };

  const fetchFibonacci = async () => {
    try {
      const response = await timeoutPromise(
        500,
        fetch('http://localhost:3000/test/fibo')
      );
      const data = await response.json();
      setFibonacci(data.numbers);
      return data.numbers;
    } catch (error) {
      return []; // Return empty array if there's an error or timeout
    }
  };

  const fetchEven = async () => {
    try {
      const response = await timeoutPromise(
        500,
        fetch('http://localhost:3000/test/even', {
            method: 'POST', // Set method to POST
            headers: {
              'Content-Type': 'application/json', // Add headers if necessary
            },
            // body: JSON.stringify({ /* Add any payload if needed */ })
          })
    
      );
      const data = await response.json();
      console.log(data);
      setEven(data.numbers);
      return data.numbers;
    } catch (error) {
      return []; // Return empty array if there's an error or timeout
    }
  };

  const fetchRandom = async () => {
    try {
      const response = await timeoutPromise(
        500,
        fetch('http://localhost:3000/test/rand')
      );
      const data = await response.json();
      setRandom(data.numbers);
      return data.numbers;
    } catch (error) {
      return []; // Return empty array if there's an error or timeout
    }
  };

  return (
    <div>
      <h1>API Demo</h1>

      <div>
        <h2>Primes</h2>
        <button onClick={fetchPrimes}>Get Primes</button>
        <ul>
          {primes.map((num, index) => (
            <li key={index}>{num}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Fibonacci</h2>
        <button onClick={fetchFibonacci}>Get Fibonacci</button>
        <ul>
          {fibonacci.map((num, index) => (
            <li key={index}>{num}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Even</h2>
        <button onClick={fetchEven}>Get Even Numbers</button>
        <ul>
          {even.map((num, index) => (
            <li key={index}>{num}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Random</h2>
        <button onClick={fetchRandom}>Get Random Numbers</button>
        <ul>
          {random.map((num, index) => (
            <li key={index}>{num}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CalculatorApp;
