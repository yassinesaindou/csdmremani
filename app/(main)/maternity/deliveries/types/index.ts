export interface MaternityDelivery {
  deliveryId: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  fileNumber: string | null;
  fullName: string | null;
  address: string | null;
  origin: 'HD' | 'DS' | null;
  workTime: string | null;
  delivery_dateTime: string | null;
  delivery_eutocic: string | null;
  delivery_dystocic: string | null;
  delivery_transfert: string | null;
  weight: number | null;
  newBorn_living: number | null;
  newBorn_lessThan2point5kg: number | null;
  numberOfDeaths: number | null;
  numberOfDeaths_before24hours: number | null;
  numberOfDeaths_before7Days: number | null;
  isMotherDead: boolean | null;
  transfer: string | null;
  leavingDate: string | null;
  observations: string | null;
}

export type OriginOption = 'HD' | 'DS';

export const ORIGIN_OPTIONS: { value: OriginOption; label: string }[] = [
  { value: 'HD', label: 'HD' },
  { value: 'DS', label: 'DS' },
];

export const DELIVERY_TYPES = [
  { value: 'eutocic', label: 'Eutocique' },
  { value: 'dystocic', label: 'Dystocique' },
  { value: 'transfert', label: 'Transfert' },
];