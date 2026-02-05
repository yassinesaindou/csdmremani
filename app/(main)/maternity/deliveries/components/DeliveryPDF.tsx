/* eslint-disable react/no-unescaped-entities */
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { MaternityDelivery } from '../types';
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
  infoBox: {
    backgroundColor: '#f9fafb',
    border: '1pt solid #e5e7eb',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    padding: 10,
    margin: 5,
    borderRadius: 5,
    textAlign: 'center',
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1pt solid #e5e7eb',
    fontSize: 8,
    color: '#666',
  },
});

interface DeliveryPDFProps {
  delivery: MaternityDelivery;
  createdByName: string;
  updatedByName: string;
}

export function DeliveryPDF({ 
  delivery, 
  createdByName, 
  updatedByName 
}: DeliveryPDFProps) {
  
  const getDeliveryType = () => {
    if (delivery.delivery_eutocic) {
      return { label: "Eutocique", color: '#d1fae5', textColor: '#065f46' };
    }
    if (delivery.delivery_dystocic) {
      return { label: "Dystocique", color: '#fef3c7', textColor: '#92400e' };
    }
    if (delivery.delivery_transfert) {
      return { label: "Transfert", color: '#dbeafe', textColor: '#1e40af' };
    }
    return { label: "Non spécifié", color: '#f3f4f6', textColor: '#374151' };
  };

  const deliveryType = getDeliveryType();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Fiche d'Accouchement - Maternité</Text>
          <Text style={styles.subtitle}>
            Hôpital des Comores • 
            {delivery.fileNumber ? ` Dossier #${delivery.fileNumber}` : ` ID: ${delivery.deliveryId.slice(0, 8)}`}
          </Text>
          <Text style={styles.subtitle}>
            Date d'accouchement: {delivery.delivery_dateTime ? 
              format(new Date(delivery.delivery_dateTime), "dd/MM/yyyy HH:mm", { locale: fr }) : 
              "Non spécifiée"}
          </Text>
        </View>

        {/* Mother Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DE LA MÈRE</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Numéro de dossier</Text>
              <Text style={styles.value}>{delivery.fileNumber || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Nom complet</Text>
              <Text style={styles.value}>{delivery.fullName || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Origine</Text>
              <Text style={styles.value}>{delivery.origin || "Non renseigné"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Statut</Text>
              <View style={{ flexDirection: 'row' }}>
                {delivery.isMotherDead ? (
                  <Text style={{ ...styles.badge, backgroundColor: '#fee2e2', color: '#991b1b' }}>
                    MÈRE DÉCÉDÉE
                  </Text>
                ) : (
                  <Text style={{ ...styles.badge, backgroundColor: '#d1fae5', color: '#065f46' }}>
                    MÈRE VIVANTE
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          <Text style={{ ...styles.label, marginTop: 10 }}>Adresse</Text>
          <Text style={styles.value}>{delivery.address || "Non renseignée"}</Text>
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS DE L'ACCOUCHEMENT</Text>
          
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Début du travail</Text>
              <Text style={styles.value}>
                {delivery.workTime ? 
                  format(new Date(delivery.workTime), "dd/MM/yyyy HH:mm", { locale: fr }) : 
                  "Non renseigné"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Heure d'accouchement</Text>
              <Text style={styles.value}>
                {delivery.delivery_dateTime ? 
                  format(new Date(delivery.delivery_dateTime), "dd/MM/yyyy HH:mm", { locale: fr }) : 
                  "Non renseigné"}
              </Text>
            </View>
          </View>

          <Text style={{ ...styles.label, marginTop: 10 }}>Type d'accouchement</Text>
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <Text style={{ 
              ...styles.statusBadge, 
              backgroundColor: deliveryType.color, 
              color: deliveryType.textColor 
            }}>
              {deliveryType.label}
            </Text>
          </View>

          {delivery.delivery_eutocic && (
            <View style={styles.infoBox}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 3 }}>Eutocique:</Text>
              <Text style={{ fontSize: 10 }}>{delivery.delivery_eutocic}</Text>
            </View>
          )}

          {delivery.delivery_dystocic && (
            <View style={styles.infoBox}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 3 }}>Dystocique:</Text>
              <Text style={{ fontSize: 10 }}>{delivery.delivery_dystocic}</Text>
            </View>
          )}

          {delivery.delivery_transfert && (
            <View style={styles.infoBox}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 3 }}>Transfert:</Text>
              <Text style={{ fontSize: 10 }}>{delivery.delivery_transfert}</Text>
            </View>
          )}
        </View>

        {/* Newborn Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATISTIQUES DU NOUVEAU-NÉ</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: '#d1fae5' }]}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#065f46' }}>
                {delivery.newBorn_living || 0}
              </Text>
              <Text style={{ fontSize: 8, color: '#065f46' }}>Nouveau-né(s) vivant(s)</Text>
            </View>
            
            <View style={[styles.statItem, { backgroundColor: '#fee2e2' }]}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#991b1b' }}>
                {delivery.numberOfDeaths || 0}
              </Text>
              <Text style={{ fontSize: 8, color: '#991b1b' }}>Total décès</Text>
            </View>
            
            {delivery.weight && (
              <View style={[styles.statItem, { backgroundColor: '#dbeafe' }]}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e40af' }}>
                  {delivery.weight} kg
                </Text>
                <Text style={{ fontSize: 8, color: '#1e40af' }}>Poids à la naissance</Text>
              </View>
            )}
          </View>

          {/* Death Details */}
          <Text style={{ ...styles.label, marginTop: 10 }}>Détails des décès:</Text>
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <Text style={{ 
              ...styles.badge, 
              backgroundColor: '#fee2e2', 
              color: '#991b1b',
              marginRight: 10
            }}>
              Avant 24h: {delivery.numberOfDeaths_before24hours || 0}
            </Text>
            <Text style={{ 
              ...styles.badge, 
              backgroundColor: '#fee2e2', 
              color: '#991b1b'
            }}>
              Avant 7 jours: {delivery.numberOfDeaths_before7Days || 0}
            </Text>
          </View>

          {delivery.newBorn_lessThan2point5kg !== null && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Nouveau-né(s) de poids &lt; 2.5 kg:</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                {delivery.newBorn_lessThan2point5kg}
              </Text>
            </View>
          )}
        </View>

        {/* Follow-up Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUIVI ET OBSERVATIONS</Text>
          
          {delivery.transfer && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.label}>Transfert vers:</Text>
              <Text style={styles.value}>{delivery.transfer}</Text>
            </View>
          )}

          {delivery.leavingDate && (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.label}>Date de sortie:</Text>
              <Text style={styles.value}>
                {format(new Date(delivery.leavingDate), "dd/MM/yyyy HH:mm", { locale: fr })}
              </Text>
            </View>
          )}

          {delivery.observations && (
            <View style={styles.infoBox}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 3 }}>Observations:</Text>
              <Text style={{ fontSize: 10 }}>{delivery.observations}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Enregistré par: {createdByName} • {format(new Date(delivery.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          {delivery.updatedAt && (
            <Text>Dernière modification par: {updatedByName} • {format(new Date(delivery.updatedAt), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
          )}
          <Text>Document généré le: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}</Text>
        </View>
      </Page>
    </Document>
  );
}