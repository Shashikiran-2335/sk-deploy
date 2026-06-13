import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Coins, Users, PlusCircle, ClipboardList, BarChart3, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCredit: 0, activeBorrowers: 0, loading: true });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(API_BASE_URL);
        const logs = response.data || [];
        
        // Filter outstanding borrows (excluding marked as paid)
        const unpaidLogs = logs.filter(log => log.status !== 'paid');
        const total = unpaidLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
        const uniqueCustomers = new Set(unpaidLogs.map(log => log.customerName));
        
        setStats({
          totalCredit: total,
          activeBorrowers: uniqueCustomers.size,
          loading: false
        });
      } catch (err) {
        console.error("Failed to fetch stats for homepage:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <header className="mb-12 text-center">
        <h1 className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Kirana Borrow Manager
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Simplify credit tracking and streamline collections for your shop.
        </p>
      </header>

      {/* Quick Stats Panel */}
      <section className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-center space-x-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Outstanding</h3>
            <p className="mt-1 text-3xl font-bold text-secondary">
              {stats.loading ? (
                <span className="inline-block h-8 w-24 animate-pulse rounded bg-muted"></span>
              ) : (
                `₹${stats.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Borrowers</h3>
            <p className="mt-1 text-3xl font-bold text-secondary">
              {stats.loading ? (
                <span className="inline-block h-8 w-12 animate-pulse rounded bg-muted"></span>
              ) : (
                stats.activeBorrowers
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Main Navigation Actions */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div 
          onClick={() => navigate('/borrow')}
          className="group cursor-pointer rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <PlusCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-secondary group-hover:text-primary transition-colors">Add Borrow Log</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Record a customer's new grocery credit purchases.
          </p>
          <div className="mt-4 flex items-center text-sm font-semibold text-primary">
            <span>Get Started</span>
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/log')}
          className="group cursor-pointer rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-secondary group-hover:text-indigo-600 transition-colors">Borrow Logs</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            View payments, search ledgers, and mark debts as paid.
          </p>
          <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            <span>View List</span>
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/dashboard')}
          className="group cursor-pointer rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-secondary group-hover:text-emerald-600 transition-colors">Analytics</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Visualize outstanding debts and collection trends.
          </p>
          <div className="mt-4 flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Open Charts</span>
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
