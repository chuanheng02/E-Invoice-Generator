import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, User, FileText, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import InvoiceTemplate from './InvoiceTemplate';
import { supabase } from './supabaseClient';

function App({ session }) {
  const [formData, setFormData] = useState({
    customerName: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    price: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Generate a unique invoice number on mount and after each successful generation
  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const seq = now.getTime().toString().slice(-5);
    return `INV-${year}${month}-${seq}`;
  };

  useEffect(() => {
    setInvoiceNumber(generateInvoiceNumber());
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

    // Basic validation: end date should not be before start date
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setStatus({ type: 'error', message: 'End date cannot be before start date.' });
      setIsGenerating(false);
      return;
    }

    try {
      // 1. Generate the PDF blob
      const blob = await pdf(
        <InvoiceTemplate formData={formData} invoiceNumber={invoiceNumber} />
      ).toBlob();
      const fileName = `${invoiceNumber}.pdf`;

      // 2. Upload to Supabase Storage Bucket ('invoices')
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

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('invoices').getPublicUrl(fileName);

      // 3. Insert metadata into Supabase Database ('invoices' table)
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

      // 4. Trigger local download
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

      // Generate next invoice number for the next submission
      setInvoiceNumber(generateInvoiceNumber());
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
        <button onClick={handleLogout} className="btn-logout">
          <LogOut className="icon" /> Logout
        </button>
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

          {/* Start Time */}
          <div className="form-group">
            <label className="form-label" htmlFor="startTime">
              <Clock className="icon" />
              Start Time
            </label>
            <input
              id="startTime"
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="form-input"
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

          {/* End Time */}
          <div className="form-group">
            <label className="form-label" htmlFor="endTime">
              <Clock className="icon" />
              End Time
            </label>
            <input
              id="endTime"
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="form-input"
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
