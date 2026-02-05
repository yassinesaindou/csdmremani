export interface VaccinationFemmeEnceinte {
  id: number;
  createdAt: string;
  month: number | null;
  name: string | null;
  address: string | null;
  origin: string | null;
  strategy: string | null;
  TD1: string | null;
  TD2: string | null;
  TD3: string | null;
  TD4: string | null;
  TD5: string | null;
  FCV: string | null;
  createdBy: string | null;
}

export const STRATEGY_OPTIONS = [
  { value: 'fixe', label: 'Poste Fixe' },
  { value: 'avance', label: 'Poste Avancé' },
  { value: 'mobile', label: 'Équipe Mobile' },
];

export const VACCINATION_OPTIONS = [
  { value: 'fait', label: 'Fait' },
  { value: 'non_fait', label: 'Non Fait' },
  { value: 'contre_indication', label: 'Contre-indication' },
];

export const VACCINES = [
  { key: 'TD1', label: 'TD1' },
  { key: 'TD2', label: 'TD2' },
  { key: 'TD3', label: 'TD3' },
  { key: 'TD4', label: 'TD4' },
  { key: 'TD5', label: 'TD5' },
  { key: 'FCV', label: 'FCV' },
];

export const MONTH_OPTIONS = [
  { value: '1', label: '1er mois' },
  { value: '2', label: '2ème mois' },
  { value: '3', label: '3ème mois' },
  { value: '4', label: '4ème mois' },
  { value: '5', label: '5ème mois' },
  { value: '6', label: '6ème mois' },
  { value: '7', label: '7ème mois' },
  { value: '8', label: '8ème mois' },
  { value: '9', label: '9ème mois' },
];