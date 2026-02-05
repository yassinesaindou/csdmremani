export interface MaternityConsultation {
  consultationId: number;
  createdAt: string;
  createdBy: string | null;
  name: string | null;
  address: string | null;
  origin: 'HD' | 'DS' | null;
  sex: 'M' | 'F' | null;
  age: string | null;
  isNewCase: boolean | null;
  seenByDoctor: boolean | null;
  dominantSign: string | null;
  diagnostic: string | null; // comma-separated string
  isPregnant: boolean | null;
  treatment: string | null;
  reference: string | null;
  mitualist: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface Diagnostic {
  diagnostic: number;
  createdAt: string;
  diagnosticName: string | null;
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