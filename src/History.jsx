import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Download, FileText,
  Calendar, DollarSign, User, RefreshCw,
  ChevronUp, ChevronDown, X, Filter
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

function History({ session }) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('user_id', session.user.id)
        .order(sortField, { ascending: sortDir === 'asc' });

      const { data, error } = await query;
      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session.user.id, sortField, sortDir]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Client-side filtering & search
  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.customer_name?.toLowerCase().includes(q);

    const invDate = inv.created_at ? inv.created_at.slice(0, 10) : '';
    const matchFrom = !filterFrom || invDate >= filterFrom;
    const matchTo = !filterTo || invDate <= filterTo;
    const matchMin = !filterMinPrice || parseFloat(inv.price) >= parseFloat(filterMinPrice);
    const matchMax = !filterMaxPrice || parseFloat(inv.price) <= parseFloat(filterMaxPrice);

    return matchSearch && matchFrom && matchTo && matchMin && matchMax;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterFrom('');
    setFilterTo('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
  };

  const hasFilters = search || filterFrom || filterTo || filterMinPrice || filterMaxPrice;

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} />
      : <ChevronDown size={12} />;
  };

  return (
    <div className="app-container" style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div className="header">
        <h1>Invoice History</h1>
        <p className="subtitle">All invoices linked to your account</p>
        <span className="org-badge">Registration No. 1025-07-WKL</span>
        <button onClick={() => navigate('/app')} className="btn-logout" style={{ left: 0, right: 'auto' }}>
          <ArrowLeft className="icon" /> Back
        </button>
      </div>

      {/* Search + Filter Bar */}
      <div className="history-toolbar">
        <div className="search-wrapper">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by invoice no. or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn-filter ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter size={15} /> Filters {hasFilters && <span className="filter-dot" />}
          </button>
          <button className="btn-refresh" onClick={fetchInvoices} title="Refresh">
            <RefreshCw size={15} className={loading ? 'spinner' : ''} />
          </button>
        </div>
      </div>

      {/* Expanded Filter Row */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label className="filter-label"><Calendar size={12} /> Date From</label>
            <input type="date" className="form-input filter-input" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
          </div>
          <div className="filter-group">
            <label className="filter-label"><Calendar size={12} /> Date To</label>
            <input type="date" className="form-input filter-input" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
          </div>
          <div className="filter-group">
            <label className="filter-label"><DollarSign size={12} /> Min Price (RM)</label>
            <input type="number" className="form-input filter-input" placeholder="0" value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value)} />
          </div>
          <div className="filter-group">
            <label className="filter-label"><DollarSign size={12} /> Max Price (RM)</label>
            <input type="number" className="form-input filter-input" placeholder="9999" value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value)} />
          </div>
          {hasFilters && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="history-summary">
        <span>{filtered.length} invoice{filtered.length !== 1 ? 's' : ''} found</span>
        {filtered.length > 0 && (
          <span className="total-amount">
            Total: RM {filtered.reduce((sum, inv) => sum + parseFloat(inv.price || 0), 0).toFixed(2)}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          Loading invoices...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FileText size={40} style={{ color: 'var(--border-color)', marginBottom: '0.75rem' }} />
          <p>{hasFilters ? 'No invoices match your filters.' : 'No invoices yet. Generate your first one!'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('invoice_number')} className="sortable">
                  <span><FileText size={12} /> Invoice No <SortIcon field="invoice_number" /></span>
                </th>
                <th onClick={() => handleSort('customer_name')} className="sortable">
                  <span><User size={12} /> Customer <SortIcon field="customer_name" /></span>
                </th>
                <th onClick={() => handleSort('price')} className="sortable">
                  <span><DollarSign size={12} /> Amount <SortIcon field="price" /></span>
                </th>
                <th onClick={() => handleSort('created_at')} className="sortable">
                  <span><Calendar size={12} /> Created <SortIcon field="created_at" /></span>
                </th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <span className="invoice-number-badge">{inv.invoice_number}</span>
                  </td>
                  <td>{inv.customer_name || '—'}</td>
                  <td>
                    <strong>RM {parseFloat(inv.price || 0).toFixed(2)}</strong>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {inv.created_at
                      ? format(parseISO(inv.created_at), 'dd MMM yyyy, hh:mm a')
                      : '—'}
                  </td>
                  <td>
                    {inv.pdf_url ? (
                      <a
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-download"
                        title="View / Download PDF"
                      >
                        <Download size={14} /> View PDF
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;
