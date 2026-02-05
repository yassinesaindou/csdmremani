export interface FamilyPlanningRecord {
  id: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  fileNumber: string | null;
  fullName: string | null;
  address: string | null;
  origin: 'HD' | 'DS' | null;
  age: string | null;
  isNew: boolean | null;
  new_noristerat: number | null;
  new_microlut: number | null;
  new_microgynon: number | null;
  new_emergencyPill: number | null;
  new_maleCondom: number | null;
  new_femaleCondom: number | null;
  new_IUD: number | null;
  new_implano_explano: number | null;
  renewal_noristerat: number | null;
  renewal_microgynon: number | null;
  renewal_lofemanal: number | null;
  renewal_maleCondom: number | null;
  renewal_femaleCondom: number | null;
  renewal_IUD: number | null;
  renewal_implants: number | null;
}

export type OriginOption = 'HD' | 'DS';

export const ORIGIN_OPTIONS: { value: OriginOption; label: string }[] = [
  { value: 'HD', label: 'HD' },
  { value: 'DS', label: 'DS' },
];

export const CONTRACEPTIVE_METHODS = [
  { key: 'new_noristerat', label: 'Noristérat (Nouveau)', category: 'new' },
  { key: 'new_microlut', label: 'Microlut (Nouveau)', category: 'new' },
  { key: 'new_microgynon', label: 'Microgynon (Nouveau)', category: 'new' },
  { key: 'new_emergencyPill', label: 'Pilule du lendemain (Nouveau)', category: 'new' },
  { key: 'new_maleCondom', label: 'Préservatif masculin (Nouveau)', category: 'new' },
  { key: 'new_femaleCondom', label: 'Préservatif féminin (Nouveau)', category: 'new' },
  { key: 'new_IUD', label: 'DIU (Nouveau)', category: 'new' },
  { key: 'new_implano_explano', label: 'Implanon/Explanon (Nouveau)', category: 'new' },
  { key: 'renewal_noristerat', label: 'Noristérat (Renouvellement)', category: 'renewal' },
  { key: 'renewal_microgynon', label: 'Microgynon (Renouvellement)', category: 'renewal' },
  { key: 'renewal_lofemanal', label: 'Loféminal (Renouvellement)', category: 'renewal' },
  { key: 'renewal_maleCondom', label: 'Préservatif masculin (Renouvellement)', category: 'renewal' },
  { key: 'renewal_femaleCondom', label: 'Préservatif féminin (Renouvellement)', category: 'renewal' },
  { key: 'renewal_IUD', label: 'DIU (Renouvellement)', category: 'renewal' },
  { key: 'renewal_implants', label: 'Implants (Renouvellement)', category: 'renewal' },
];