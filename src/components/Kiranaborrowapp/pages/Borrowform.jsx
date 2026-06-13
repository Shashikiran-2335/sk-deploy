import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';
import { Plus, Trash2, Save, Calendar, Clock, User } from 'lucide-react';

const PRODUCT_API_URL = API_BASE_URL.replace('/borrow', '/products');

const BorrowEntryForm = () => {
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [pickedUpBy, setPickedUpBy] = useState('');
  const [items, setItems] = useState([{ itemName: '', quantity: '', rate: '' }]);
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Database products and dynamic most-used tags states
  const [productsList, setProductsList] = useState([]);
  const [quickTags, setQuickTags] = useState([]);

  useEffect(() => {
    // Fetch unique customer names, products directory, and logs to calculate popularity
    const loadFormData = async () => {
      try {
        // Fetch customers and products in parallel
        const [customerRes, productRes, logsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/customers`),
          axios.get(PRODUCT_API_URL),
          axios.get(API_BASE_URL)
        ]);

        setCustomerList(customerRes.data || []);
        
        const products = productRes.data || [];
        setProductsList(products);

        const logs = logsRes.data || [];
        
        // Count product frequency across logs
        const productCounts = {};
        logs.forEach(log => {
          if (log.items) {
            log.items.forEach(item => {
              const nameKey = item.itemName.toLowerCase().trim();
              productCounts[nameKey] = (productCounts[nameKey] || 0) + 1;
            });
          }
        });

        // Sort products by frequency (highest first)
        const sortedProducts = [...products].sort((a, b) => {
          const countA = productCounts[a.name.toLowerCase().trim()] || 0;
          const countB = productCounts[b.name.toLowerCase().trim()] || 0;
          
          if (countA !== countB) {
            return countB - countA; // Most popular first
          }
          return a.name.localeCompare(b.name); // Alphabetical fallback
        });

        // Show top 10 most used tags, or fallback to seeded catalog
        setQuickTags(sortedProducts.slice(0, 10));
      } catch (error) {
        console.error('Error loading form options:', error);
        toast.error('Failed to load products or customer suggestions.');
      }
    };

    loadFormData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Auto-populate rate if a matching product is selected from database products
    if (field === 'itemName') {
      const matchedProduct = productsList.find(
        p => p.name.toLowerCase() === value.trim().toLowerCase()
      );
      if (matchedProduct) {
        newItems[index].rate = matchedProduct.rate;
      }
    }
    
    setItems(newItems);
  };

  const handleQuickAdd = (product) => {
    // Find if there's a completely empty row to overwrite
    const emptyRowIndex = items.findIndex(
      item => item.itemName.trim() === '' && !item.quantity && !item.rate
    );

    if (emptyRowIndex !== -1) {
      const newItems = [...items];
      newItems[emptyRowIndex] = { itemName: product.name, quantity: 1, rate: product.rate };
      setItems(newItems);
    } else {
      setItems([...items, { itemName: product.name, quantity: 1, rate: product.rate }]);
    }
    toast.info(`Added ${product.name} (₹${product.rate})`);
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
    
    if (!customerName.trim()) {
      toast.error('Customer name is required!');
      return;
    }

    const validItems = items.filter(item => item.itemName.trim() !== '' && parseFloat(item.quantity) > 0 && parseFloat(item.rate) > 0);
    if (validItems.length === 0) {
      toast.error('At least one item with valid quantity and rate is required!');
      return;
    }

    const borrowData = {
      customerName: customerName.trim(),
      date,
      time,
      pickedUpBy: pickedUpBy.trim(),
      items: validItems,
      totalCost,
    };

    try {
      setLoading(true);
      await axios.post(API_BASE_URL, borrowData);
      toast.success('Borrow entry logged successfully!');

      // Reset form
      setCustomerName('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(() => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      });
      setPickedUpBy('');
      setItems([{ itemName: '', quantity: '', rate: '' }]);
      
      // Refresh customer list
      const customerRes = await axios.get(`${API_BASE_URL}/customers`);
      setCustomerList(customerRes.data || []);
      
      // Refresh popularity sorting
      const logsRes = await axios.get(API_BASE_URL);
      const logs = logsRes.data || [];
      const productCounts = {};
      logs.forEach(log => {
        if (log.items) {
          log.items.forEach(item => {
            const nameKey = item.itemName.toLowerCase().trim();
            productCounts[nameKey] = (productCounts[nameKey] || 0) + 1;
          });
        }
      });
      const sortedProducts = [...productsList].sort((a, b) => {
        const countA = productCounts[a.name.toLowerCase().trim()] || 0;
        const countB = productCounts[b.name.toLowerCase().trim()] || 0;
        if (countA !== countB) return countB - countA;
        return a.name.localeCompare(b.name);
      });
      setQuickTags(sortedProducts.slice(0, 10));

    } catch (error) {
      toast.error('Error saving borrow entry. Please try again.');
      console.error('Submit Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-10">
        
        {/* Header */}
        <header className="mb-8 text-left border-b border-border pb-6">
          <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            New Credit Entry
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-secondary sm:text-4xl">
            Add Borrow Record
          </h1>
          <p className="mt-2 text-muted-foreground">
            Record outstanding customer purchase details.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-left">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="customer-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                <User className="mr-1 h-3.5 w-3.5" /> Customer Name
              </label>
              <input
                id="customer-name"
                list="customer-suggestions"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Type or select customer..."
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
              <datalist id="customer-suggestions">
                {customerList.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="picked-up-by" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Picked Up By (Optional)
              </label>
              <input
                id="picked-up-by"
                type="text"
                value={pickedUpBy}
                onChange={(e) => setPickedUpBy(e.target.value)}
                placeholder="Representative name (e.g. Son, Wife)"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="borrow-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                <Calendar className="mr-1 h-3.5 w-3.5" /> Transaction Date
              </label>
              <input
                id="borrow-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="borrow-time" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                <Clock className="mr-1 h-3.5 w-3.5" /> Transaction Time
              </label>
              <input
                id="borrow-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="border-t border-border pt-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-secondary">Items Purchased</h2>
              <button 
                type="button" 
                className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white" 
                onClick={addItem}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Item
              </button>
            </div>
            
            {/* Dynamic Quick-Add pill tags sorted by usage frequency */}
            {quickTags.length > 0 && (
              <div className="mb-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Most Used Tags:</span>
                <div className="flex flex-wrap gap-2 py-1 max-h-24 overflow-y-auto">
                  {quickTags.map((prod) => (
                    <button
                      key={prod._id}
                      type="button"
                      className="inline-flex items-center space-x-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-secondary hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
                      onClick={() => handleQuickAdd(prod)}
                    >
                      <span>{prod.icon || '📦'}</span> 
                      <span>{prod.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div 
                  className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between" 
                  key={index}
                >
                  <div className="grid grid-cols-12 gap-2 flex-1">
                    <div className="col-span-12 sm:col-span-6">
                      <input
                        type="text"
                        placeholder="Item Name"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                        list="products-suggestions"
                        className="w-full rounded border border-input bg-card px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <input
                        type="number"
                        placeholder="Qty"
                        min="0.01"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full rounded border border-input bg-card px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <input
                        type="number"
                        placeholder="Rate (₹)"
                        min="0.01"
                        step="any"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        className="w-full rounded border border-input bg-card px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-4 border-t border-dashed border-border pt-2 sm:border-0 sm:pt-0">
                    <span className="text-sm font-semibold text-secondary">
                      ₹{getSubtotal(item).toFixed(2)}
                    </span>
                    {items.length > 1 && (
                      <button 
                        type="button" 
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-colors" 
                        onClick={() => removeItem(index)}
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions Catalog */}
            <datalist id="products-suggestions">
              {productsList.map((prod) => (
                <option key={prod._id} value={prod.name} />
              ))}
            </datalist>
          </div>

          {/* Form Summary */}
          <div className="rounded-lg bg-muted p-4 flex justify-between items-center text-left">
            <span className="text-sm font-medium text-muted-foreground">Total Payable Amount</span>
            <strong className="text-2xl font-extrabold text-secondary">₹{totalCost.toFixed(2)}</strong>
          </div>

          <button 
            type="submit" 
            className="flex w-full items-center justify-center rounded-md bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            disabled={loading}
          >
            <Save className="mr-1.5 h-4.5 w-4.5" />
            {loading ? 'Saving entry...' : 'Save Borrow Log'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BorrowEntryForm;
