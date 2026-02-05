export interface VaccinationEnfant {
  id: number;
  createdAt: string;
  name: string | null;
  address: string | null;
  age: number | null;
  sex: 'M' | 'F' | null;
  origin: string | null;
  receivedVitamineA: boolean | null;
  receivedAlBendazole: boolean | null;
  weight: number | null;
  height: number | null;
  strategy: string | null;
  BCG: string | null;
  TD0: string | null;
  TD1: string | null;
  TD2: string | null;
  TD3: string | null;
  VP1: string | null;
  Penta1: string | null;
  Penta2: string | null;
  Penta3: string | null;
  RR1: string | null;
  RR2: string | null;
  ECV: string | null;
  createdBy: string | null;
}

export const SEX_OPTIONS = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
];

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
  { key: 'BCG', label: 'BCG' },
  { key: 'TD0', label: 'TD0' },
  { key: 'TD1', label: 'TD1' },
  { key: 'TD2', label: 'TD2' },
  { key: 'TD3', label: 'TD3' },
  { key: 'VP1', label: 'VP1' },
  { key: 'Penta1', label: 'Penta1' },
  { key: 'Penta2', label: 'Penta2' },
  { key: 'Penta3', label: 'Penta3' },
  { key: 'RR1', label: 'RR1' },
  { key: 'RR2', label: 'RR2' },
  { key: 'ECV', label: 'ECV' },
];