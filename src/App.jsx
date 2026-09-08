import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, User, FileText, Download, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import InvoiceTemplate from './InvoiceTemplate';
import { supabase } from './supabaseClient';

function App({ session }) {
  const [formData, setFormData] = useState({
    customerName: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    price: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [invoiceNumber, setInvoiceNumber] = useState('DRAFT');

  // We could fetch the next sequential invoice number here, 
  // but for a lightweight setup without RPC, we'll generate a unique one based on timestamp.
  useEffect(() => {
    const generateDraftNumber = () => {
      const timestamp = new Date().getTime().toString().slice(-6);
      setInvoiceNumber(`INV-${timestamp}`);
    };
    generateDraftNumber();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setStatus({ type: '', message: '' });
    
    try {
      // 1. Generate the PDF blob
      const blob = await pdf(<InvoiceTemplate formData={formData} invoiceNumber={invoiceNumber} />).toBlob();
      const fileName = `${invoiceNumber}.pdf`;

      // 2. Upload to Supabase Storage Bucket ('invoices')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error("Storage Error:", uploadError);
        throw new Error('Failed to upload PDF. Please ensure you created the "invoices" storage bucket in Supabase.');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(fileName);

      // 3. Insert metadata into Supabase Database ('invoices' table)
      const { error: dbError } = await supabase
        .from('invoices')
        .insert([
          { 
            invoice_number: invoiceNumber,
            customer_name: formData.customerName,
            price: parseFloat(formData.price),
            pdf_url: publicUrl,
            user_id: session.user.id
          }
        ]);

      if (dbError) {
        console.error("DB Error:", dbError);
        throw new Error('Failed to save to database. Ensure the "invoices" table exists.');
      }
      
      // 4. Create local download link for the user
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatus({ type: 'success', message: 'Invoice generated, saved to cloud, and downloaded!' });
      
      // Setup next invoice number
      const timestamp = new Date().getTime().toString().slice(-6);
      setInvoiceNumber(`INV-${timestamp}`);

    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.message || 'Failed to generate invoice.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header" style={{ position: 'relative' }}>
        <h1>Yuan Tian Kong</h1>
        <p>E-Invoice Generator</p>
        <button 
          onClick={handleLogout}
          style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <form onSubmit={handleGenerate}>
        <div className="form-grid">
          
          <div className="form-group full-width">
            <label className="form-label">
              <User className="icon" size={16} />
              Customer Name
            </label>
            <div className="input-icon-wrapper">
              <User className="icon" />
              <input 
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

          <div className="form-group">
            <label className="form-label">
              <Calendar className="icon" size={16} />
              Start Date
            </label>
            <input 
              type="date" 
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="form-input" 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Clock className="icon" size={16} />
              Start Time
            </label>
            <input 
              type="time" 
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="form-input" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Calendar className="icon" size={16} />
              End Date
            </label>
            <input 
              type="date" 
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="form-input" 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Clock className="icon" size={16} />
              End Time
            </label>
            <input 
              type="time" 
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="form-input" 
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              <DollarSign className="icon" size={16} />
              Price (RM)
            </label>
            <div className="input-icon-wrapper price-input-wrapper">
              <input 
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

        <button type="submit" className="btn-generate" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Clock className="icon spinner" /> Generating & Saving...
            </>
          ) : (
            <>
              <FileText className="icon" /> Generate E-Invoice
            </>
          )}
        </button>

        {status.type === 'success' && (
          <div className="success-message">
            <CheckCircle size={18} />
            {status.message}
          </div>
        )}

        {status.type === 'error' && (
          <div className="error-message">
            <AlertCircle size={18} />
            {status.message}
          </div>
        )}
      </form>
      
      {/* Live Preview Section */}
      <div className="preview-section">
        <h3 className="preview-title">Live Preview (No: {invoiceNumber})</h3>
        <div className="pdf-viewer-container">
           {/* We use PDFViewer to show a live preview of the invoice */}
           <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
             <InvoiceTemplate formData={formData} invoiceNumber={invoiceNumber} />
           </PDFViewer>
        </div>
      </div>

    </div>
  );
}

export default App;
