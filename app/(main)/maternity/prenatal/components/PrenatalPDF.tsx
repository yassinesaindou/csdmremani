import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { PrenatalRecord, CPN_VISITS, ANEMY_OPTIONS, IRON_FOLIC_OPTIONS } from '../types';
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
  cpnCard: {
    backgroundColor: '#f9fafb',
    border: '1pt solid #e5e7eb',
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  cpnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cpnName: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  cpnStatus: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  cpnDate: {
    fontSize: 8,
    color: '#666',
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  doseCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  doseCompleted: {
    backgroundColor: '#10b981',
  },
  dosePending: {
    backgroundColor: '#d1d5db',
  },
  doseText: {
    fontSize: 9,
  },
  observationsBox: {
    backgroundColor: '#f9fafb',
    border: '1pt solid #e5e7eb',
    padding: 10,
    borderRadius: 4,
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

interface PrenatalPDFProps {
  record: PrenatalRecord;
  createdByName: string;
  updatedByName: string;
}

export function PrenatalPDF({ 
  record, 
  createdByName, 
  updatedByName 
}: PrenatalPDFProps) {
  // Calculate completed CPN visits
  const completedCPNVisits = CPN_VISITS.filter(
    visit => record[visit.key as keyof PrenatalRecord] !== null
  ).length;

  // Calculate completed iron doses
  const completedIronDoses = [
    record.iron_folicAcidDose1,
    record.iron_folicAcidDose2,
    record.iron_folicAcidDose3,
  ].filter(Boolean).length;

  // Calculate completed sulfoxadin doses
  const completedSulfoxadinDoses = [
    record.sulfoxadin_pyrinDose1,
    record.sulfoxadin_pyrinDose2,
    record.sulfoxadin_pyrinDose3,
  ].filter(Boolean).length;

  const anemyLabel = ANEMY_OPTIONS.find(a => a.value === record.anemy)?.label || record.anemy;
  const ironFolicLabel = IRON_FOLIC_OPTIONS.find(i => i.value === record.iron_folicAcid)?.label || record.iron_folicAcid;

  const getCPNDescription = (key: string) => {
    switch (key) {
      case 'visitCPN1': return 'Première consultation - Évaluation initiale';
      case 'visitCPN2': return 'Deuxième consultation - Suivi de la grossesse';
      case 'visitCPN3': return 'Troisième consultation - Préparation à l\'accouchement';
      case 'visitCPN4': return 'Quatrième consultation - Dernier contrôle prénatal';
      default: return '';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Fiche de Consultation Prénatale - Maternité</Text>
          <Text style={styles.subtitle}>
            Hôpital des Comores • Programme CPN
          </Text>
          <Text style={styles.subtitle}>
            Dossier: {record.fileNumber || 'Non renseigné'} • 
            Date: {format(new Date(record.createdAt), "dd/MM/yyyy", { locale: fr })}
          </Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DE LA PATIENTE</Text>
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
              <Text style={styles.label}>Âge de la patiente</Text>
              <Text style={styles.value}>{record.patientAge || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Âge de la grossesse</Text>
              <Text style={styles.value}>
                {record.pregnancyAge ? `${record.pregnancyAge} semaines` : "Non renseigné"}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROGRESSION</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <View>
              <Text style={styles.label}>Visites CPN</Text>
              <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                {completedCPNVisits}/4 ({Math.round((completedCPNVisits / 4) * 100)}%)
              </Text>
            </View>
            <View>
              <Text style={styles.label}>Fer + Acide Folique</Text>
              <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                {completedIronDoses}/3 doses
              </Text>
            </View>
            <View>
              <Text style={styles.label}>Sulfadoxine-Pyriméthamine</Text>
              <Text style={{ ...styles.value, fontWeight: 'bold' }}>
                {completedSulfoxadinDoses}/3 doses
              </Text>
            </View>
          </View>
        </View>

        {/* CPN Visits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONSULTATIONS PRÉNATALES (CPN)</Text>
          
          {CPN_VISITS.map((visit) => {
            const visitDate = record[visit.key as keyof PrenatalRecord] as string;
            const isCompleted = !!visitDate;
            
            return (
              <View key={visit.key} style={styles.cpnCard}>
                <View style={styles.cpnHeader}>
                  <Text style={styles.cpnName}>{visit.label}</Text>
                  <View style={{
                    ...styles.cpnStatus,
                    backgroundColor: isCompleted ? '#d1fae5' : '#f3f4f6',
                    color: isCompleted ? '#065f46' : '#6b7280'
                  }}>
                    <Text>{isCompleted ? 'Complétée' : 'En attente'}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 8, color: '#666', marginBottom: 3 }}>
                  {getCPNDescription(visit.key)}
                </Text>
                {visitDate && (
                  <Text style={styles.cpnDate}>
                    Date: {format(new Date(visitDate), "dd/MM/yyyy", { locale: fr })}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Medications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRAITEMENTS ET MÉDICATIONS</Text>
          
          {/* Iron/Folic Acid */}
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Fer + Acide Folique</Text>
            <View>
              {[1, 2, 3].map((doseNum) => {
                const completed = [
                  record.iron_folicAcidDose1,
                  record.iron_folicAcidDose2,
                  record.iron_folicAcidDose3,
                ][doseNum - 1];
                
                return (
                  <View key={doseNum} style={styles.doseRow}>
                    <View style={[styles.doseCircle, completed ? styles.doseCompleted : styles.dosePending]} />
                    <Text style={styles.doseText}>
                      Dose {doseNum}: {completed ? 'Administrée' : 'Non administrée'}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={{ fontSize: 9, color: '#666', marginTop: 5 }}>
              Statut: {ironFolicLabel || 'Non spécifié'}
            </Text>
          </View>

          {/* Sulfoxadin/Pyrin */}
          <View>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>Sulfadoxine-Pyriméthamine</Text>
            <View>
              {[1, 2, 3].map((doseNum) => {
                const completed = [
                  record.sulfoxadin_pyrinDose1,
                  record.sulfoxadin_pyrinDose2,
                  record.sulfoxadin_pyrinDose3,
                ][doseNum - 1];
                
                return (
                  <View key={doseNum} style={styles.doseRow}>
                    <View style={[styles.doseCircle, completed ? styles.doseCompleted : styles.dosePending]} />
                    <Text style={styles.doseText}>
                      Dose {doseNum}: {completed ? 'Administrée' : 'Non administrée'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Health Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ÉTAT DE SANTÉ</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Anémie</Text>
              <Text style={styles.value}>{anemyLabel || "Non évalué"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Traitement Fer + Acide Folique</Text>
              <Text style={styles.value}>{ironFolicLabel || "Non spécifié"}</Text>
            </View>
          </View>
        </View>

        {/* Observations */}
        {record.obeservations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OBSERVATIONS CLINIQUES</Text>
            <View style={styles.observationsBox}>
              <Text style={{ fontSize: 9, lineHeight: 1.4 }}>
                {record.obeservations}
              </Text>
            </View>
          </View>
        )}

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