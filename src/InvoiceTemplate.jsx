import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { format, parseISO } from 'date-fns';
import { Solar } from 'lunar-javascript';

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
  orgRegNo: { fontSize: 10, marginBottom: 6 },
  orgNameMalay: { fontSize: 11, marginBottom: 3 },
  secretaryLine: { fontSize: 9, color: '#444444' },

  // --- Invoice Title Row ---
  invoiceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  invoiceTitleBlock: { flexDirection: 'column' },
  // Single-font titles — no mixing needed
  invoiceTitleEN: {
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
  metaBlock: { alignItems: 'flex-end' },
  metaRow: { marginBottom: 5 },
  // Inline mixed text for meta — all in one <Text>, nested spans
  metaText: { fontSize: 10, textAlign: 'right' },

  // --- Bill To ---
  billToSection: {
    marginBottom: 28,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    borderBottomStyle: 'solid',
  },
  // Inline mixed label
  billToLabel: { fontSize: 10, marginBottom: 5 },
  billToValue: {
    fontFamily: 'NotoSansSC',
    fontSize: 12,
  },

  // --- Table ---
  table: { width: '100%', marginBottom: 20 },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingBottom: 8,
  },
  tableHeaderCellDesc: { width: '65%' },
  tableHeaderCellAmount: { width: '35%', textAlign: 'right' },
  // Each column header is a single <Text> with inline mix
  thText: { fontSize: 10 },

  tableBody: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
    paddingVertical: 14,
  },
  tableCellDesc: { width: '65%' },
  tableCellAmount: {
    width: '35%',
    textAlign: 'right',
    fontSize: 11,
    paddingTop: 2,
  },
  itemTitle: {
    fontFamily: 'NotoSansSC',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateBlock: { marginBottom: 8 },
  // Inline label (EN + CN in same Text)
  dateLabel: { fontSize: 9, marginBottom: 3 },
  dateChinese: {
    fontFamily: 'NotoSansSC',
    fontSize: 10,
    marginBottom: 1,
  },
  dateGregorian: { fontSize: 9, color: '#555555' },

  // --- Total ---
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#000000',
    borderTopStyle: 'solid',
  },
  // Inline total label
  totalLabel: { fontSize: 11, marginRight: 20, textAlign: 'right' },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    minWidth: 100,
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

  // Helper: inline bilingual text — EN (Helvetica-Bold) + CN (NotoSansSC) in ONE <Text>
  // This is the key to perfect alignment — same line box, same baseline.
  const BiText = ({ enLabel, cnLabel, style, enStyle, cnStyle }) => (
    <Text style={[styles.thText, style]}>
      <Text style={[{ fontFamily: 'Helvetica-Bold' }, enStyle]}>{enLabel}</Text>
      <Text style={[{ fontFamily: 'NotoSansSC', color: '#555555' }, cnStyle]}> {cnLabel}</Text>
    </Text>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Organization Header */}
        <View style={styles.header}>
          <Text style={styles.orgNameChinese}>元天宫</Text>
          <Text style={styles.orgRegNo}>(No Pendaftaran: 1025-07-WKL)</Text>
          <Text style={styles.orgNameMalay}>
            Persatuan Penganut Dewa Yuan Tian Kong, Kuala Lumpur dan Selangor
          </Text>
          <Text style={styles.secretaryLine}>Secretary General: Ng Kee Hock</Text>
        </View>

        {/* Invoice Title & Meta */}
        <View style={styles.invoiceHeaderRow}>
          <View style={styles.invoiceTitleBlock}>
            {/* Each on its own line — no mixing needed */}
            <Text style={styles.invoiceTitleEN}>INVOICE</Text>
            <Text style={styles.invoiceTitleCN}>发票</Text>
          </View>
          <View style={styles.metaBlock}>
            {/* KEY FIX: All labels inline in one <Text> so fonts share the same line */}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Invoice No  </Text>
                <Text style={{ fontFamily: 'NotoSansSC', color: '#666' }}>发票号码:  </Text>
                <Text>{invoiceNumber || 'DRAFT'}</Text>
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Date  </Text>
                <Text style={{ fontFamily: 'NotoSansSC', color: '#666' }}>日期:  </Text>
                <Text>{currentDateStr}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billToSection}>
          <Text style={styles.billToLabel}>
            <Text style={{ fontFamily: 'Helvetica-Bold', letterSpacing: 1 }}>BILL TO  </Text>
            <Text style={{ fontFamily: 'NotoSansSC', color: '#777777' }}>致</Text>
          </Text>
          <Text style={styles.billToValue}>{customerName || '—'}</Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.tableHeaderCellDesc}>
              <Text style={styles.thText}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>DESCRIPTION  </Text>
                <Text style={{ fontFamily: 'NotoSansSC', color: '#555' }}>描述</Text>
              </Text>
            </View>
            <View style={styles.tableHeaderCellAmount}>
              <Text style={styles.thText}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>AMOUNT (RM)  </Text>
                <Text style={{ fontFamily: 'NotoSansSC', color: '#555' }}>金额</Text>
              </Text>
            </View>
          </View>

          {/* Table Body */}
          <View style={styles.tableBody}>
            <View style={styles.tableCellDesc}>
              <Text style={styles.itemTitle}>Setup 圆坛</Text>

              {/* Start Date */}
              <View style={styles.dateBlock}>
                <Text style={styles.dateLabel}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>Start  </Text>
                  <Text style={{ fontFamily: 'NotoSansSC', color: '#666' }}>开始日期</Text>
                </Text>
                <Text style={styles.dateChinese}>{toChineseLunar(startDate)}</Text>
                <Text style={styles.dateGregorian}>{formatGregorian(startDate)}</Text>
              </View>

              {/* End Date */}
              <View style={styles.dateBlock}>
                <Text style={styles.dateLabel}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>End  </Text>
                  <Text style={{ fontFamily: 'NotoSansSC', color: '#666' }}>结束日期</Text>
                </Text>
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
          <Text style={styles.totalLabel}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Total Amount  </Text>
            <Text style={{ fontFamily: 'NotoSansSC', color: '#555' }}>总金额</Text>
          </Text>
          <Text style={styles.totalValue}>RM {priceNum.toFixed(2)}</Text>
        </View>

        {/* Company Chop — empty clean box, label outside below */}
        <View style={styles.chopWrapper}>
          <View style={styles.chopBox} />
          <Text style={styles.chopLabel}>公司盖章 / Company Chop</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            <Text>This is a computer-generated document.  </Text>
            <Text style={{ fontFamily: 'NotoSansSC' }}>此乃电脑生成文件。</Text>
          </Text>
        </View>

      </Page>
    </Document>
  );
};

export default InvoiceTemplate;
