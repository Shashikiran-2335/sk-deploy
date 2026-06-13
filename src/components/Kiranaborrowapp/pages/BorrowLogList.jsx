import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';
import { 
  Users, 
  FileText, 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Trash2, 
  Check, 
  Undo,
  Calendar,
  ChevronLeft
} from 'lucide-react';

const BorrowLogList = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, paid, unpaid
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // View states: 'ledger' (grouped by customer) or 'transactions' (individual entries)
  const [viewMode, setViewMode] = useState("ledger");

  // Table state
  const [expandedRows, setExpandedRows] = useState({}); // mapping logId/customerName -> boolean
  const [sortField, setSortField] = useState("totalCost"); // default sorting
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setLogs(response.data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
      toast.error("Failed to fetch borrow logs.");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
      await axios.patch(`${API_BASE_URL}/${id}/status`, { status: nextStatus });
      toast.success(`Marked borrow log as ${nextStatus.toUpperCase()}`);
      
      // Update local state
      setLogs(logs.map(log => log._id === id ? { ...log, status: nextStatus } : log));
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update payment status.");
    }
  };

  const handleSettleAll = async (customerLogs) => {
    const unpaidLogs = customerLogs.filter(l => l.status !== 'paid');
    if (unpaidLogs.length === 0) {
      toast.info("No pending borrows to settle.");
      return;
    }
    
    const confirmSettle = window.confirm(`Are you sure you want to mark all ${unpaidLogs.length} pending borrows for this customer as paid?`);
    if (!confirmSettle) return;

    try {
      toast.info("Settling accounts...");
      // Execute patch calls in parallel
      await Promise.all(unpaidLogs.map(l => 
        axios.patch(`${API_BASE_URL}/${l._id}/status`, { status: 'paid' })
      ));
      toast.success("All pending accounts settled successfully!");
      
      // Update local state
      const settledIds = new Set(unpaidLogs.map(l => l._id));
      setLogs(logs.map(log => settledIds.has(log._id) ? { ...log, status: 'paid' } : log));
    } catch (err) {
      console.error("Error settling all:", err);
      toast.error("Failed to settle all accounts.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to PERMANENTLY delete this log? This action cannot be undone.");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      toast.success("Borrow log deleted permanently.");
      setLogs(logs.filter(log => log._id !== id));
    } catch (err) {
      console.error("Error deleting log:", err);
      toast.error("Failed to delete log entry.");
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Date range filter helper
  const isWithinDateRange = useCallback((dateStr) => {
    if (!dateStr) return true;
    const date = new Date(dateStr);
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;

    if (from) {
      from.setHours(0, 0, 0, 0);
      if (date < from) return false;
    }
    if (to) {
      to.setHours(23, 59, 59, 999);
      if (date > to) return false;
    }
    return true;
  }, [startDate, endDate]);

  // --- VIEW 1: Group logs by customerName (Ledger view) ---
  const groupedLedgers = useMemo(() => {
    const groups = {};
    logs.forEach(log => {
      const name = log.customerName || "Unknown";
      if (!groups[name]) {
        groups[name] = {
          customerName: name,
          logs: [],
          totalOutstanding: 0,
          totalSettled: 0,
          lastActivityDate: log.date
        };
      }
      
      groups[name].logs.push(log);
      const cost = parseFloat(log.totalCost) || 0;
      
      if (log.status === 'paid') {
        groups[name].totalSettled += cost;
      } else {
        groups[name].totalOutstanding += cost;
      }
      
      // Update last active date if newer
      if (new Date(log.date) > new Date(groups[name].lastActivityDate)) {
        groups[name].lastActivityDate = log.date;
      }
    });

    // Sort logs inside each ledger chronologically (descending)
    Object.values(groups).forEach(g => {
      g.logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    return Object.values(groups);
  }, [logs]);

  // Filter Grouped Ledgers
  const filteredLedgers = useMemo(() => {
    return groupedLedgers.filter(ledger => {
      const matchesSearch = ledger.customerName.toLowerCase().includes(search.toLowerCase()) || 
        ledger.logs.some(log => log.items && log.items.some(item => item.itemName.toLowerCase().includes(search.toLowerCase())));
      
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "paid" && ledger.totalOutstanding === 0 && ledger.totalSettled > 0) ||
        (statusFilter === "unpaid" && ledger.totalOutstanding > 0);

      // Check if any sub-log falls within selected date range
      const hasDateInRange = ledger.logs.some(log => isWithinDateRange(log.date));

      return matchesSearch && matchesStatus && hasDateInRange;
    });
  }, [groupedLedgers, search, statusFilter, isWithinDateRange]);

  // Sort Grouped Ledgers
  const sortedLedgers = useMemo(() => {
    return [...filteredLedgers].sort((a, b) => {
      let aVal, bVal;
      
      if (sortField === "customerName") {
        aVal = a.customerName.toLowerCase();
        bVal = b.customerName.toLowerCase();
      } else if (sortField === "date") {
        aVal = new Date(a.lastActivityDate).getTime();
        bVal = new Date(b.lastActivityDate).getTime();
      } else {
        // Default sort by outstanding balance in ledger mode
        aVal = a.totalOutstanding;
        bVal = b.totalOutstanding;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredLedgers, sortField, sortOrder]);

  // --- VIEW 2: Raw logs list (Transactions view) ---
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.customerName.toLowerCase().includes(search.toLowerCase()) || 
        (log.items && log.items.some(item => item.itemName.toLowerCase().includes(search.toLowerCase())));
        
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "paid" && log.status === "paid") ||
        (statusFilter === "unpaid" && log.status !== "paid");

      const matchesDate = isWithinDateRange(log.date);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [logs, search, statusFilter, isWithinDateRange]);

  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "date") {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      } else if (sortField === "customerName") {
        aVal = a.customerName.toLowerCase();
        bVal = b.customerName.toLowerCase();
      } else if (sortField === "totalCost") {
        aVal = parseFloat(a.totalCost) || 0;
        bVal = parseFloat(b.totalCost) || 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredLogs, sortField, sortOrder]);

  // --- DYNAMIC LIST SWITCHER ---
  const activeList = viewMode === "ledger" ? sortedLedgers : sortedLogs;
  const totalEntries = activeList.length;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = activeList.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (activeList.length === 0) {
      toast.warning("No data to export!");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (viewMode === "ledger") {
      csvContent += "Customer Name,Outstanding Balance,Total Settled,Last Active Date\n";
      activeList.forEach(ledger => {
        const cleanName = ledger.customerName.replace(/,/g, " ");
        csvContent += `"${cleanName}",${ledger.totalOutstanding},${ledger.totalSettled},"${ledger.lastActivityDate}"\n`;
      });
    } else {
      csvContent += "Customer Name,Date,Total Cost,Status,Items\n";
      activeList.forEach(log => {
        const itemsString = log.items.map(i => `${i.itemName} (Qty: ${i.quantity} @ ₹${i.rate})`).join(" | ");
        const statusText = log.status === 'paid' ? 'Paid' : 'Unpaid';
        const cleanCustomer = log.customerName.replace(/,/g, " ");
        csvContent += `"${cleanCustomer}","${log.date}",${log.totalCost},"${statusText}","${itemsString.replace(/"/g, '""')}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kirana_${viewMode}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <header className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center text-left">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-secondary sm:text-4xl">
            Borrow Ledgers
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track customer credit accounts, view ledgers, and manage repayments.
          </p>
        </div>
        <div>
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* View Mode Toggle (Tabs-like switcher) */}
      <div className="mb-8 flex rounded-full bg-muted p-1 w-fit border border-border">
        <button 
          onClick={() => { setViewMode('ledger'); setCurrentPage(1); setSortField('totalCost'); setSortOrder('desc'); }}
          className={`flex items-center space-x-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            viewMode === 'ledger' 
              ? 'bg-card text-primary shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Consolidated Ledgers</span>
        </button>
        <button 
          onClick={() => { setViewMode('transactions'); setCurrentPage(1); setSortField('date'); setSortOrder('desc'); }}
          className={`flex items-center space-x-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            viewMode === 'transactions' 
              ? 'bg-card text-primary shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Individual Entries</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 text-left">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
            <Search className="mr-1 h-3 w-3" /> Search Directory
          </label>
          <input
            type="text"
            placeholder="Search by customer name or product..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credit Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Accounts</option>
            <option value="unpaid">Outstanding (Unpaid)</option>
            <option value="paid">Settled (Paid)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </section>

      {/* Table responsive container */}
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            {viewMode === "ledger" ? (
              <tr className="border-b border-border bg-muted/40">
                <th className="w-10 px-4 py-3.5"></th>
                <th 
                  onClick={() => handleSort("customerName")} 
                  className="cursor-pointer px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-colors select-none"
                >
                  <span className="flex items-center">Customer Name <ArrowUpDown className="ml-1 h-3 w-3" /></span>
                </th>
                <th 
                  onClick={() => handleSort("date")} 
                  className="cursor-pointer px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-colors select-none"
                >
                  <span className="flex items-center">Last Active <ArrowUpDown className="ml-1 h-3 w-3" /></span>
                </th>
                <th 
                  onClick={() => handleSort("totalCost")} 
                  className="cursor-pointer px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-colors select-none"
                >
                  <span className="flex items-center">Outstanding Debt <ArrowUpDown className="ml-1 h-3 w-3" /></span>
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary select-none">
                  Total Recovered
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary select-none">
                  Status
                </th>
                <th className="w-36 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary select-none">
                  Actions
                </th>
              </tr>
            ) : (
              <tr className="border-b border-border bg-muted/40">
                <th className="w-10 px-4 py-3.5"></th>
                <th 
                  onClick={() => handleSort("customerName")} 
                  className="cursor-pointer px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-colors select-none"
                >
                  <span className="flex items-center">Customer Name <ArrowUpDown className="ml-1 h-3 w-3" /></span>
                </th>
                <th 
                  onClick={() => handleSort("date")} 
                  className="cursor-pointer px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-colors select-none"
                >
                  <span className="flex items-center">Date <ArrowUpDown className="ml-1 h-3 w-3" /></span>
                </th>
                <th 
                  onClick={() => handleSort("totalCost")} 
                  className="cursor-pointer px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-colors select-none"
                >
                  <span className="flex items-center">Total Cost <ArrowUpDown className="ml-1 h-3 w-3" /></span>
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary select-none">
                  Status
                </th>
                <th className="w-36 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-secondary select-none">
                  Actions
                </th>
              </tr>
            )}
          </thead>
          
          <tbody className="divide-y divide-border">
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={viewMode === 'ledger' ? 7 : 6} className="py-12 text-center text-sm text-muted-foreground">
                  No credit profiles found.
                </td>
              </tr>
            ) : (
              currentRows.map((row) => {
                if (viewMode === "ledger") {
                  const isExpanded = expandedRows[row.customerName];
                  const hasDebt = row.totalOutstanding > 0;
                  
                  return (
                    <React.Fragment key={row.customerName}>
                      <tr className={`transition-colors hover:bg-muted/30 ${!hasDebt ? 'opacity-70 bg-emerald-50/20' : ''}`}>
                        <td className="px-4 py-4 text-center">
                          <button 
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-secondary" 
                            onClick={() => toggleRow(row.customerName)}
                            title="Toggle account history"
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-4 font-bold text-secondary">{row.customerName}</td>
                        <td className="px-4 py-4 text-muted-foreground">{row.lastActivityDate}</td>
                        <td className={`px-4 py-4 font-bold ${hasDebt ? 'text-red-600' : 'text-muted-foreground line-through'}`}>
                          ₹{row.totalOutstanding.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 font-bold text-emerald-600">₹{row.totalSettled.toFixed(2)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                            !hasDebt 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {!hasDebt ? 'Settled' : 'Outstanding'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            className="inline-flex items-center space-x-1 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                            onClick={() => handleSettleAll(row.logs)}
                            disabled={!hasDebt}
                            title="Clear all outstanding balances"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Clear All</span>
                          </button>
                        </td>
                      </tr>

                      {/* Customer Detailed Statement Dropdown */}
                      {isExpanded && (
                        <tr>
                          <td></td>
                          <td colSpan="6" className="bg-muted/10 px-6 py-4">
                            <div className="rounded-lg border border-border bg-card p-5 shadow-sm text-left">
                              <div className="mb-4 flex flex-col justify-between border-b border-border pb-3 sm:flex-row sm:items-center">
                                <h4 className="font-bold text-secondary text-base">Account Statement — {row.customerName}</h4>
                                <span className="text-xs font-medium text-muted-foreground mt-1 sm:mt-0">
                                  Total Transactions: {row.logs.length} ({row.logs.filter(l=>l.status!=='paid').length} pending)
                                </span>
                              </div>
                              
                              <div className="space-y-4">
                                {row.logs.map((log) => {
                                  const logPaid = log.status === 'paid';
                                  return (
                                    <div 
                                      key={log._id}
                                      className={`relative rounded-md border p-4 transition-all ${
                                        logPaid 
                                          ? 'border-l-4 border-l-emerald-600 border-border bg-emerald-50/10' 
                                          : 'border-l-4 border-l-red-600 border-border bg-red-50/10'
                                      }`}
                                    >
                                      <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center space-x-3 text-sm font-semibold text-secondary">
                                          <Calendar className="h-4 w-4 text-muted-foreground" />
                                          <span>{log.date}{log.time ? ` @ ${log.time}` : ''}</span>
                                        </div>
                                        <div>
                                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                            logPaid 
                                              ? 'bg-emerald-100 text-emerald-800' 
                                              : 'bg-red-100 text-red-800'
                                          }`}>
                                            {logPaid ? 'Settled' : 'Pending'}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <table className="w-full text-left text-xs mb-3">
                                        <thead>
                                          <tr className="border-b border-border bg-muted/40">
                                            <th className="px-3 py-1.5 font-bold text-muted-foreground uppercase">Grocery Item</th>
                                            <th className="px-3 py-1.5 font-bold text-muted-foreground uppercase">Quantity</th>
                                            <th className="px-3 py-1.5 font-bold text-muted-foreground uppercase">Unit Rate</th>
                                            <th className="px-3 py-1.5 font-bold text-muted-foreground uppercase text-right">Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {log.items.map((item, idx) => (
                                            <tr key={idx} className="border-b border-border">
                                              <td className="px-3 py-1.5 text-secondary">{item.itemName}</td>
                                              <td className="px-3 py-1.5 text-muted-foreground">{item.quantity}</td>
                                              <td className="px-3 py-1.5 text-muted-foreground">₹{(item.rate || 0).toFixed(2)}</td>
                                              <td className="px-3 py-1.5 font-semibold text-secondary text-right">
                                                ₹{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                                              </td>
                                            </tr>
                                          ))}
                                          <tr className="bg-muted/10 font-bold">
                                            <td colSpan="3" className="px-3 py-2 text-muted-foreground uppercase">Total For Purchase</td>
                                            <td className="px-3 py-2 text-primary text-right text-sm">
                                              ₹{(log.totalCost || 0).toFixed(2)}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>

                                      <div className="flex items-center justify-between border-t border-dashed border-border pt-3 flex-wrap gap-2">
                                        <div>
                                          {log.pickedUpBy && (
                                            <span className="inline-flex items-center space-x-1 rounded border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                                              <span>👤 Picked up by:</span> 
                                              <strong className="text-secondary">{log.pickedUpBy}</strong>
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <button
                                            className={`inline-flex items-center space-x-1 rounded px-2.5 py-1 text-xs font-semibold border ${
                                              logPaid 
                                                ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' 
                                                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                            }`}
                                            onClick={() => handleToggleStatus(log._id, log.status)}
                                            title={logPaid ? "Revert payment" : "Clear this log"}
                                          >
                                            {logPaid ? <Undo className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                                            <span>{logPaid ? 'Unpay' : 'Mark Paid'}</span>
                                          </button>
                                          <button
                                            className="inline-flex items-center space-x-1 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                                            onClick={() => handleDelete(log._id)}
                                            title="Delete transaction record"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span>Remove</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                } 
                
                // --- RAW TRANSACTIONS MODE ---
                const isExpanded = expandedRows[row._id];
                const isPaid = row.status === 'paid';
                
                return (
                  <React.Fragment key={row._id}>
                    <tr className={`transition-colors hover:bg-muted/30 ${isPaid ? 'opacity-70 bg-emerald-50/20' : ''}`}>
                      <td className="px-4 py-4 text-center">
                        <button 
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-secondary" 
                          onClick={() => toggleRow(row._id)}
                          title="Toggle item details"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-4 font-bold text-secondary">{row.customerName}</td>
                      <td className="px-4 py-4 text-muted-foreground">{row.date}{row.time ? ` @ ${row.time}` : ''}</td>
                      <td className="px-4 py-4 font-bold text-secondary">₹{(row.totalCost || 0).toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          isPaid 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isPaid ? 'Settled' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className={`inline-flex items-center space-x-1 rounded px-2.5 py-1.5 text-xs font-semibold border ${
                              isPaid 
                                ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' 
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            onClick={() => handleToggleStatus(row._id, row.status)}
                            title={isPaid ? "Mark as unpaid" : "Mark as paid"}
                          >
                            {isPaid ? <Undo className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                            <span>{isPaid ? 'Unpay' : 'Pay'}</span>
                          </button>
                          <button
                            className="inline-flex items-center rounded border border-border p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => handleDelete(row._id)}
                            title="Delete entry permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Individual Items Expanded Sub-table */}
                    {isExpanded && (
                      <tr>
                        <td></td>
                        <td colSpan="5" className="bg-muted/10 px-6 py-4">
                          <div className="rounded-lg border border-border bg-card p-5 shadow-sm text-left">
                            <div className="mb-3 flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
                              <h4 className="font-bold text-secondary text-base">Purchase breakdown</h4>
                              {row.pickedUpBy && (
                                <span className="inline-flex items-center space-x-1 rounded border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                                  <span>👤 Picked up by:</span> 
                                  <strong className="text-secondary">{row.pickedUpBy}</strong>
                                </span>
                              )}
                            </div>
                            
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-border bg-muted/40">
                                  <th className="px-3 py-2 font-bold text-muted-foreground uppercase">Item Description</th>
                                  <th className="px-3 py-2 font-bold text-muted-foreground uppercase">Quantity</th>
                                  <th className="px-3 py-2 font-bold text-muted-foreground uppercase">Rate</th>
                                  <th className="px-3 py-2 font-bold text-muted-foreground uppercase text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.items && row.items.map((item, idx) => (
                                  <tr key={idx} className="border-b border-border">
                                    <td className="px-3 py-2 text-secondary">{item.itemName}</td>
                                    <td className="px-3 py-2 text-muted-foreground">{item.quantity}</td>
                                    <td className="px-3 py-2 text-muted-foreground">₹{(item.rate || 0).toFixed(2)}</td>
                                    <td className="px-3 py-2 font-semibold text-secondary text-right">
                                      ₹{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination / Table Footer */}
      {totalEntries > 0 && (
        <footer className="mt-6 flex flex-col justify-between items-center gap-4 sm:flex-row text-sm text-muted-foreground text-left">
          <div>
            Showing <span className="font-semibold text-secondary">{indexOfFirstRow + 1}</span> to <span className="font-semibold text-secondary">{Math.min(indexOfLastRow, totalEntries)}</span> of <span className="font-semibold text-secondary">{totalEntries}</span> accounts
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background p-0 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="text-xs font-semibold text-secondary">
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background p-0 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div>
              <select 
                value={rowsPerPage} 
                onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                className="h-9 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default BorrowLogList;
