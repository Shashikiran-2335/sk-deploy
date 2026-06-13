import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';
import { Package, Trash2, Edit2, Plus, X, Save, Search } from 'lucide-react';

const PRODUCT_API_URL = API_BASE_URL.replace('/borrow', '/products');

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [icon, setIcon] = useState('📦');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Edit form states
  const [editName, setEditName] = useState('');
  const [editRate, setEditRate] = useState('');
  const [editIcon, setEditIcon] = useState('');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleSearch = (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    setActiveSearch(searchQuery);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = (product.name || '').toString().toLowerCase();
      const matchesSearch = productName.includes(activeSearch.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || (product.icon || '📦') === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, activeSearch, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(PRODUCT_API_URL);
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error loading products directory:', err);
      toast.error('Failed to load products directory.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || isNaN(parseFloat(rate))) {
      toast.error('Product name and a valid numeric rate are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(PRODUCT_API_URL, {
        name: name.trim(),
        rate: parseFloat(rate),
        icon: icon.trim()
      });
      toast.success(res.data.message || 'Product created successfully!');
      
      // Reset form
      setName('');
      setRate('');
      setIcon('📦');
      
      // Refresh catalog
      fetchProducts();
    } catch (err) {
      console.error('Error creating product:', err);
      toast.error(err.response?.data?.message || 'Error creating product.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (product) => {
    setEditingId(product._id);
    setEditName(product.name);
    setEditRate(product.rate);
    setEditIcon(product.icon || '📦');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim() || isNaN(parseFloat(editRate))) {
      toast.error('Name and rate are required.');
      return;
    }

    try {
      const res = await axios.put(`${PRODUCT_API_URL}/${id}`, {
        name: editName.trim(),
        rate: parseFloat(editRate),
        icon: editIcon.trim()
      });
      toast.success(res.data.message || 'Product updated successfully!');
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error(err.response?.data?.message || 'Error updating product.');
    }
  };

  const handleDelete = async (id, productName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${productName}" from the items directory?`);
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`${PRODUCT_API_URL}/${id}`);
      toast.success(res.data.message || 'Product deleted successfully!');
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-secondary sm:text-4xl">
          Manage Items Directory
        </h1>
        <p className="mt-2 text-muted-foreground">
          Add, edit, or delete items and update default prices in your store catalog.
        </p>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column: Add product form */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-secondary mb-5">Add New Product</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="prod-icon" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Item Icon (Emoji)
                </label>
                <select 
                  id="prod-icon"
                  value={icon} 
                  onChange={(e) => setIcon(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="📦">📦 General Box</option>
                  <option value="🥛">🥛 Milk / Dairy</option>
                  <option value="🍞">🍞 Bread / Bakery</option>
                  <option value="🥚">🥚 Eggs</option>
                  <option value="🍬">🍬 Sugar / Sweets</option>
                  <option value="🌾">🌾 Rice / Grains / Flour</option>
                  <option value="🧴">🧴 Oil / Liquid</option>
                  <option value="☕">☕ Tea / Coffee</option>
                  <option value="🧂">🧂 Salt / Spices</option>
                  <option value="🧼">🧼 Soap / Cleaning</option>
                  <option value="🍪">🍪 Biscuits / Snacks</option>
                  <option value="🥔">🥔 Potato / Veggies</option>
                  <option value="🍎">🍎 Apples / Fruits</option>
                  <option value="🥤">🥤 Soda / Cold Drink</option>
                  <option value="🍺">🍺 Beer</option>
                  <option value="🍷">🍷 Wine / Alcohol</option>
                  <option value="🥃">🥃 Whiskey / Liquor</option>
                  <option value="🚬">🚬 Cigarettes / Tobacco</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="prod-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Name
                </label>
                <input
                  id="prod-name"
                  type="text"
                  placeholder="e.g. Rice (1 kg)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="prod-rate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Default Rate (₹)
                </label>
                <input
                  id="prod-rate"
                  type="number"
                  placeholder="e.g. 60"
                  step="any"
                  min="0"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="flex w-full items-center justify-center rounded-md bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                disabled={loading}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {loading ? 'Adding...' : 'Add Item Tag'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Products Directory list */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="text-lg font-bold text-secondary">
                Products Directory ({filteredProducts.length} of {products.length})
              </h2>
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row text-left">
              {/* Search Input with Button */}
              <div className="flex flex-1">
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full rounded-l-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={(e) => handleSearch(e)}
                  className="inline-flex items-center rounded-r-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/95 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {/* Category Filter Select */}
              <div className="w-full sm:w-48">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Categories</option>
                  <option value="📦">📦 General Box</option>
                  <option value="🥛">🥛 Milk / Dairy</option>
                  <option value="🍞">🍞 Bread / Bakery</option>
                  <option value="🥚">🥚 Eggs</option>
                  <option value="🍬">🍬 Sugar / Sweets</option>
                  <option value="🌾">🌾 Rice / Grains / Flour</option>
                  <option value="🧴">🧴 Oil / Liquid</option>
                  <option value="☕">☕ Tea / Coffee</option>
                  <option value="🧂">🧂 Salt / Spices</option>
                  <option value="🧼">🧼 Soap / Cleaning</option>
                  <option value="🍪">🍪 Biscuits / Snacks</option>
                  <option value="🥔">🥔 Potato / Veggies</option>
                  <option value="🍎">🍎 Apples / Fruits</option>
                  <option value="🥤">🥤 Soda / Cold Drink</option>
                  <option value="🍺">🍺 Beer</option>
                  <option value="🍷">🍷 Wine / Alcohol</option>
                  <option value="🥃">🥃 Whiskey / Liquor</option>
                  <option value="🚬">🚬 Cigarettes / Tobacco</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground stroke-1 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {products.length === 0 
                    ? "No items registered in the directory." 
                    : "No items match your search or filter."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filteredProducts.map((product) => {
                  const isEditing = editingId === product._id;
                  
                  return (
                    <div 
                      key={product._id} 
                      className={`relative flex flex-col justify-between rounded-lg border p-4 transition-all ${
                        isEditing 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-background hover:shadow-sm'
                      }`}
                    >
                      {isEditing ? (
                        /* Edit mode layout */
                        <div className="space-y-3 text-left">
                          <h3 className="text-sm font-semibold text-primary">Edit product details</h3>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-1 flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase">Icon</label>
                              <input 
                                type="text" 
                                value={editIcon} 
                                onChange={(e) => setEditIcon(e.target.value)} 
                                maxLength="4"
                                className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </div>

                            <div className="col-span-2 flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase">Product Name</label>
                              <input 
                                type="text" 
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value)} 
                                className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Rate (₹)</label>
                            <input 
                              type="number" 
                              value={editRate} 
                              onChange={(e) => setEditRate(e.target.value)} 
                              step="any"
                              className="rounded border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                              required
                            />
                          </div>

                          <div className="flex justify-end space-x-2 pt-2">
                            <button 
                              onClick={() => handleUpdate(product._id)}
                              className="inline-flex items-center rounded bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary/95"
                            >
                              <Save className="mr-1 h-3.5 w-3.5" />
                              Save
                            </button>
                            <button 
                              onClick={handleCancelEdit}
                              className="inline-flex items-center rounded border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted"
                            >
                              <X className="mr-1 h-3.5 w-3.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display mode layout */
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">
                              {product.icon || '📦'}
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-secondary text-sm">{product.name}</h3>
                              <p className="text-primary font-semibold text-xs mt-0.5">
                                ₹{(product.rate || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex space-x-1">
                            <button 
                              onClick={() => handleStartEdit(product)}
                              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
                              title="Edit product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(product._id, product.name)}
                              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
