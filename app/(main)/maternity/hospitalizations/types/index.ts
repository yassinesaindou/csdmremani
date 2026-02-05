export interface MaternityHospitalization {
  hospitalizationId: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  fullName: string | null;
  age: string | null;
  sex: 'M' | 'F' | null;
  origin: 'HD' | 'DS' | null;
  isEmergency: boolean | null;
  entryDiagnostic: string | null;
  leavingDiagnostic: string | null;
  isPregnant: boolean | null;
  leave_authorized: boolean | null;
  leave_evaded: boolean | null;
  leave_transfered: boolean | null;
  leave_diedBefore48h: boolean | null;
  leave_diedAfter48h: boolean | null;
}

export type OriginOption = 'HD' | 'DS';

export const ORIGIN_OPTIONS: { value: OriginOption; label: string }[] = [
  { value: 'HD', label: 'HD' },
  { value: 'DS', label: 'DS' },
];

export const SEX_OPTIONS = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
];

export const LEAVE_STATUS_OPTIONS = [
  { value: 'authorized', label: 'Sortie autorisée' },
  { value: 'evaded', label: 'Sortie par évasion' },
  { value: 'transfered', label: 'Sortie par transfert' },
  { value: 'diedBefore48h', label: 'Décès avant 48h' },
  { value: 'diedAfter48h', label: 'Décès après 48h' },
]; 