// Configuration for API requests
const getApiUrl = () => {
  const localBackend = 'http://localhost:5000/borrow';
  const prodBackend = 'https://sk-deploy-backend.onrender.com/borrow';

  // Check if we are running locally in development
  if (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.')
  ) {
    return localBackend;
  }
  return prodBackend;
};

export const API_BASE_URL = getApiUrl();

// Common grocery products and their default rates (in ₹) for quick-add and autocomplete
export const COMMON_PRODUCTS = [
  { name: 'Milk', rate: 30, icon: '🥛' },
  { name: 'Bread', rate: 40, icon: '🍞' },
  { name: 'Eggs (1 Dozen)', rate: 80, icon: '🥚' },
  { name: 'Sugar (1 kg)', rate: 45, icon: '🍬' },
  { name: 'Rice (1 kg)', rate: 60, icon: '🌾' },
  { name: 'Cooking Oil (1 L)', rate: 140, icon: '🧴' },
  { name: 'Tea Powder (250g)', rate: 70, icon: '☕' },
  { name: 'Wheat Flour (5 kg)', rate: 220, icon: '🌾' },
  { name: 'Salt (1 kg)', rate: 20, icon: '🧂' },
  { name: 'Soap', rate: 25, icon: '🧼' },
  { name: 'Biscuits', rate: 15, icon: '🍪' }
];
