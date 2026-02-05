/* eslint-disable react/no-unescaped-entities */
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { MaternityHospitalization } from '../types';
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
    marginBottom: 4,
  },
  emergencyBadge: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '2 6',
    borderRadius: 3,
    fontSize: 8,
  },
  statusBadge: {
    padding: '2 6',
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
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

interface HospitalizationPDFProps {
  hospitalization: MaternityHospitalization;
  createdByName: string;
  updatedByName: string;
}

export function HospitalizationPDF({ 
  hospitalization, 
  createdByName, 
  updatedByName 
}: HospitalizationPDFProps) {
  
  const getLeaveStatus = () => {
    if (hospitalization.leave_authorized) {
      return { label: "Sortie autorisée", color: '#d1fae5', textColor: '#065f46' };
    }
    if (hospitalization.leave_evaded) {
      return { label: "Sortie par évasion", color: '#fef3c7', textColor: '#92400e' };
    }
    if (hospitalization.leave_transfered) {
      return { label: "Sortie par transfert", color: '#dbeafe', textColor: '#1e40af' };
    }
    if (hospitalization.leave_diedBefore48h) {
      return { label: "Décès avant 48h", color: '#fecaca', textColor: '#991b1b' };
    }
    if (hospitalization.leave_diedAfter48h) {
      return { label: "Décès après 48h", color: '#fecaca', textColor: '#991b1b' };
    }
    return { label: "En cours d'hospitalisation", color: '#f3f4f6', textColor: '#374151' };
  };

  const leaveStatus = getLeaveStatus();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Fiche d'Hospitalisation - Maternité</Text>
          <Text style={styles.subtitle}>
            Hôpital des Comores • ID: {hospitalization.hospitalizationId.slice(0, 8)}
          </Text>
          <Text style={styles.subtitle}>
            Date d'admission: {format(new Date(hospitalization.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
          </Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DU PATIENT</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Nom complet</Text>
              <Text style={styles.value}>{hospitalization.fullName || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Âge</Text>
              <Text style={styles.value}>{hospitalization.age || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Sexe</Text>
              <Text style={styles.value}>
                {hospitalization.sex === 'M' ? 'Masculin' : 
                 hospitalization.sex === 'F' ? 'Féminin' : 'Non renseigné'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Origine</Text>
              <Text style={styles.value}>{hospitalization.origin || "Non renseigné"}</Text>
            </View>
          </View>
          
          {/* Status Badges */}
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            {hospitalization.isEmergency && (
              <View style={{ marginRight: 8 }}>
                <Text style={styles.emergencyBadge}>URGENCE</Text>
              </View>
            )}
            {hospitalization.isPregnant && (
              <View style={{ marginRight: 8 }}>
                <Text style={{ ...styles.badge, backgroundColor: '#fce7f3', color: '#9d174d' }}>
                  ENCEINTE
                </Text>
              </View>
            )}
            <View>
              <Text style={{ 
                ...styles.statusBadge, 
                backgroundColor: leaveStatus.color, 
                color: leaveStatus.textColor 
              }}>
                {leaveStatus.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS MÉDICALES</Text>
          
          <Text style={{ ...styles.label, marginBottom: 5 }}>Diagnostic d'entrée</Text>
          <View style={styles.treatmentBox}>
            <Text style={{ fontSize: 10, lineHeight: 1.4 }}>
              {hospitalization.entryDiagnostic || "Non renseigné"}
            </Text>
          </View>

          <Text style={{ ...styles.label, marginTop: 10, marginBottom: 5 }}>Diagnostic de sortie</Text>
          <View style={styles.treatmentBox}>
            <Text style={{ fontSize: 10, lineHeight: 1.4 }}>
              {hospitalization.leavingDiagnostic || "Non renseigné"}
            </Text>
          </View>
        </View>

        {/* Leave Status Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DÉTAILS DU STATUT DE SORTIE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
            <Text style={{
              ...styles.badge,
              backgroundColor: hospitalization.leave_authorized ? '#d1fae5' : '#f3f4f6',
              color: hospitalization.leave_authorized ? '#065f46' : '#6b7280',
              fontWeight: hospitalization.leave_authorized ? 'bold' : 'normal'
            }}>
              Sortie autorisée
            </Text>
            <Text style={{
              ...styles.badge,
              backgroundColor: hospitalization.leave_evaded ? '#fef3c7' : '#f3f4f6',
              color: hospitalization.leave_evaded ? '#92400e' : '#6b7280',
              fontWeight: hospitalization.leave_evaded ? 'bold' : 'normal'
            }}>
              Sortie par évasion
            </Text>
            <Text style={{
              ...styles.badge,
              backgroundColor: hospitalization.leave_transfered ? '#dbeafe' : '#f3f4f6',
              color: hospitalization.leave_transfered ? '#1e40af' : '#6b7280',
              fontWeight: hospitalization.leave_transfered ? 'bold' : 'normal'
            }}>
              Sortie par transfert
            </Text>
            <Text style={{
              ...styles.badge,
              backgroundColor: hospitalization.leave_diedBefore48h ? '#fecaca' : '#f3f4f6',
              color: hospitalization.leave_diedBefore48h ? '#991b1b' : '#6b7280',
              fontWeight: hospitalization.leave_diedBefore48h ? 'bold' : 'normal'
            }}>
              Décès avant 48h
            </Text>
            <Text style={{
              ...styles.badge,
              backgroundColor: hospitalization.leave_diedAfter48h ? '#fecaca' : '#f3f4f6',
              color: hospitalization.leave_diedAfter48h ? '#991b1b' : '#6b7280',
              fontWeight: hospitalization.leave_diedAfter48h ? 'bold' : 'normal'
            }}>
              Décès après 48h
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Enregistré par: {createdByName} • {format(new Date(hospitalization.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          {hospitalization.updatedAt && (
            <Text>Dernière modification par: {updatedByName} • {format(new Date(hospitalization.updatedAt), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          )}
          <Text>Document généré le: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
        </View>
      </Page>
    </Document>
  );
}