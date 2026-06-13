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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Utility to generate time ranges
const generateTimeRange = (type) => {
  const labels = [];
  const endDate = new Date();
  const current = new Date();

  if (type === "day") {
    current.setDate(endDate.getDate() - 6);
    while (current <= endDate) {
      labels.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
  } else if (type === "week") {
    current.setDate(endDate.getDate() - 7 * 3);
    while (current <= endDate) {
      const weekStart = new Date(current);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      labels.push(`Week of ${weekStart.toISOString().split("T")[0]}`);
      current.setDate(current.getDate() + 7);
    }
  } else if (type === "month") {
    current.setMonth(endDate.getMonth() - 5);
    while (current <= endDate) {
      labels.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`);
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
    const date = new Date(entry.date);
    let key = "";

    if (type === "day") {
      key = date.toISOString().split("T")[0];
    } else if (type === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      key = `Week of ${weekStart.toISOString().split("T")[0]}`;
    } else if (type === "month") {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    } else if (type === "year") {
      key = `${date.getFullYear()}`;
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

  const barChartData = useMemo(
    () => ({
      labels: barGrouped.labels,
      datasets: [
        {
          label: `Pending (Outstanding)`,
          data: barGrouped.pendingValues,
          backgroundColor: "#ef4444",
          borderRadius: 6,
        },
        {
          label: `Settled (Paid)`,
          data: barGrouped.settledValues,
          backgroundColor: "#10b981",
          borderRadius: 6,
        },
      ],
    }),
    [barGrouped]
  );

  const lineChartData = useMemo(
    () => ({
      labels: lineGrouped.labels,
      datasets: [
        {
          label: "Outstanding Trend",
          data: lineGrouped.pendingValues,
          fill: false,
          borderColor: "#ef4444",
          backgroundColor: "#ef4444",
          tension: 0.3,
          pointRadius: 4,
        },
        {
          label: "Recovery Trend",
          data: lineGrouped.settledValues,
          fill: false,
          borderColor: "#10b981",
          backgroundColor: "#10b981",
          tension: 0.3,
          pointRadius: 4,
        },
      ],
    }),
    [lineGrouped]
  );

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top",
        labels: {
          font: { family: 'Outfit', size: 12, weight: '500' },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: { 
        mode: "index", 
        intersect: false,
        titleFont: { family: 'Outfit', size: 13, weight: '700' },
        bodyFont: { family: 'Outfit', size: 12 },
        padding: 12,
        cornerRadius: 8
      },
    },
    scales: {
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: "Timeline",
          font: { family: 'Outfit', size: 13, weight: '600' }
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 12,
          font: { family: 'Outfit', size: 11 }
        },
      },
      y: {
        border: { dash: [4, 4] },
        beginAtZero: true,
        title: { 
          display: true, 
          text: "Amount (₹)",
          font: { family: 'Outfit', size: 13, weight: '600' }
        },
        ticks: {
          font: { family: 'Outfit', size: 11 }
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
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md flex items-center space-x-4">
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
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md flex items-center space-x-4">
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
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md flex items-center space-x-4">
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
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md flex items-center space-x-4">
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
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-secondary">Borrow Trends</h2>
            <div className="flex items-center space-x-2 text-xs">
              <label className="font-semibold text-muted-foreground">Period:</label>
              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
          <div className="h-80 w-full">
            <Bar
              data={barChartData}
              options={commonOptions}
            />
          </div>
        </div>

        {/* Line Chart Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-secondary">Account Trajectory</h2>
            <div className="flex items-center space-x-2 text-xs">
              <label className="font-semibold text-muted-foreground">Period:</label>
              <select 
                value={xAxisType} 
                onChange={(e) => setXAxisType(e.target.value)}
                className="rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
          <div className="h-80 w-full">
            <Line
              data={lineChartData}
              options={{
                ...commonOptions,
                scales: {
                  ...commonOptions.scales,
                  x: {
                    ...commonOptions.scales.x,
                    title: { 
                      display: true, 
                      text: xAxisType.toUpperCase(),
                      font: { family: 'Outfit', size: 13, weight: '600' }
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
