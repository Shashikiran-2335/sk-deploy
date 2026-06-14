import React, { useState, useEffect, useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config";
import { Coins, CheckCircle, Users, TrendingUp } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Month names constant
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Helper to parse date strings in a timezone-independent manner
const parseDateString = (dateStr) => {
  if (!dateStr) return { day: "", month: "", year: "" };
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return { 
        day: parts[2].padStart(2, '0'), 
        month: parts[1].padStart(2, '0'), 
        year: parts[0] 
      };
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      return { 
        day: parts[0].padStart(2, '0'), 
        month: parts[1].padStart(2, '0'), 
        year: parts[2] 
      };
    }
  }
  // Fallback to JS Date parsing
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear());
    return { day, month, year };
  }
  return { day: "", month: "", year: "" };
};

// Utility to generate time ranges in local timezone
const generateTimeRange = (type) => {
  const labels = [];
  const endDate = new Date();
  const current = new Date();

  if (type === "day") {
    current.setDate(endDate.getDate() - 6);
    while (current <= endDate) {
      const day = String(current.getDate()).padStart(2, '0');
      const monthName = MONTHS_SHORT[current.getMonth()];
      labels.push(`${day} ${monthName}`); // e.g. "08 Jun"
      current.setDate(current.getDate() + 1);
    }
  } else if (type === "week") {
    current.setDate(endDate.getDate() - 7 * 3);
    while (current <= endDate) {
      const weekStart = new Date(current);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const day = String(weekStart.getDate()).padStart(2, '0');
      const monthName = MONTHS_SHORT[weekStart.getMonth()];
      labels.push(`${day} ${monthName}`); // e.g. "08 Jun"
      current.setDate(current.getDate() + 7);
    }
  } else if (type === "month") {
    current.setMonth(endDate.getMonth() - 5);
    while (current <= endDate) {
      const monthName = MONTHS_SHORT[current.getMonth()];
      labels.push(`${monthName} ${current.getFullYear()}`); // e.g. "Jun 2026"
      current.setMonth(current.getMonth() + 1);
    }
  } else if (type === "year") {
    current.setFullYear(endDate.getFullYear() - 4);
    while (current <= endDate) {
      labels.push(`${current.getFullYear()}`);
      current.setFullYear(current.getFullYear() + 1);
    }
  }

  return labels;
};

// Group data by status and fill in 0s for missing intervals
const groupByStatus = (data, type) => {
  const groupedPending = {};
  const groupedSettled = {};

  data.forEach((entry) => {
    const { day, month, year } = parseDateString(entry.date);
    if (!day || !month || !year) return;

    let key = "";

    if (type === "day") {
      key = `${day} ${MONTHS_SHORT[parseInt(month, 10) - 1]}`;
    } else if (type === "week") {
      const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      const weekStart = new Date(dateObj);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const wDay = String(weekStart.getDate()).padStart(2, '0');
      const wMonthName = MONTHS_SHORT[weekStart.getMonth()];
      key = `${wDay} ${wMonthName}`;
    } else if (type === "month") {
      key = `${MONTHS_SHORT[parseInt(month, 10) - 1]} ${year}`;
    } else if (type === "year") {
      key = `${year}`;
    }

    const isPaid = entry.status === 'paid';
    if (isPaid) {
      if (!groupedSettled[key]) groupedSettled[key] = [];
      groupedSettled[key].push(entry);
    } else {
      if (!groupedPending[key]) groupedPending[key] = [];
      groupedPending[key].push(entry);
    }
  });

  const labels = generateTimeRange(type);
  
  const pendingValues = labels.map((label) => {
    const group = groupedPending[label] || [];
    return group.reduce((sum, entry) => sum + (parseFloat(entry.totalCost) || 0), 0);
  });

  const settledValues = labels.map((label) => {
    const group = groupedSettled[label] || [];
    return group.reduce((sum, entry) => sum + (parseFloat(entry.totalCost) || 0), 0);
  });

  return { labels, pendingValues, settledValues };
};

const Dashboard = () => {
  const [borrowData, setBorrowData] = useState([]);
  const [dateFilter, setDateFilter] = useState("day");
  const [xAxisType, setXAxisType] = useState("day");
  const [loading, setLoading] = useState(true);

  const [barChart, setBarChart] = useState(null);
  const [lineChart, setLineChart] = useState(null);

  const [barDataState, setBarDataState] = useState({ labels: [], datasets: [] });
  const [lineDataState, setLineDataState] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_BASE_URL);
        setBorrowData(response.data || []);
      } catch (err) {
        console.error("Failed to fetch borrow data", err);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute live summary stats
  const stats = useMemo(() => {
    const unpaidLogs = borrowData.filter(log => log.status !== 'paid');
    const paidLogs = borrowData.filter(log => log.status === 'paid');

    const totalOutstanding = unpaidLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    const totalSettled = paidLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    const activeBorrowers = new Set(unpaidLogs.map(log => log.customerName)).size;

    const totalCredit = totalOutstanding + totalSettled;
    const recoveryRate = totalCredit > 0 ? (totalSettled / totalCredit) * 100 : 0;

    return {
      totalOutstanding,
      totalSettled,
      activeBorrowers,
      recoveryRate
    };
  }, [borrowData]);

  const barGrouped = useMemo(() => groupByStatus(borrowData, dateFilter), [borrowData, dateFilter]);
  const lineGrouped = useMemo(() => groupByStatus(borrowData, xAxisType), [borrowData, xAxisType]);

  useEffect(() => {
    if (!barChart) return;

    const ctx = barChart.ctx;
    
    const pendingGrad = ctx.createLinearGradient(0, 0, 0, 300);
    pendingGrad.addColorStop(0, "rgba(244, 63, 94, 0.85)"); // Rose/Coral
    pendingGrad.addColorStop(1, "rgba(244, 63, 94, 0.08)");
    
    const settledGrad = ctx.createLinearGradient(0, 0, 0, 300);
    settledGrad.addColorStop(0, "rgba(16, 185, 129, 0.85)"); // Emerald
    settledGrad.addColorStop(1, "rgba(16, 185, 129, 0.08)");

    setBarDataState({
      labels: barGrouped.labels,
      datasets: [
        {
          label: "Pending (Outstanding)",
          data: barGrouped.pendingValues,
          backgroundColor: pendingGrad,
          borderColor: "rgba(244, 63, 94, 0.8)",
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: "Settled (Paid)",
          data: barGrouped.settledValues,
          backgroundColor: settledGrad,
          borderColor: "rgba(16, 185, 129, 0.8)",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    });
  }, [barChart, barGrouped, loading]);

  useEffect(() => {
    if (!lineChart) return;

    const ctx = lineChart.ctx;
    
    const pendingAreaGrad = ctx.createLinearGradient(0, 0, 0, 300);
    pendingAreaGrad.addColorStop(0, "rgba(244, 63, 94, 0.22)");
    pendingAreaGrad.addColorStop(1, "rgba(244, 63, 94, 0.00)");
    
    const settledAreaGrad = ctx.createLinearGradient(0, 0, 0, 300);
    settledAreaGrad.addColorStop(0, "rgba(16, 185, 129, 0.22)");
    settledAreaGrad.addColorStop(1, "rgba(16, 185, 129, 0.00)");

    setLineDataState({
      labels: lineGrouped.labels,
      datasets: [
        {
          label: "Outstanding Trend",
          data: lineGrouped.pendingValues,
          fill: true,
          borderColor: "rgba(244, 63, 94, 1)",
          backgroundColor: pendingAreaGrad,
          tension: 0.4,
          pointBackgroundColor: "rgba(244, 63, 94, 1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
        {
          label: "Recovery Trend",
          data: lineGrouped.settledValues,
          fill: true,
          borderColor: "rgba(16, 185, 129, 1)",
          backgroundColor: settledAreaGrad,
          tension: 0.4,
          pointBackgroundColor: "rgba(16, 185, 129, 1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
      ],
    });
  }, [lineChart, lineGrouped, loading]);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 10,
      }
    },
    plugins: {
      legend: { 
        position: "top",
        labels: {
          font: { family: 'Outfit', size: 12, weight: '600' },
          color: "rgba(71, 85, 105, 0.9)",
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      },
      tooltip: { 
        mode: "index", 
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: { family: 'Outfit', size: 13, weight: '700' },
        bodyFont: { family: 'Outfit', size: 12 },
        padding: 12,
        cornerRadius: 8,
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1
      },
    },
    scales: {
      x: {
        grid: { display: false },
        title: { display: false },
        ticks: {
          padding: 8,
          autoSkip: true,
          maxTicksLimit: 10,
          color: "rgba(71, 85, 105, 0.7)",
          font: { family: 'Outfit', size: 11, weight: '500' }
        },
      },
      y: {
        grid: {
          color: "rgba(15, 23, 42, 0.05)",
          drawTicks: false
        },
        border: { 
          dash: [5, 5],
          display: false
        },
        beginAtZero: true,
        title: { 
          display: true, 
          text: "Amount (₹)",
          color: "rgba(71, 85, 105, 0.8)",
          font: { family: 'Outfit', size: 12, weight: '600' }
        },
        ticks: {
          padding: 8,
          color: "rgba(71, 85, 105, 0.7)",
          font: { family: 'Outfit', size: 11, weight: '500' }
        }
      },
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {/* Header */}
      <header className="mb-10 text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-secondary sm:text-4xl">
          Analytics Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track store borrowings, recovered credit, and merchant key metrics.
        </p>
      </header>

      {/* Stats Summary Panel */}
      <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Outstanding Credit */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <Coins className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outstanding Credit</h3>
            <p className="mt-1 text-2xl font-bold text-secondary">
              {loading ? '...' : `₹${stats.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            </p>
            <span className="text-[10px] font-medium text-muted-foreground">Pending collection</span>
          </div>
        </div>

        {/* Total Recovery */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Recovery</h3>
            <p className="mt-1 text-2xl font-bold text-secondary">
              {loading ? '...' : `₹${stats.totalSettled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            </p>
            <span className="text-[10px] font-medium text-muted-foreground">Settled accounts</span>
          </div>
        </div>

        {/* Active Borrowers */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Borrowers</h3>
            <p className="mt-1 text-2xl font-bold text-secondary">
              {loading ? '...' : stats.activeBorrowers}
            </p>
            <span className="text-[10px] font-medium text-muted-foreground">Pending accounts count</span>
          </div>
        </div>

        {/* Recovery Rate */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recovery Rate</h3>
            <p className="mt-1 text-2xl font-bold text-secondary">
              {loading ? '...' : `${stats.recoveryRate.toFixed(1)}%`}
            </p>
            <span className="text-[10px] font-medium text-muted-foreground">Collection efficiency ratio</span>
          </div>
        </div>
      </section>

      {/* Charts Layout Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Bar Chart Section */}
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-sm flex flex-col hover:border-primary/20 hover:shadow-md transition-all duration-300">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-lg font-bold text-secondary tracking-tight">Borrow Trends</h2>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <label className="font-semibold text-muted-foreground">Interval:</label>
              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none hover:bg-muted cursor-pointer transition-colors"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
          <div className="h-64 sm:h-80 w-full relative flex items-center justify-center">
            {(loading || barDataState.datasets.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10 rounded-xl">
                <div className="text-muted-foreground text-sm font-medium animate-pulse">Loading analytics...</div>
              </div>
            )}
            <Bar
              ref={setBarChart}
              data={barDataState}
              options={commonOptions}
            />
          </div>
        </div>

        {/* Line Chart Section */}
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-6 shadow-sm flex flex-col hover:border-primary/20 hover:shadow-md transition-all duration-300">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-bold text-secondary tracking-tight">Account Trajectory</h2>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <label className="font-semibold text-muted-foreground">Interval:</label>
              <select 
                value={xAxisType} 
                onChange={(e) => setXAxisType(e.target.value)}
                className="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none hover:bg-muted cursor-pointer transition-colors"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
          <div className="h-64 sm:h-80 w-full relative flex items-center justify-center">
            {(loading || lineDataState.datasets.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10 rounded-xl">
                <div className="text-muted-foreground text-sm font-medium animate-pulse">Loading trajectory...</div>
              </div>
            )}
            <Line
              ref={setLineChart}
              data={lineDataState}
              options={commonOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
