import React, { useState, useEffect, useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import axios from "axios";
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
import "./Dashboard.css";

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

const Dashboard = () => {
  const [borrowData, setBorrowData] = useState([]);
  const [dateFilter, setDateFilter] = useState("day");
  const [xAxisType, setXAxisType] = useState("day");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://sk-deploy-backend.onrender.com/borrow");
        setBorrowData(response.data);
      } catch (err) {
        console.error("Failed to fetch borrow data", err);
      }
    };

    fetchData();
  }, []);

  // Utility to generate full range of date labels based on type
  const generateTimeRange = (type) => {
    const labels = [];
    const endDate = new Date();
    const current = new Date();
  
    if (type === "day") {
      current.setDate(endDate.getDate() - 6); // Last 7 days (including today)
      while (current <= endDate) {
        labels.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    } else if (type === "week") {
      current.setDate(endDate.getDate() - 7 * 3); // Last 4 weeks
      while (current <= endDate) {
        const weekStart = new Date(current);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        labels.push(`Week of ${weekStart.toISOString().split("T")[0]}`);
        current.setDate(current.getDate() + 7);
      }
    } else if (type === "month") {
      current.setMonth(endDate.getMonth() - 5); // Last 6 months
      while (current <= endDate) {
        labels.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`);
        current.setMonth(current.getMonth() + 1);
      }
    } else if (type === "year") {
      current.setFullYear(endDate.getFullYear() - 4); // Last 5 years
      while (current <= endDate) {
        labels.push(`${current.getFullYear()}`);
        current.setFullYear(current.getFullYear() + 1);
      }
    }
  
    return labels;
  };
  

  // Group data and fill in 0s for missing intervals
  const groupBy = (data, type) => {
    const grouped = {};
  
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
  
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(entry);
    });
  
    const labels = generateTimeRange(type);
    const values = labels.map((label) => {
      const group = grouped[label] || [];
      return group.reduce((sum, entry) => {
        const amount = parseFloat(entry.totalCost);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    });
  
    return { labels, values };
  };
  

  // Memoized grouped data
  const barGrouped = useMemo(() => groupBy(borrowData, dateFilter), [borrowData, dateFilter]);
  const lineGrouped = useMemo(() => groupBy(borrowData, xAxisType), [borrowData, xAxisType]);

  // ChartJS data
  const barChartData = useMemo(
    () => ({
      labels: barGrouped.labels,
      datasets: [
        {
          label: `Total Borrowed Amount by ${dateFilter}`,
          data: barGrouped.values,
          backgroundColor: "#3498db",
          borderRadius: 6,
        },
      ],
    }),
    [barGrouped, dateFilter]
  );

  const lineChartData = useMemo(
    () => ({
      labels: lineGrouped.labels,
      datasets: [
        {
          label: "Borrow Amount Progress",
          data: lineGrouped.values,
          fill: false,
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.3,
        },
      ],
    }),
    [lineGrouped]
  );

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
        },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Amount (₹)" },
      },
    },
  };

  return (
    <div className="dashboard-container">
      <h2>Borrow Dashboard</h2>

      {/* Bar Chart Filter */}
      <div className="filter-row">
        <label>Group By (Bar):</label>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      <Bar
        data={barChartData}
        options={{
          ...commonOptions,
          plugins: {
            ...commonOptions.plugins,
            title: {
              display: true,
              text: "Borrow Trends Over Time",
            },
          },
        }}
      />

      {/* Line Chart Filter */}
      <div className="filter-row mt-6">
        <label>X-Axis Group (Line):</label>
        <select value={xAxisType} onChange={(e) => setXAxisType(e.target.value)}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      <div className="chart-section">
        <Line
          data={lineChartData}
          options={{
            ...commonOptions,
            scales: {
              ...commonOptions.scales,
              x: {
                ...commonOptions.scales.x,
                title: { display: true, text: xAxisType.toUpperCase() },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
