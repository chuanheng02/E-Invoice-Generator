import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register fonts if needed, or use default standard fonts
// Since it's B&W and professional, Helvetica (default) is fine. 
// However, for Chinese characters (元天宫, 圆坛), we NEED a font that supports Chinese.
// We will use standard NotoSansSC or similar. But wait, @react-pdf/renderer requires a URL for custom fonts.
// To handle Chinese characters, we must register a font.
Font.register({
  family: 'NotoSansSC',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.12/files/noto-sans-sc-chinese-simplified-400-normal.woff'
});
Font.register({
  family: 'NotoSansSC-Bold',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.12/files/noto-sans-sc-chinese-simplified-700-normal.woff'
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000000',
  },
  chineseText: {
    fontFamily: 'NotoSansSC',
  },
  chineseTextBold: {
    fontFamily: 'NotoSansSC-Bold',
  },
  header: {
    borderBottom: '1 solid #000000',
    paddingBottom: 15,
    marginBottom: 20,
  },
  titleContainer: {
    textAlign: 'center',
    marginBottom: 10,
  },
  orgTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansSC-Bold',
    marginBottom: 4,
  },
  orgSubtitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  secretary: {
    fontSize: 9,
    color: '#333333',
  },
  invoiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  metaContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    width: 80,
    fontWeight: 'bold',
  },
  metaValue: {
    width: 100,
    textAlign: 'right',
  },
  billTo: {
    marginBottom: 30,
  },
  billToLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '33.33%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#f3f3f3',
    padding: 5,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '33.33%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 5,
  },
  tableColWideHeader: {
    width: '66.66%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#f3f3f3',
    padding: 5,
    fontWeight: 'bold',
  },
  tableColWide: {
    width: '66.66%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 5,
  },
  tableCell: {
    marginTop: 2,
  },
  tableCellRight: {
    marginTop: 2,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 20,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#666666',
    fontSize: 8,
    borderTop: '1 solid #cccccc',
    paddingTop: 10,
  }
});

const InvoiceTemplate = ({ formData, invoiceNumber }) => {
  const { customerName, startDate, startTime, endDate, endTime, price } = formData;
  
  // Format dates for display
  const startDateTimeStr = startDate ? `${format(new Date(startDate), 'dd MMM yyyy')} ${startTime || ''}` : '-';
  const endDateTimeStr = endDate ? `${format(new Date(endDate), 'dd MMM yyyy')} ${endTime || ''}` : '-';
  const currentDateStr = format(new Date(), 'dd MMM yyyy');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.orgTitle}>元天宫 <Text style={{fontSize: 12, fontFamily: 'Helvetica'}}>(No Pendaftaran: 1025-07-WKL)</Text></Text>
            <Text style={styles.orgSubtitle}>Persatuan Penganut Dewa Yuan Tian Kong, Kuala Lumpur dan Selangor</Text>
            <Text style={styles.secretary}>Secretary General: Ng Kee Hock</Text>
          </View>
        </View>

        {/* Invoice Title & Meta */}
        <View style={styles.invoiceHeaderRow}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
          </View>
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice No:</Text>
              <Text style={styles.metaValue}>{invoiceNumber || 'DRAFT'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date:</Text>
              <Text style={styles.metaValue}>{currentDateStr}</Text>
            </View>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billTo}>
          <Text style={styles.billToLabel}>Bill To:</Text>
          <Text style={styles.chineseText}>{customerName || 'Cash Customer'}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColWideHeader}>
              <Text style={styles.tableCell}>Description</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={[styles.tableCell, {textAlign: 'right'}]}>Amount (RM)</Text>
            </View>
          </View>
          
          {/* Table Body */}
          <View style={styles.tableRow}>
            <View style={styles.tableColWide}>
              <Text style={[styles.chineseText, {marginBottom: 8, fontSize: 11}]}>Setup 圆坛</Text>
              
              <Text style={{color: '#444444'}}>Start: {startDateTimeStr}</Text>
              <Text style={{color: '#444444'}}>End: {endDateTimeStr}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellRight}>{parseFloat(price || 0).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>RM {parseFloat(price || 0).toFixed(2)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a computer-generated document. No signature is required.</Text>
        </View>
        
      </Page>
    </Document>
  );
};

export default InvoiceTemplate;
