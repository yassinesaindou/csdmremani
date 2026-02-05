/* eslint-disable react/no-unescaped-entities */
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { TransactionWithDepartment } from '../types';
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
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1pt solid #e5e7eb',
    fontSize: 8,
    color: '#666',
  },
});

interface TransactionPDFProps {
  transaction: TransactionWithDepartment;
  createdByName: string;
}

export function TransactionPDF({ 
  transaction, 
  createdByName 
}: TransactionPDFProps) {
  const isIncome = transaction.type === 'income';
  const amount = transaction.amount || 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Fiche de Transaction Financière</Text>
          <Text style={styles.subtitle}>
            Hôpital des Comores • Transaction #{transaction.transactionId.substring(0, 8)}...
          </Text>
          <Text style={styles.subtitle}>
            Date: {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summary}>
          <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
            {isIncome ? '+' : '-'}{amount.toLocaleString('fr-FR')} KMF
          </Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5 }}>
            {isIncome ? 'RECETTE' : 'DÉPENSE'} • {transaction.department_name || 'GÉNÉRAL'}
          </Text>
          <Text style={{ fontSize: 9, color: '#666' }}>
            {transaction.reason || "Aucun motif spécifié"}
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DE LA TRANSACTION</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Type</Text>
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
              <Text style={styles.label}>Département</Text>
              <Text style={styles.value}>
                {transaction.department_name || 'Général (tous départements)'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Date d'enregistrement</Text>
              <Text style={styles.value}>
                {format(new Date(transaction.createdAt), "dd/MM/yyyy", { locale: fr })}
              </Text>
            </View>
          </View>
        </View>

        {/* Reason Section */}
        {transaction.reason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MOTIF DE LA TRANSACTION</Text>
            <View style={styles.reasonBox}>
              <Text style={{ fontSize: 10, lineHeight: 1.4 }}>
                {transaction.reason}
              </Text>
            </View>
          </View>
        )}

        {/* System Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS SYSTÈME</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Identifiant transaction</Text>
              <Text style={styles.value}>{transaction.transactionId}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Date de création</Text>
              <Text style={styles.value}>
                {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Enregistré par</Text>
              <Text style={styles.value}>{createdByName || 'Inconnu'}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Créé par: {createdByName} • {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          <Text>Document généré le: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          <Text>Hôpital des Comores • Service de Gestion Financière</Text>
        </View>
      </Page>
    </Document>
  );
}