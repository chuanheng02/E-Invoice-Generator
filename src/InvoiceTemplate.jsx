import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { format, parseISO } from 'date-fns';
import { Solar } from 'lunar-javascript';

// Register Chinese fonts
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

const cn = { fontFamily: 'NotoSansSC' };
const cnBold = { fontFamily: 'NotoSansSC', fontWeight: 'bold' };

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
  invoiceTitleBlock: {
    flexDirection: 'column',
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    marginBottom: 2,
  },
  invoiceTitleCN: {
    fontSize: 13,
    fontFamily: 'NotoSansSC',
    fontWeight: 'bold',
    color: '#333333',
  },
  metaBlock: {
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textAlign: 'right',
    marginRight: 6,
  },
  metaLabelCN: {
    fontSize: 9,
    fontFamily: 'NotoSansSC',
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 6,
    color: '#444',
  },
  metaValue: {
    width: 110,
    textAlign: 'right',
    fontSize: 10,
  },

  // --- Bill To ---
  billToSection: {
    marginBottom: 28,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    borderBottomStyle: 'solid',
  },
  billToLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
    gap: 6,
  },
  billToLabelEN: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 6,
  },
  billToLabelCN: {
    fontFamily: 'NotoSansSC',
    fontSize: 10,
    color: '#777777',
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
  },
  tableHeaderCellDesc: {
    width: '65%',
  },
  tableHeaderCellAmount: {
    width: '35%',
    textAlign: 'right',
  },
  thEN: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  thCN: {
    fontFamily: 'NotoSansSC',
    fontSize: 9,
    color: '#555555',
    marginTop: 1,
  },
  tableBody: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
    paddingVertical: 14,
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
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateBlock: {
    marginBottom: 6,
  },
  dateLabelRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dateLabelEN: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginRight: 4,
  },
  dateLabelCN: {
    fontSize: 9,
    fontFamily: 'NotoSansSC',
    color: '#666666',
  },
  dateChinese: {
    fontFamily: 'NotoSansSC',
    fontSize: 10,
    marginBottom: 1,
  },
  dateGregorian: {
    fontSize: 9,
    color: '#555555',
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
  totalLabelBlock: {
    alignItems: 'flex-end',
    marginRight: 24,
  },
  totalLabelEN: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
  },
  totalLabelCN: {
    fontFamily: 'NotoSansSC',
    fontSize: 10,
    color: '#555555',
    marginTop: 1,
  },
  totalValueBlock: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    textAlign: 'right',
  },

  // --- Company Chop ---
  chopWrapper: {
    position: 'absolute',
    bottom: 60,
    right: 50,
    alignItems: 'center',
  },
  chopBox: {
    width: 150,
    height: 110,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderStyle: 'dashed',
    borderRadius: 4,
  },
  chopLabel: {
    marginTop: 5,
    fontSize: 7.5,
    color: '#bbbbbb',
    fontFamily: 'NotoSansSC',
    textAlign: 'center',
  },

  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 35,
    left: 50,
    right: 215,
    textAlign: 'left',
    color: '#888888',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
});

function toChineseLunar(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = parseISO(dateStr);
    const solar = Solar.fromDate(d);
    const lunar = solar.getLunar();
    return `农历 ${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
  } catch {
    return '—';
  }
}

function formatGregorian(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

const InvoiceTemplate = ({ formData, invoiceNumber }) => {
  const { customerName, startDate, endDate, price } = formData;
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

        {/* Invoice Title & Meta */}
        <View style={styles.invoiceHeaderRow}>
          <View style={styles.invoiceTitleBlock}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceTitleCN}>发票</Text>
          </View>
          <View style={styles.metaBlock}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice No / </Text>
              <Text style={{...styles.metaLabelCN, marginRight: 6}}>发票号码:</Text>
              <Text style={styles.metaValue}>{invoiceNumber || 'DRAFT'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date / </Text>
              <Text style={{...styles.metaLabelCN, marginRight: 6}}>日期:</Text>
              <Text style={styles.metaValue}>{currentDateStr}</Text>
            </View>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billToSection}>
          <View style={styles.billToLabelRow}>
            <Text style={styles.billToLabelEN}>Bill To</Text>
            <Text style={styles.billToLabelCN}>/ 致</Text>
          </View>
          <Text style={styles.billToValue}>{customerName || '—'}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <View style={styles.tableHeaderCellDesc}>
              <Text style={styles.thEN}>Description</Text>
              <Text style={styles.thCN}>描述</Text>
            </View>
            <View style={styles.tableHeaderCellAmount}>
              <Text style={styles.thEN}>Amount (RM)</Text>
              <Text style={styles.thCN}>金额 (令吉)</Text>
            </View>
          </View>

          {/* Row */}
          <View style={styles.tableBody}>
            <View style={styles.tableCellDesc}>
              <Text style={styles.itemTitle}>Setup 圆坛</Text>

              {/* Start Date */}
              <View style={styles.dateBlock}>
                <View style={styles.dateLabelRow}>
                  <Text style={styles.dateLabelEN}>Start /</Text>
                  <Text style={styles.dateLabelCN}> 开始日期</Text>
                </View>
                <Text style={styles.dateChinese}>{toChineseLunar(startDate)}</Text>
                <Text style={styles.dateGregorian}>{formatGregorian(startDate)}</Text>
              </View>

              {/* End Date */}
              <View style={styles.dateBlock}>
                <View style={styles.dateLabelRow}>
                  <Text style={styles.dateLabelEN}>End /</Text>
                  <Text style={styles.dateLabelCN}> 结束日期</Text>
                </View>
                <Text style={styles.dateChinese}>{toChineseLunar(endDate)}</Text>
                <Text style={styles.dateGregorian}>{formatGregorian(endDate)}</Text>
              </View>
            </View>

            <View style={styles.tableCellAmount}>
              <Text>{priceNum.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <View style={styles.totalLabelBlock}>
            <Text style={styles.totalLabelEN}>Total Amount</Text>
            <Text style={styles.totalLabelCN}>总金额</Text>
          </View>
          <View style={styles.totalValueBlock}>
            <Text style={styles.totalValue}>RM {priceNum.toFixed(2)}</Text>
          </View>
        </View>

        {/* Company Chop — clean empty box, label sits quietly outside below */}
        <View style={styles.chopWrapper}>
          <View style={styles.chopBox} />
          <Text style={styles.chopLabel}>公司盖章 / Company Chop</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a computer-generated document.</Text>
          <Text style={{ fontFamily: 'NotoSansSC', marginTop: 2 }}>此乃电脑生成文件。</Text>
        </View>

      </Page>
    </Document>
  );
};

export default InvoiceTemplate;
