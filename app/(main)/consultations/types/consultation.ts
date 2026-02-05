// app/consultations/types/consultation.ts
export interface Consultation {
  id: string
  patientName: string
  patientAddress?: string
  age?: string
  sexe?: 'male' | 'female'
  diagnostics?: string
  dominantSigns?: string  // This maps to "daminantSigns" in database
  treatment?: string
  origin?: string
  isPregnant?: boolean
  doctorName: string
  doctorEmail?: string
  createdAt: string
  createdBy?: string
}

export interface ConsultationFormData {
  patientName: string
  patientAddress?: string
  age?: string
  sexe?: 'male' | 'female'
  diagnostics?: string
  dominantSigns?: string  // This maps to "daminantSigns" in database
  treatment?: string
  origin?: string
  isPregnant?: boolean
}