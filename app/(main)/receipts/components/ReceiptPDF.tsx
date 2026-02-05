/* eslint-disable react/no-unescaped-entities */
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ReceiptWithDetails } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Register font
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica-bold@1.0.4/Helvetica-Bold.ttf', fontWeight: 'bold' },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1pt solid #000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  summary: {
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 5,
    border: '1pt solid #e5e7eb',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  income: {
    color: '#059669',
  },
  expense: {
    color: '#dc2626',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  gridItem: {
    width: '50%',
    marginBottom: 8,
  },
  label: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    marginBottom: 5,
  },
  badge: {
    backgroundColor: '#f3f4f6',
    padding: '2 6',
    borderRadius: 3,
    fontSize: 8,
    marginRight: 4,
  },
  reasonBox: {
    backgroundColor: '#f9fafb',
    border: '1pt solid #e5e7eb',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  statusBox: {
    backgroundColor: '#fef3c7',
    border: '1pt solid #fbbf24',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1pt solid #e5e7eb',
    fontSize: 8,
    color: '#666',
  },
});

interface ReceiptPDFProps {
  receipt: ReceiptWithDetails;
}

export function ReceiptPDF({ 
  receipt 
}: ReceiptPDFProps) {
  const isIncome = receipt.transaction_type === 'income';
  const amount = receipt.transaction_amount || 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>REÇU À EXÉCUTER</Text>
          <Text style={styles.subtitle}>
            Hôpital des Comores • Reçu #{receipt.receiptId.substring(0, 8)}...
          </Text>
          <Text style={styles.subtitle}>
            Date d'émission: {format(new Date(receipt.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusBox}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#92400e' }}>
            ⚠️ EN ATTENTE D'EXÉCUTION
          </Text>
          <Text style={{ fontSize: 9, color: '#92400e', marginTop: 5 }}>
            Ce reçu doit être exécuté par le département concerné.
            Une fois exécuté, il sera supprimé du système.
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summary}>
          <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
            {isIncome ? '+' : '-'}{amount.toLocaleString('fr-FR')} KMF
          </Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5 }}>
            {isIncome ? 'RECETTE À ENCAISSER' : 'DÉPENSE À DÉCAISSER'} • {receipt.department_name?.toUpperCase() || 'DÉPARTEMENT NON SPÉCIFIÉ'}
          </Text>
          <Text style={{ fontSize: 9, color: '#666' }}>
            ID Transaction: {receipt.transactionId?.substring(0, 8)}...
          </Text>
        </View>

        {/* Receipt Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DU REÇU</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Type d'opération</Text>
              <Text style={styles.value}>
                {isIncome ? 'Recette (Entrée d\'argent)' : 'Dépense (Sortie d\'argent)'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Montant</Text>
              <Text style={[styles.value, { fontWeight: 'bold', fontSize: 11 }]}>
                {amount.toLocaleString('fr-FR')} KMF
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Département concerné</Text>
              <Text style={styles.value}>
                {receipt.department_name || 'Non spécifié'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Date d'émission</Text>
              <Text style={styles.value}>
                {format(new Date(receipt.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
              </Text>
            </View>
          </View>
        </View>

        {/* Reason Section */}
        {receipt.reason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MOTIF DU REÇU</Text>
            <View style={styles.reasonBox}>
              <Text style={{ fontSize: 10, lineHeight: 1.4 }}>
                {receipt.reason}
              </Text>
            </View>
          </View>
        )}

        {/* Transaction Information */}
        {receipt.transaction_reason && receipt.transaction_reason !== receipt.reason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MOTIF DE LA TRANSACTION ASSOCIÉE</Text>
            <View style={styles.reasonBox}>
              <Text style={{ fontSize: 10, lineHeight: 1.4, color: '#666' }}>
                {receipt.transaction_reason}
              </Text>
            </View>
          </View>
        )}

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DE LA TRANSACTION</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Date de transaction</Text>
              <Text style={styles.value}>
                {receipt.transaction_createdAt 
                  ? format(new Date(receipt.transaction_createdAt), "dd/MM/yyyy HH:mm", { locale: fr })
                  : 'Non disponible'
                }
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Identifiant transaction</Text>
              <Text style={styles.value}>
                {receipt.transactionId?.substring(0, 8)}...
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INSTRUCTIONS</Text>
          <View style={{ padding: 10, backgroundColor: '#f0f9ff', borderRadius: 5, border: '1pt solid #e0f2fe' }}>
            <Text style={{ fontSize: 9, lineHeight: 1.4, marginBottom: 5 }}>
              1. Ce reçu doit être traité par le département {receipt.department_name || 'concerné'}
            </Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4, marginBottom: 5 }}>
              2. Une fois l'opération exécutée, marquer ce reçu comme "exécuté" dans le système
            </Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4 }}>
              3. Conserver une copie de ce document pour les archives
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Reçu généré le: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          <Text>Hôpital des Comores • Service Financier</Text>
          <Text>Statut: En attente d'exécution</Text>
          <Text>ID: {receipt.receiptId}</Text>
        </View>
      </Page>
    </Document>
  );
}