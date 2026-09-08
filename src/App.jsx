import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, User, FileText, CheckCircle, AlertCircle, LogOut, History } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';
import InvoiceTemplate from './InvoiceTemplate';
import { supabase } from './supabaseClient';

function App({ session }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: '',
    startDate: '',
    endDate: '',
    price: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [invoiceNumber, setInvoiceNumber] = useState('Loading...');

  /**
   * Generates a sequential invoice number by querying the DB.
   * Format: INV-YYMM-NNNN
   *   YYMM = current year + month (e.g. 2609 for Sep 2026)
   *   NNNN = count of ALL invoices + 1 (global sequence, never resets)
   * Example: INV-2609-0001, INV-2609-0002, INV-2610-0003
   */
  const fetchNextInvoiceNumber = async () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `INV-${year}${month}`;

    // Count ALL invoices ever created by this user to get a global sequence
    const { count, error } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });

    const nextSeq = ((count || 0) + 1).toString().padStart(4, '0');
    return `${prefix}-${nextSeq}`;
  };

  useEffect(() => {
    fetchNextInvoiceNumber().then(setInvoiceNumber);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setStatus({ type: '', message: '' });

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setStatus({ type: 'error', message: 'End date cannot be before start date.' });
      setIsGenerating(false);
      return;
    }

    try {
      const blob = await pdf(
        <InvoiceTemplate formData={formData} invoiceNumber={invoiceNumber} />
      ).toBlob();
      const fileName = `${invoiceNumber}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage Error:', uploadError);
        throw new Error(
          'Failed to upload PDF. Please ensure you created the "invoices" storage bucket in Supabase.'
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('invoices').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('invoices').insert([
        {
          invoice_number: invoiceNumber,
          customer_name: formData.customerName,
          price: parseFloat(formData.price),
          pdf_url: publicUrl,
          user_id: session.user.id,
        },
      ]);

      if (dbError) {
        console.error('DB Error:', dbError);
        throw new Error(
          'Failed to save to database. Ensure the "invoices" table exists with the correct schema.'
        );
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus({
        type: 'success',
        message: `${invoiceNumber} — Invoice saved to cloud and downloaded!`,
      });

      // Generate next invoice number from DB for the next submission
      fetchNextInvoiceNumber().then(setInvoiceNumber);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.message || 'Failed to generate invoice.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>元天宫 E-Invoice</h1>
        <p className="subtitle">Persatuan Penganut Dewa Yuan Tian Kong, KL &amp; Selangor</p>
        <span className="org-badge">Registration No. 1025-07-WKL</span>
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => navigate('/history')} className="btn-logout" style={{ position: 'static', color: 'var(--accent-color)' }}>
            <History className="icon" /> History
          </button>
          <button onClick={handleLogout} className="btn-logout" style={{ position: 'static' }}>
            <LogOut className="icon" /> Logout
          </button>
        </div>
      </div>

      <form onSubmit={handleGenerate}>
        <div className="form-grid">
          {/* Customer Name */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="customerName">
              <User className="icon" />
              Customer Name
            </label>
            <div className="input-icon-wrapper">
              <User className="icon" />
              <input
                id="customerName"
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter customer or company name"
                required
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="startDate">
              <Calendar className="icon" />
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* End Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="endDate">
              <Calendar className="icon" />
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* Price */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="price">
              <DollarSign className="icon" />
              Price (RM)
            </label>
            <div className="price-input-wrapper">
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button type="submit" className="btn-generate" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <span className="spinner" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}></span>
              Generating &amp; Saving...
            </>
          ) : (
            <>
              <FileText className="icon" /> Generate E-Invoice
            </>
          )}
        </button>

        {/* Status Messages */}
        {status.type === 'success' && (
          <div className="success-message">
            <CheckCircle size={16} />
            {status.message}
          </div>
        )}

        {status.type === 'error' && (
          <div className="error-message">
            <AlertCircle size={16} />
            {status.message}
          </div>
        )}
      </form>

      {/* Invoice Number Preview */}
      <div className="preview-section">
        <div className="preview-header">
          <span className="preview-title">Next Invoice</span>
          <span className="preview-badge">{invoiceNumber}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
