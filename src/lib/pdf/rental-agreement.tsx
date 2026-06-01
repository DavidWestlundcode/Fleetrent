import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 48, color: '#1e293b' },
  header: { marginBottom: 32 },
  logo: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#2563eb', marginBottom: 4 },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 2 },
  subtitle: { fontSize: 10, color: '#64748b' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 160, color: '#64748b', fontSize: 9 },
  value: { flex: 1, color: '#0f172a' },
  bold: { fontFamily: 'Helvetica-Bold' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginVertical: 16 },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48 },
  footerText: { fontSize: 8, color: '#94a3b8', textAlign: 'center' },
  signatureBox: { marginTop: 40, flexDirection: 'row', gap: 40 },
  sigBox: { flex: 1, borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 8 },
  sigLabel: { fontSize: 8, color: '#64748b' },
  totalBox: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', padding: 12, borderRadius: 4, marginTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  totalLabel: { color: '#64748b', fontSize: 9 },
  totalValue: { color: '#0f172a' },
  totalFinal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  totalFinalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#0f172a' },
  totalFinalValue: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#2563eb' },
});

function fmt(n: number) {
  return n.toLocaleString('sv-SE') + ' kr';
}

interface Props {
  orderNumber: string;
  startDate: string;
  plannedReturnDate: string;
  openEnded: boolean;
  customerName: string;
  customerOrgNumber: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  machineName: string;
  machineModel: string;
  machineBrand: string;
  machineInternalCode: string;
  machineSerial: string;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  totalPrice: number;
  deposit: number;
  organizationName: string;
  standardTerms?: string;
  accessories?: string[];
  orderReference?: string;
  createdAt: string;
}

export default function RentalAgreementPDF(props: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.logo}>{props.organizationName}</Text>
          <Text style={s.title}>Hyresavtal</Text>
          <Text style={s.subtitle}>Order {props.orderNumber} · Utfärdat {props.createdAt}</Text>
        </View>

        {/* Customer */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Kund</Text>
          <View style={s.row}><Text style={s.label}>Företag</Text><Text style={[s.value, s.bold]}>{props.customerName}</Text></View>
          {props.customerOrgNumber ? <View style={s.row}><Text style={s.label}>Org.nummer</Text><Text style={s.value}>{props.customerOrgNumber}</Text></View> : null}
          {props.customerAddress ? <View style={s.row}><Text style={s.label}>Fakturaadress</Text><Text style={s.value}>{props.customerAddress}</Text></View> : null}
          {props.customerEmail ? <View style={s.row}><Text style={s.label}>E-post</Text><Text style={s.value}>{props.customerEmail}</Text></View> : null}
          {props.customerPhone ? <View style={s.row}><Text style={s.label}>Telefon</Text><Text style={s.value}>{props.customerPhone}</Text></View> : null}
          {props.orderReference ? <View style={s.row}><Text style={s.label}>Er referens</Text><Text style={s.value}>{props.orderReference}</Text></View> : null}
        </View>

        {/* Machine */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Hyrd maskin</Text>
          <View style={s.row}><Text style={s.label}>Maskin</Text><Text style={[s.value, s.bold]}>{props.machineName}</Text></View>
          <View style={s.row}><Text style={s.label}>Fabrikat / Modell</Text><Text style={s.value}>{props.machineBrand} {props.machineModel}</Text></View>
          {props.machineInternalCode ? <View style={s.row}><Text style={s.label}>Intern kod</Text><Text style={s.value}>{props.machineInternalCode}</Text></View> : null}
          {props.machineSerial ? <View style={s.row}><Text style={s.label}>Serienummer</Text><Text style={s.value}>{props.machineSerial}</Text></View> : null}
          {props.accessories && props.accessories.length > 0 ? (
            <View style={s.row}><Text style={s.label}>Tillbehör</Text><Text style={s.value}>{props.accessories.join(', ')}</Text></View>
          ) : null}
        </View>

        {/* Period */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Hyresperiod</Text>
          <View style={s.row}><Text style={s.label}>Startdatum</Text><Text style={[s.value, s.bold]}>{props.startDate}</Text></View>
          <View style={s.row}>
            <Text style={s.label}>Returdatum</Text>
            <Text style={s.value}>{props.openEnded ? 'Löpande (avslutas vid retur)' : props.plannedReturnDate}</Text>
          </View>
        </View>

        {/* Pricing */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Prissättning</Text>
          <View style={s.totalBox}>
            {props.dailyPrice > 0 && (
              <View style={s.totalRow}><Text style={s.totalLabel}>Dagspris</Text><Text style={s.totalValue}>{fmt(props.dailyPrice)} / dag</Text></View>
            )}
            {props.weeklyPrice > 0 && (
              <View style={s.totalRow}><Text style={s.totalLabel}>Veckopris</Text><Text style={s.totalValue}>{fmt(props.weeklyPrice)} / vecka</Text></View>
            )}
            {props.monthlyPrice > 0 && (
              <View style={s.totalRow}><Text style={s.totalLabel}>Månadspris</Text><Text style={s.totalValue}>{fmt(props.monthlyPrice)} / månad</Text></View>
            )}
            {props.deposit > 0 && (
              <View style={s.totalRow}><Text style={s.totalLabel}>Deposition</Text><Text style={s.totalValue}>{fmt(props.deposit)}</Text></View>
            )}
            {!props.openEnded && (
              <View style={s.totalFinal}>
                <Text style={s.totalFinalLabel}>Totalt (exkl. moms)</Text>
                <Text style={s.totalFinalValue}>{fmt(props.totalPrice)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Terms */}
        {props.standardTerms ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Villkor</Text>
            <Text style={{ fontSize: 9, color: '#475569', lineHeight: 1.5 }}>{props.standardTerms}</Text>
          </View>
        ) : null}

        {/* Signatures */}
        <View style={s.signatureBox}>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Uthyrarens underskrift</Text>
            <Text style={{ marginTop: 24, fontSize: 9, color: '#94a3b8' }}>{props.organizationName}</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Kundens underskrift</Text>
            <Text style={{ marginTop: 24, fontSize: 9, color: '#94a3b8' }}>{props.customerName}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{props.organizationName} · Hyresavtal {props.orderNumber} · Sidan genererad {props.createdAt}</Text>
        </View>
      </Page>
    </Document>
  );
}
