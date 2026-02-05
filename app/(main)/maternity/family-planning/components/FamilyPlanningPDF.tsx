import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { FamilyPlanningRecord, CONTRACEPTIVE_METHODS } from '../types';
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
  methodCard: {
    backgroundColor: '#f9fafb',
    border: '1pt solid #e5e7eb',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  methodName: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  methodQuantity: {
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  methodType: {
    fontSize: 8,
    color: '#666',
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1pt solid #e5e7eb',
    fontSize: 8,
    color: '#666',
  },
});

interface FamilyPlanningPDFProps {
  record: FamilyPlanningRecord;
  createdByName: string;
  updatedByName: string;
}

export function FamilyPlanningPDF({ 
  record, 
  createdByName, 
  updatedByName 
}: FamilyPlanningPDFProps) {
  // Filter methods based on record type and quantity
  const methods = CONTRACEPTIVE_METHODS.filter(m => 
    m.category === (record.isNew ? 'new' : 'renewal') &&
    record[m.key as keyof FamilyPlanningRecord] !== null && 
    record[m.key as keyof FamilyPlanningRecord] !== 0
  );

  // Calculate total
  const total = methods.reduce((sum, method) => 
    sum + (record[method.key as keyof FamilyPlanningRecord] as number || 0), 0);

  const getMethodType = (key: string) => {
    if (key.includes('Condom')) return 'Préservatif';
    if (key.includes('IUD')) return 'DIU';
    if (key.includes('emergencyPill')) return 'Contraception d\'urgence';
    if (key.includes('implano') || key.includes('explano')) return 'Implant';
    if (key.includes('noristerat') || key.includes('microlut') || key.includes('microgynon') || key.includes('lofemanal')) 
      return 'Contraception hormonale';
    return 'Méthode contraceptive';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Fiche de Planning Familial - Maternité</Text>
          <Text style={styles.subtitle}>
            Hôpital des Comores • {record.isNew ? 'Nouvelle consultation' : 'Renouvellement'}
          </Text>
          <Text style={styles.subtitle}>
            Dossier: {record.fileNumber || 'Non renseigné'} • 
            Date: {format(new Date(record.createdAt), "dd/MM/yyyy", { locale: fr })}
          </Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DU PATIENT</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Numéro de dossier</Text>
              <Text style={styles.value}>{record.fileNumber || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Nom complet</Text>
              <Text style={styles.value}>{record.fullName || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Âge</Text>
              <Text style={styles.value}>{record.age || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Origine</Text>
              <Text style={styles.value}>{record.origin || "Non renseigné"}</Text>
            </View>
            <View style={{ width: '100%' }}>
              <Text style={styles.label}>Adresse</Text>
              <Text style={styles.value}>{record.address || "Non renseignée"}</Text>
            </View>
          </View>
        </View>

        {/* Consultation Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TYPE DE CONSULTATION</Text>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: record.isNew ? '#1d4ed8' : '#059669' }}>
              {record.isNew ? 'NOUVELLE CONSULTATION' : 'RENOUVELLEMENT'}
            </Text>
          </View>
        </View>

        {/* Contraceptive Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {record.isNew ? 'NOUVELLES MÉTHODES PRESCRITES' : 'MÉTHODES RENOUVELÉES'}
          </Text>
          
          {methods.length > 0 ? (
            <View>
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 9, color: '#666' }}>
                  Total des méthodes: {total}
                </Text>
              </View>
              
              {methods.map((method) => {
                const quantity = record[method.key as keyof FamilyPlanningRecord] as number;
                return (
                  <View key={method.key} style={styles.methodCard}>
                    <View style={styles.methodHeader}>
                      <Text style={styles.methodName}>{method.label}</Text>
                      <Text style={styles.methodQuantity}>{quantity}</Text>
                    </View>
                    <Text style={styles.methodType}>
                      {getMethodType(method.key)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ fontSize: 9, color: '#666', fontStyle: 'italic' }}>
              Aucune méthode {record.isNew ? 'prescrite' : 'renouvelée'}
            </Text>
          )}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RÉCAPITULATIF</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Type de consultation</Text>
              <Text style={styles.value}>{record.isNew ? "Nouvelle" : "Renouvellement"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Nombre total de méthodes</Text>
              <Text style={styles.value}>{total}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Date de consultation</Text>
              <Text style={styles.value}>
                {format(new Date(record.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Créé par: {createdByName} • {format(new Date(record.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          {record.updatedAt && (
            <Text>Dernière modification par: {updatedByName} • {format(new Date(record.updatedAt), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          )}
          <Text>Document généré le: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
        </View>
      </Page>
    </Document>
  );
}