import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { MaternityAppointment, getDisplayStatus, getStatusConfig } from '../types';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// Helper function to convert UTC to Comoros time (GMT+3)
function convertUTCToComorosTime(utcDate: Date | string): Date {
  const date = new Date(utcDate);
  // Add 3 hours for Comoros timezone (GMT+3)
  return new Date(date.getTime() + (3 * 60 * 60 * 1000));
}

// Helper function to format time in Comoros timezone
function formatComorosTime(date: Date | string): string {
  const comorosDate = convertUTCToComorosTime(date);
  const hours = comorosDate.getHours().toString().padStart(2, '0');
  const minutes = comorosDate.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Helper function to format date in Comoros timezone
function formatComorosDate(date: Date | string): string {
  const comorosDate = convertUTCToComorosTime(date);
  const day = comorosDate.getDate().toString().padStart(2, '0');
  const month = (comorosDate.getMonth() + 1).toString().padStart(2, '0');
  const year = comorosDate.getFullYear();
  return `${day}/${month}/${year}`;
}

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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appointmentCard: {
    backgroundColor: '#f9fafb',
    border: '1pt solid #e5e7eb',
    padding: 12,
    borderRadius: 4,
    marginBottom: 10,
  },
  dateTimeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dateBox: {
    backgroundColor: '#dbeafe',
    padding: 8,
    borderRadius: 3,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  timeBox: {
    backgroundColor: '#d1fae5',
    padding: 8,
    borderRadius: 3,
    alignItems: 'center',
    flex: 1,
  },
  timezoneBadge: {
    backgroundColor: '#f3f4f6',
    padding: '2 6',
    borderRadius: 2,
    fontSize: 7,
    marginLeft: 4,
  },
  missedWarning: {
    backgroundColor: '#fef3c7',
    border: '1pt solid #fbbf24',
    padding: 8,
    borderRadius: 3,
    marginTop: 10,
  },
  technicalInfo: {
    backgroundColor: '#f9fafb',
    border: '1pt dashed #d1d5db',
    padding: 10,
    borderRadius: 3,
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

interface AppointmentPDFProps {
  appointment: MaternityAppointment;
  createdByName: string;
  updatedByName: string;
}

export function AppointmentPDF({ 
  appointment, 
  createdByName, 
  updatedByName 
}: AppointmentPDFProps) {
  const displayStatus = getDisplayStatus(appointment);
  const statusConfig = getStatusConfig(displayStatus);
  const appointmentDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : null;
  const now = new Date();
  
  // Convert to Comoros time for display
  const appointmentComorosDate = appointmentDate 
    ? convertUTCToComorosTime(appointmentDate)
    : null;
  
  const nowComoros = convertUTCToComorosTime(now);
  
  // Calculate days missed if applicable
  let daysMissed = 0;
  if (displayStatus === 'missed' && appointmentComorosDate) {
    daysMissed = differenceInDays(nowComoros, appointmentComorosDate);
  }

  // Calculate days difference
  let daysDifference = 0;
  if (appointmentComorosDate) {
    const isPast = appointmentComorosDate < nowComoros;
    daysDifference = isPast 
      ? differenceInDays(nowComoros, appointmentComorosDate)
      : differenceInDays(appointmentComorosDate, nowComoros);
  }

  const getStatusColor = () => {
    switch (displayStatus) {
      case 'scheduled': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'completed': return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'missed': return { backgroundColor: '#fef3c7', color: '#92400e' };
      default: return { backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  const statusStyle = getStatusColor();

  // Format dates
  const createdAt = new Date(appointment.createdAt);
  const updatedAt = appointment.updatedAt ? new Date(appointment.updatedAt) : null;
  const generatedAt = new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Fiche de Rendez-vous - Maternité</Text>
          <Text style={styles.subtitle}>
            Hôpital des Comores • Département de Maternité
          </Text>
          <Text style={styles.subtitle}>
            Rendez-vous #{appointment.appointmentId} • 
            Généré le {formatComorosDate(generatedAt)} {formatComorosTime(generatedAt)} (GMT+3)
          </Text>
        </View>

        {/* Status Banner */}
        <View style={styles.section}>
          <View style={[styles.statusBadge, statusStyle]}>
            <Text style={{ color: statusStyle.color }}>
              {statusConfig?.label || 'Statut inconnu'}
              {displayStatus === 'missed' && daysMissed > 0 && ` (${daysMissed}j)`}
            </Text>
          </View>
          {displayStatus === 'missed' && (
            <View style={styles.missedWarning}>
              <Text style={{ fontSize: 9, color: '#92400e' }}>
                ⚠️ Ce rendez-vous a été manqué il y a {daysMissed} jour{daysMissed > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Informations du Patient */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DU PATIENT</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Nom complet</Text>
              <Text style={styles.value}>{appointment.patientName || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Téléphone</Text>
              <Text style={styles.value}>{appointment.patientPhoneNumber || "Non renseigné"}</Text>
            </View>
            <View style={{ width: '100%' }}>
              <Text style={styles.label}>Adresse</Text>
              <Text style={styles.value}>{appointment.patientAddress || "Non renseignée"}</Text>
            </View>
          </View>
        </View>

        {/* Détails du Rendez-vous */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DÉTAILS DU RENDEZ-VOUS</Text>
          
          {appointmentComorosDate ? (
            <>
              <View style={styles.appointmentCard}>
                <View style={styles.dateTimeDisplay}>
                  <View style={styles.dateBox}>
                    <Text style={{ fontSize: 9, color: '#1e40af' }}>DATE</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                      {formatComorosDate(appointmentDate!)}
                    </Text>
                    <Text style={{ fontSize: 8, color: '#4b5563', marginTop: 2 }}>
                      {format(appointmentComorosDate, "EEEE", { locale: fr })}
                    </Text>
                  </View>
                  <View style={styles.timeBox}>
                    <Text style={{ fontSize: 9, color: '#065f46' }}>HEURE</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                      {formatComorosTime(appointmentDate!)}
                    </Text>
                    <Text style={{ fontSize: 7, color: '#065f46', marginTop: 2 }}>
                      GMT+3
                    </Text>
                  </View>
                </View>
                
                {/* Time information */}
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 9, color: '#4b5563' }}>
                    {appointmentComorosDate < nowComoros 
                      ? `Ce rendez-vous a eu lieu il y a ${daysDifference} jour${daysDifference > 1 ? 's' : ''}`
                      : `Ce rendez-vous est dans ${daysDifference} jour${daysDifference > 1 ? 's' : ''}`
                    }
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={{ fontSize: 9, color: '#666', fontStyle: 'italic' }}>
              Aucune date de rendez-vous définie
            </Text>
          )}

          <Text style={{ ...styles.label, marginTop: 10 }}>Motif du rendez-vous</Text>
          <View style={{ backgroundColor: '#f9fafb', padding: 8, borderRadius: 3, marginTop: 2 }}>
            <Text style={{ fontSize: 9, lineHeight: 1.4 }}>
              {appointment.appointmentReason || "Aucun motif spécifié"}
            </Text>
          </View>
        </View>

        {/* Informations du Statut */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DU STATUT</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Statut stocké en base</Text>
              <Text style={styles.value}>
                {appointment.status === 'scheduled' ? 'Programmé' : 
                 appointment.status === 'completed' ? 'Terminé' : 
                 appointment.status === 'cancelled' ? 'Annulé' : '—'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Statut affiché (calculé)</Text>
              <Text style={[styles.value, { color: statusStyle.color }]}>
                {statusConfig?.label}
                {displayStatus === 'missed' && daysMissed > 0 && ` (${daysMissed}j)`}
              </Text>
            </View>
          </View>
          {displayStatus === 'missed' && (
            <Text style={{ fontSize: 8, color: '#92400e', marginTop: 5 }}>
              * Statut calculé: Le rendez-vous était programmé mais la date est passée depuis plus de 24h sans être marqué comme terminé ou annulé.
            </Text>
          )}
        </View>

        {/* Informations Techniques (Fuseau Horaire) */}
        {appointmentDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMATIONS TECHNIQUES</Text>
            <View style={styles.technicalInfo}>
              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Date/heure UTC (stockée)</Text>
                  <Text style={styles.value}>
                    {format(appointmentDate, "dd/MM/yyyy HH:mm")}
                  </Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Date/heure Comoros (affichée)</Text>
                  <Text style={styles.value}>
                    {formatComorosDate(appointmentDate)} {formatComorosTime(appointmentDate)} GMT+3
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 5 }}>
                Note: Le système stocke les dates en UTC et les convertit en heure Comoros (GMT+3) pour l'affichage.
              </Text>
            </View>
          </View>
        )}

        {/* Chronologie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CHRONOLOGIE</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Créé le (UTC)</Text>
              <Text style={styles.value}>
                {format(createdAt, "dd/MM/yyyy HH:mm")}
              </Text>
              <Text style={{ fontSize: 8, color: '#666' }}>
                Par: {createdByName}
              </Text>
            </View>
            
            {updatedAt && (
              <View style={styles.gridItem}>
                <Text style={styles.label}>Dernière modification (UTC)</Text>
                <Text style={styles.value}>
                  {format(updatedAt, "dd/MM/yyyy HH:mm")}
                </Text>
                <Text style={{ fontSize: 8, color: '#666' }}>
                  Par: {updatedByName}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Document officiel - Hôpital des Comores</Text>
          <Text>Département de Maternité • Rendez-vous #{appointment.appointmentId}</Text>
          <Text>Document généré le: {formatComorosDate(generatedAt)} {formatComorosTime(generatedAt)} (GMT+3)</Text>
          <Text>Fuseau horaire: Comoros (GMT+3) • Les heures affichées sont en heure locale Comoros</Text>
        </View>
      </Page>
    </Document>
  );
}