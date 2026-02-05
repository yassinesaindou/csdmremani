/* eslint-disable react/no-unescaped-entities */
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { VaccinationEnfant, VACCINES } from '../types';
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
    color: '#059669',
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
    color: '#065f46',
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
});

interface VaccinationPDFProps {
  vaccination: VaccinationEnfant;
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
    status: vaccination[vaccine.key as keyof VaccinationEnfant] as string | null
  }));

  const completedVaccines = vaccines.filter(v => v.status === 'fait').length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Carnet de Vaccination - Enfant</Text>
          <Text style={styles.subtitle}>
            Hôpital des Comores • Vaccination #{vaccination.id}
          </Text>
          <Text style={styles.subtitle}>
            Date: {format(new Date(vaccination.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
          </Text>
        </View>

        {/* Child Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DE L'ENFANT</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Nom complet</Text>
              <Text style={styles.value}>{vaccination.name || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Âge</Text>
              <Text style={styles.value}>
                {vaccination.age ? `${vaccination.age} mois` : "Non renseigné"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Sexe</Text>
              <Text style={styles.value}>
                {vaccination.sex === 'M' ? 'Masculin' : 
                 vaccination.sex === 'F' ? 'Féminin' : 'Non renseigné'}
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

        {/* Physical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS PHYSIQUES</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Poids</Text>
              <Text style={styles.value}>
                {vaccination.weight ? `${vaccination.weight} kg` : "Non renseigné"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Taille</Text>
              <Text style={styles.value}>
                {vaccination.height ? `${vaccination.height} cm` : "Non renseigné"}
              </Text>
            </View>
          </View>
        </View>

        {/* Medication Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MÉDICAMENTS ADMINISTRÉS</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Vitamine A</Text>
              <Text style={styles.value}>
                {vaccination.receivedVitamineA ? '✓ Administrée' : '✗ Non administrée'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>AlBendazole</Text>
              <Text style={styles.value}>
                {vaccination.receivedAlBendazole ? '✓ Administré' : '✗ Non administré'}
              </Text>
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
          <Text style={styles.sectionTitle}>VACCINS ({completedVaccines}/12 complétés)</Text>
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
              <Text style={styles.value}>{completedVaccines}/12</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Pourcentage</Text>
              <Text style={styles.value}>{Math.round((completedVaccines / 12) * 100)}%</Text>
            </View>
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