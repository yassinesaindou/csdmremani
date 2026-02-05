export interface MaternityAppointment {
  appointmentId: number;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  appointmentReason: string | null;
  appointmentDate: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | null; // Only these stored in DB
  patientName: string | null;
  patientAddress: string | null;
  patientPhoneNumber: string | null;
}

// Statuses stored in DB
export const DB_APPOINTMENT_STATUSES = [
  { value: 'scheduled', label: 'Programmé', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Terminé', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-rose-100 text-rose-800' },
] as const;

// Statuses displayed (including calculated "missed")
export const DISPLAY_APPOINTMENT_STATUSES = [
  { value: 'scheduled', label: 'Programmé', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Terminé', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-rose-100 text-rose-800' },
  { value: 'missed', label: 'Manqué', color: 'bg-amber-100 text-amber-800' },
] as const;

export type DbAppointmentStatus = 'scheduled' | 'completed' | 'cancelled';
export type DisplayAppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed';

// Helper function to determine displayed status
export function getDisplayStatus(appointment: MaternityAppointment): DisplayAppointmentStatus {
  const dbStatus = appointment.status;
  const appointmentDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : null;
  const now = new Date();
  
  if (dbStatus === 'cancelled' || dbStatus === 'completed') {
    return dbStatus;
  }
  
  // If scheduled but appointment date has passed more than 1 day ago
  if (appointmentDate && appointmentDate < now) {
    const daysPassed = Math.floor((now.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysPassed > 1) { // Consider it missed if more than 1 day passed
      return 'missed';
    }
  }
  
  return 'scheduled';
}

// Get status config for display
export function getStatusConfig(status: DisplayAppointmentStatus) {
  return DISPLAY_APPOINTMENT_STATUSES.find(s => s.value === status) || 
    DISPLAY_APPOINTMENT_STATUSES[0];
}

export const APPOINTMENT_FILTERS = [
  { value: 'all', label: 'Tous les rendez-vous' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'upcoming', label: 'À venir' },
  { value: 'past', label: 'Passés' },
  { value: 'scheduled', label: 'Programmés' },
  { value: 'completed', label: 'Terminés' },
  { value: 'cancelled', label: 'Annulés' },
  { value: 'missed', label: 'Manqués' },
] as const;



export function convertUTCToComorosTime(utcDate: Date | string): Date {
  const date = new Date(utcDate);
  const comorosDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
  return comorosDate;
}

export function getComorosTimeString(utcDate: string | null): string {
  if (!utcDate) return "—";
  
  const comorosDate = convertUTCToComorosTime(utcDate);
  const hours = comorosDate.getHours().toString().padStart(2, '0');
  const minutes = comorosDate.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getComorosDateString(utcDate: string | null): string {
  if (!utcDate) return "—";
  
  const comorosDate = convertUTCToComorosTime(utcDate);
  const year = comorosDate.getFullYear();
  const month = (comorosDate.getMonth() + 1).toString().padStart(2, '0');
  const day = comorosDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}