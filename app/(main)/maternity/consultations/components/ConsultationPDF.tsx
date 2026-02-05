import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { MaternityConsultation } from '../types';
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
  badge: {
    backgroundColor: '#f3f4f6',
    padding: '2 6',
    borderRadius: 3,
    fontSize: 8,
    marginRight: 4,
  },
  treatmentBox: {
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

interface ConsultationPDFProps {
  consultation: MaternityConsultation;
  createdByName: string;
  updatedByName: string;
}

export function ConsultationPDF({ 
  consultation, 
  createdByName, 
  updatedByName 
}: ConsultationPDFProps) {
  const diagnostics = consultation.diagnostic
    ? consultation.diagnostic.split(",").map(d => d.trim()).filter(d => d)
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Fiche de Consultation - Maternité</Text>
          <Text style={styles.subtitle}>
            Hôpital des Comores • Consultation #{consultation.consultationId}
          </Text>
          <Text style={styles.subtitle}>
            Date: {format(new Date(consultation.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
          </Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DU PATIENT</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Nom complet</Text>
              <Text style={styles.value}>{consultation.name || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Âge</Text>
              <Text style={styles.value}>{consultation.age || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Sexe</Text>
              <Text style={styles.value}>
                {consultation.sex === 'M' ? 'Masculin' : 
                 consultation.sex === 'F' ? 'Féminin' : 'Non renseigné'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Origine</Text>
              <Text style={styles.value}>{consultation.origin || "Non renseigné"}</Text>
            </View>
            <View style={{ width: '100%' }}>
              <Text style={styles.label}>Adresse</Text>
              <Text style={styles.value}>{consultation.address || "Non renseignée"}</Text>
            </View>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATUT DE LA CONSULTATION</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Type de cas</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.badge}>
                  {consultation.isNewCase ? 'Nouveau cas' : 'Cas de suivi'}
                </Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Examen médical</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.badge}>
                  {consultation.seenByDoctor ? 'Vu par docteur' : 'Non vu'}
                </Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>État de grossesse</Text>
              <View style={{ flexDirection: 'row' }}>
                {consultation.isPregnant && (
                  <Text style={styles.badge}>Enceinte</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS MÉDICALES</Text>
          <View style={styles.grid}>
            <View style={{ width: '100%' }}>
              <Text style={styles.label}>Signe dominant</Text>
              <Text style={styles.value}>{consultation.dominantSign || "Aucun"}</Text>
            </View>
          </View>
          
          <Text style={{ ...styles.label, marginTop: 10 }}>Diagnostics</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
            {diagnostics.length > 0 ? (
              diagnostics.map((diag, index) => (
                <Text key={index} style={{ ...styles.badge, marginBottom: 4 }}>
                  {diag}
                </Text>
              ))
            ) : (
              <Text style={{ fontSize: 9, color: '#666' }}>Aucun diagnostic</Text>
            )}
          </View>
        </View>

        {/* Treatment */}
        {consultation.treatment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TRAITEMENT PRESCRIT</Text>
            <View style={styles.treatmentBox}>
              <Text style={{ fontSize: 10, lineHeight: 1.4 }}>
                {consultation.treatment}
              </Text>
            </View>
          </View>
        )}

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS ADDITIONNELLES</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Mutualiste</Text>
              <Text style={styles.value}>
                {consultation.mitualist !== 'undefined' ? consultation.mitualist : "Non spécifié"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Référence</Text>
              <Text style={styles.value}>{consultation.reference || "Non renseignée"}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Créé par: {createdByName} • {format(new Date(consultation.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          {consultation.updatedAt && (
            <Text>Dernière modification par: {updatedByName} • {format(new Date(consultation.updatedAt), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          )}
          <Text>Document généré le: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
        </View>
      </Page>
    </Document>
  );
}