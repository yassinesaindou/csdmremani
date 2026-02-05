export interface PrenatalRecord {
  id: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  fileNumber: string | null;
  fullName: string | null;
  patientAge: string | null;
  pregnancyAge: string | null;
  visitCPN1: string | null;
  visitCPN2: string | null;
  visitCPN3: string | null;
  visitCPN4: string | null;
  iron_folicAcidDose1: boolean | null;
  iron_folicAcidDose2: boolean | null;
  iron_folicAcidDose3: boolean | null;
  sulfoxadin_pyrinDose1: boolean | null;
  sulfoxadin_pyrinDose2: boolean | null;
  sulfoxadin_pyrinDose3: boolean | null;
  anemy: string | null;
  iron_folicAcid: string | null;
  obeservations: string | null;
}

export type OriginOption = 'HD' | 'DS';

export const ORIGIN_OPTIONS: { value: OriginOption; label: string }[] = [
  { value: 'HD', label: 'HD' },
  { value: 'DS', label: 'DS' },
];

export const CPN_VISITS = [
  { key: 'visitCPN1', label: 'CPN1', color: 'bg-blue-100 text-blue-800' },
  { key: 'visitCPN2', label: 'CPN2', color: 'bg-green-100 text-green-800' },
  { key: 'visitCPN3', label: 'CPN3', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'visitCPN4', label: 'CPN4', color: 'bg-purple-100 text-purple-800' },
];

export const IRON_DOSES = [
  { key: 'iron_folicAcidDose1', label: 'Dose 1' },
  { key: 'iron_folicAcidDose2', label: 'Dose 2' },
  { key: 'iron_folicAcidDose3', label: 'Dose 3' },
];

export const SULFOXADIN_DOSES = [
  { key: 'sulfoxadin_pyrinDose1', label: 'Dose 1' },
  { key: 'sulfoxadin_pyrinDose2', label: 'Dose 2' },
  { key: 'sulfoxadin_pyrinDose3', label: 'Dose 3' },
];

export const ANEMY_OPTIONS = [
  { value: 'none', label: 'Aucune' },
  { value: 'mild', label: 'Légère' },
  { value: 'moderate', label: 'Modérée' },
  { value: 'severe', label: 'Sévère' },
];

export const IRON_FOLIC_OPTIONS = [
  { value: 'none', label: 'Aucun' },
  { value: 'prescribed', label: 'Prescrit' },
  { value: 'administered', label: 'Administré' },
  { value: 'completed', label: 'Complété' },
];