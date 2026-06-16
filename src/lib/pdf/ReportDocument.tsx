// src/lib/pdf/ReportDocument.tsx
// ============================================================
// PDF template untuk laporan — AC-7.8, D8: export format = PDF
// Menggunakan @react-pdf/renderer
// ============================================================

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { ReportData, ReportRow } from '@/lib/types/report'

// ---- Styles ----
const styles = StyleSheet.create({
  page: {
    fontFamily:  'Helvetica',
    fontSize:    10,
    padding:     32,
    color:       '#1a1a1a',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #e5e5e5',
    paddingBottom: 12,
  },
  title: {
    fontSize:   18,
    fontFamily: 'Helvetica-Bold',
    color:      '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color:    '#666',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize:     11,
    fontFamily:   'Helvetica-Bold',
    marginBottom: 8,
    color:        '#333',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding:         '6 8',
    borderBottom:    '1px solid #e0e0e0',
  },
  tableRow: {
    flexDirection: 'row',
    padding:       '5 8',
    borderBottom:  '0.5px solid #f0f0f0',
  },
  tableRowTotal: {
    flexDirection:   'row',
    padding:         '6 8',
    borderTop:       '1.5px solid #333',
    backgroundColor: '#fafafa',
  },
  colLabel:  { width: '22%', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  colNum:    { width: '13%', textAlign: 'right', fontSize: 9 },
  colHeader: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#666' },
  totalLabel: { width: '22%', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  totalNum:   { width: '13%', textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  footer: {
    position:   'absolute',
    bottom:     20,
    left:       32,
    right:      32,
    fontSize:   8,
    color:      '#999',
    textAlign:  'center',
    borderTop:  '0.5px solid #e5e5e5',
    paddingTop: 6,
  },
  bonusRow: {
    flexDirection: 'row',
    padding:       '4 8',
    borderBottom:  '0.5px solid #f0f0f0',
  },
})

// Format Rupiah untuk PDF
function rp(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style:                 'currency',
    currency:              'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface Props {
  data: ReportData
  title: string
  subtitle: string
}

function TableRow({ row, isTotal = false }: { row: ReportRow; isTotal?: boolean }) {
  const RowStyle = isTotal ? styles.tableRowTotal : styles.tableRow
  const LabelStyle = isTotal ? styles.totalLabel : styles.colLabel
  const NumStyle = isTotal ? styles.totalNum : styles.colNum

  return (
    <View style={RowStyle}>
      <Text style={LabelStyle}>{row.label}</Text>
      <Text style={NumStyle}>{rp(row.omzetLM)}</Text>
      <Text style={NumStyle}>{rp(row.omzetBR)}</Text>
      <Text style={NumStyle}>{rp(row.omzetTotal)}</Text>
      <Text style={NumStyle}>{rp(row.labaHL)}</Text>
      <Text style={NumStyle}>{rp(row.piutang)}</Text>
      <Text style={NumStyle}>{rp(row.sudahDibayar)}</Text>
    </View>
  )
}

export default function ReportDocument({ data, title, subtitle }: Props) {
  const now = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.subtitle}>Dicetak: {now}</Text>
        </View>

        {/* Rekap Table — AC-7.5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rekap Transaksi</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colLabel, styles.colHeader]}>Periode</Text>
              <Text style={[styles.colNum,   styles.colHeader]}>Omzet LM</Text>
              <Text style={[styles.colNum,   styles.colHeader]}>Omzet BR</Text>
              <Text style={[styles.colNum,   styles.colHeader]}>Total Omzet</Text>
              <Text style={[styles.colNum,   styles.colHeader]}>Laba HL</Text>
              <Text style={[styles.colNum,   styles.colHeader]}>Piutang</Text>
              <Text style={[styles.colNum,   styles.colHeader]}>Sudah Bayar</Text>
            </View>

            {/* Data Rows */}
            {data.rows.map((row, i) => (
              <TableRow key={i} row={row} />
            ))}

            {/* Total Row */}
            <TableRow row={data.totals} isTotal />
          </View>
        </View>

        {/* Bonus Log — AC-7.7: terpisah dari omzet */}
        {data.bonusTransactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Log Bon Bonus ({data.bonusTransactions.length} bon — tidak termasuk dalam omzet)
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[{ width: '15%' }, styles.colHeader]}>Tanggal</Text>
                <Text style={[{ width: '20%' }, styles.colHeader]}>Nomor Bon</Text>
                <Text style={[{ width: '40%' }, styles.colHeader]}>Pelanggan</Text>
                <Text style={[{ width: '25%' }, styles.colHeader]}>Bonus Diberikan</Text>
              </View>
              {data.bonusTransactions.map((b, i) => (
                <View key={i} style={styles.bonusRow}>
                  <Text style={{ width: '15%', fontSize: 9 }}>
                    {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                  <Text style={{ width: '20%', fontSize: 9 }}>{b.nomorBon}</Text>
                  <Text style={{ width: '40%', fontSize: 9 }}>{b.customerNama}</Text>
                  <Text style={{ width: '25%', fontSize: 9 }}>{b.quantityGranted}× bonus</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          HL Finance — Sales & Receivables Management · {now}
        </Text>
      </Page>
    </Document>
  )
}
