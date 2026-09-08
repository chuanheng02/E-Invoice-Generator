import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, User, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import InvoiceTemplate from './InvoiceTemplate';

function App() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setStatus({ type: '', message: '' });
    
    try {
      // In a real app with Supabase, we would fetch the next invoice number here.
      // For now, we simulate an auto-generated invoice number.
      const simulatedInvoiceNumber = `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      setInvoiceNumber(simulatedInvoiceNumber);

      // Generate the PDF blob
      const blob = await pdf(<InvoiceTemplate formData={formData} invoiceNumber={simulatedInvoiceNumber} />).toBlob();
      
      // Simulate Supabase Upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${simulatedInvoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatus({ type: 'success', message: 'Invoice generated and downloaded successfully!' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Failed to generate invoice. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Yuan Tian Kong</h1>
        <p>E-Invoice Generator</p>
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
              <Clock className="icon spinner" /> Generating...
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
        <h3 className="preview-title">Live Preview</h3>
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
