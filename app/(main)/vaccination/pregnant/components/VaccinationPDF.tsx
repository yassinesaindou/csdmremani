import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { VaccinationFemmeEnceinte, VACCINES } from '../types';
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
    color: '#7c3aed',
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
    color: '#5b21b6',
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
    border: '0.5pt solid #d1d5db',
  },
  vaccineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  vaccineItem: {
    width: '33.33%',
    marginBottom: 8,
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1pt solid #e5e7eb',
    fontSize: 8,
    color: '#666',
  },
  noteBox: {
    backgroundColor: '#f5f3ff',
    border: '0.5pt solid #ddd6fe',
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
  },
});

interface VaccinationPDFProps {
  vaccination: VaccinationFemmeEnceinte;
  createdByName: string;
}

export function VaccinationPDF({ 
  vaccination, 
  createdByName 
}: VaccinationPDFProps) {
  const getVaccineStatusText = (status: string | null) => {
    switch (status) {
      case 'fait': return '✓ Fait';
      case 'non_fait': return '✗ Non fait';
      case 'contre_indication': return '⚠ Contre-indication';
      default: return '— Non renseigné';
    }
  };

  const vaccines = VACCINES.map(vaccine => ({
    label: vaccine.label,
    status: vaccination[vaccine.key as keyof VaccinationFemmeEnceinte] as string | null
  }));

  const completedVaccines = vaccines.filter(v => v.status === 'fait').length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Carnet de Vaccination - Femme Enceinte</Text>
          <Text style={styles.subtitle}>
            Hôpital des Comores • Vaccination #{vaccination.id}
          </Text>
          <Text style={styles.subtitle}>
            Date: {format(new Date(vaccination.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
          </Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DE LA PATIENTE</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Nom complet</Text>
              <Text style={styles.value}>{vaccination.name || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Mois de grossesse</Text>
              <Text style={styles.value}>
                {vaccination.month ? `${vaccination.month}ème mois` : "Non renseigné"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Origine</Text>
              <Text style={styles.value}>{vaccination.origin || "Non renseigné"}</Text>
            </View>
            <View style={{ width: '100%' }}>
              <Text style={styles.label}>Adresse</Text>
              <Text style={styles.value}>{vaccination.address || "Non renseignée"}</Text>
            </View>
          </View>
        </View>

        {/* Strategy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STRATÉGIE DE VACCINATION</Text>
          <View style={styles.grid}>
            <View style={{ width: '100%' }}>
              <Text style={styles.value}>
                {vaccination.strategy ? 
                  vaccination.strategy === 'fixe' ? 'Poste Fixe' :
                  vaccination.strategy === 'avance' ? 'Poste Avancé' :
                  vaccination.strategy === 'mobile' ? 'Équipe Mobile' :
                  vaccination.strategy.replace('_', ' ') 
                : "Non spécifiée"}
              </Text>
            </View>
          </View>
        </View>

        {/* Vaccines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VACCINS RECOMMANDÉS ({completedVaccines}/6 complétés)</Text>
          <View style={styles.vaccineGrid}>
            {vaccines.map((vaccine, index) => (
              <View key={index} style={styles.vaccineItem}>
                <Text style={styles.label}>{vaccine.label}</Text>
                <Text style={styles.value}>
                  {getVaccineStatusText(vaccine.status)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RÉSUMÉ DU PROGRÈS</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Vaccins complétés</Text>
              <Text style={styles.value}>{completedVaccines}/6</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Pourcentage</Text>
              <Text style={styles.value}>{Math.round((completedVaccines / 6) * 100)}%</Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECOMMANDATIONS</Text>
          <View style={styles.noteBox}>
            <Text style={{ fontSize: 9, color: '#5b21b6' }}>
              • Les vaccins TD (Tétanos-Diphtérie) protègent contre le tétanos néonatal
            </Text>
            <Text style={{ fontSize: 9, color: '#5b21b6', marginTop: 4 }}>
              • La vaccination COVID-19 (FCV) réduit les risques de complications
            </Text>
            <Text style={{ fontSize: 9, color: '#5b21b6', marginTop: 4 }}>
              • Administration recommandée entre le 4ème et 8ème mois de grossesse
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Créé par: {createdByName} • {format(new Date(vaccination.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          <Text>Document généré le: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
        </View>
      </Page>
    </Document>
  );
}