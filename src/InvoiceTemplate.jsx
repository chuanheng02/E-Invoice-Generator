import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { format, parseISO } from 'date-fns';

// Register Chinese fonts for 元天宫 and 圆坛
Font.register({
  family: 'NotoSansSC',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.12/files/noto-sans-sc-chinese-simplified-400-normal.woff',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.12/files/noto-sans-sc-chinese-simplified-700-normal.woff',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000000',
  },
  // --- Header ---
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingBottom: 18,
    marginBottom: 25,
    textAlign: 'center',
  },
  orgNameChinese: {
    fontSize: 22,
    fontFamily: 'NotoSansSC',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  orgRegNo: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    marginBottom: 6,
  },
  orgNameMalay: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    marginBottom: 3,
  },
  secretaryLine: {
    fontSize: 9,
    color: '#444444',
    fontFamily: 'Helvetica',
  },
  // --- Invoice Title Row ---
  invoiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  invoiceTitle: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
  },
  metaBlock: {
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  metaLabel: {
    width: 80,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    textAlign: 'right',
  },
  metaValue: {
    width: 110,
    textAlign: 'right',
    fontSize: 10,
  },
  // --- Bill To ---
  billToSection: {
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    borderBottomStyle: 'solid',
  },
  billToLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#555555',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  billToValue: {
    fontFamily: 'NotoSansSC',
    fontSize: 12,
  },
  // --- Table ---
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingBottom: 6,
    marginBottom: 0,
  },
  tableHeaderCellDesc: {
    width: '65%',
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableHeaderCellAmount: {
    width: '35%',
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableBody: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
    paddingVertical: 12,
  },
  tableCellDesc: {
    width: '65%',
  },
  tableCellAmount: {
    width: '35%',
    textAlign: 'right',
    fontSize: 11,
    fontFamily: 'Helvetica',
    paddingTop: 2,
  },
  itemTitle: {
    fontFamily: 'NotoSansSC',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  itemDetail: {
    fontSize: 9,
    color: '#555555',
    marginBottom: 2,
  },
  // --- Total ---
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#000000',
    borderTopStyle: 'solid',
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    marginRight: 30,
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    minWidth: 100,
    textAlign: 'right',
  },
  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    textAlign: 'center',
    color: '#888888',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
});

const InvoiceTemplate = ({ formData, invoiceNumber }) => {
  const { customerName, startDate, startTime, endDate, endTime, price } = formData;

  // Use parseISO to avoid timezone off-by-one issues with date-only strings
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTime12h = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const startStr = startDate ? `${formatDate(startDate)}${startTime ? ', ' + formatTime12h(startTime) : ''}` : '—';
  const endStr = endDate ? `${formatDate(endDate)}${endTime ? ', ' + formatTime12h(endTime) : ''}` : '—';
  const currentDateStr = format(new Date(), 'dd MMM yyyy');
  const priceNum = parseFloat(price || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Organization Header */}
        <View style={styles.header}>
          <Text style={styles.orgNameChinese}>元天宫</Text>
          <Text style={styles.orgRegNo}>(No Pendaftaran: 1025-07-WKL)</Text>
          <Text style={styles.orgNameMalay}>Persatuan Penganut Dewa Yuan Tian Kong, Kuala Lumpur dan Selangor</Text>
          <Text style={styles.secretaryLine}>Secretary General: Ng Kee Hock</Text>
        </View>

        {/* Invoice Title & Meta Info */}
        <View style={styles.invoiceHeaderRow}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <View style={styles.metaBlock}>
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
        <View style={styles.billToSection}>
          <Text style={styles.billToLabel}>Bill To</Text>
          <Text style={styles.billToValue}>{customerName || '—'}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCellDesc}>Description</Text>
            <Text style={styles.tableHeaderCellAmount}>Amount (RM)</Text>
          </View>
          <View style={styles.tableBody}>
            <View style={styles.tableCellDesc}>
              <Text style={styles.itemTitle}>Setup 圆坛</Text>
              <Text style={styles.itemDetail}>Start: {startStr}</Text>
              <Text style={styles.itemDetail}>End: {endStr}</Text>
            </View>
            <View style={styles.tableCellAmount}>
              <Text>{priceNum.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>RM {priceNum.toFixed(2)}</Text>
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
