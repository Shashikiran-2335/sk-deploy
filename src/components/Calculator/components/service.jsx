const generatePrimes = (count) => {
    const primes = [];
    let num = 2;
  
    while (primes.length < count) {
      let isPrime = true;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime) primes.push(num);
      num++;
    }
  
    return primes;
  };
  
  const generateFibonacci = (count) => {
    const fibs = [0, 1];
    while (fibs.length < count) {
      const nextFib = fibs[fibs.length - 1] + fibs[fibs.length - 2];
      fibs.push(nextFib);
    }
  
    return fibs.slice(0, count);
  };
  
  const generateEvens = (count) => {
    return Array.from({ length: count }, (_, i) => 2 * (i + 1));
  };
  
  const generateRandomNumbers = (count) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 100) + 1);
  };
  
  export const generateNumbers = (type, count = 10) => {
    switch (type) {
      case 'p':
        return generatePrimes(count);
      case 'f':
        return generateFibonacci(count);
      case 'e':
        return generateEvens(count);
      case 'r':
        return generateRandomNumbers(count);
      default:
        return [];
    }
  };
  
  export const calculateAverage = (numbers) => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
  };