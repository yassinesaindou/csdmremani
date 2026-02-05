export interface UserProfile {
  userId: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  role: string | null;
  branch: string | null;
  isActive: boolean | null;
  createdAt: string;
  department?: {
    departmentId: string;
    departementName: string;
  };
}

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  departmentId: string;
}

export interface Department {
  departmentId: string;
  departementName: string;
}

// French labels for departments
export const DEPARTMENTS = [
  { value: "administration", label: "Administration" },
  { value: "maternite", label: "Maternité" },
  { value: "medecine", label: "Médecine" },
  { value: "pharmacie", label: "Pharmacie" },
  { value: "laboratoire", label: "Laboratoire" },
  { value: "vaccination", label: "Vaccination" },
  { value: "nutrition", label: "Nutrition" },
  { value: "salle_operation", label: "Salle d'Opération" },
  { value: "gestion", label: "Gestion" },
] as const;

export const ROLES = [
  { value: "admin", label: "Administrateur", color: "bg-purple-500" },
  { value: "doctor", label: "Docteur", color: "bg-blue-500" },
  { value: "nurse", label: "Infirmier", color: "bg-green-500" },
  { value: "pharmacist", label: "Pharmacien", color: "bg-indigo-500" },
  { value: "lab_technician", label: "Technicien de Laboratoire", color: "bg-cyan-500" },
    { value: "secretary", label: "Secrétaire", color: "bg-gray-500" },
    { value: "cashier", label: "Caisse", color: "bg-amber-500" },
    { value: "major", label: "Major", color: "bg-teal-500" },
    { value: "surgeon", label: "Chirurgien", color: "bg-red-500" },
    { value: "accountant", label: "Comptable", color: "bg-orange-500" },
    { value: "manager", label: "Gestionnaire", color: "bg-lime-500" },
    { value: "anesthetist", label: "Anesthésiste", color: "bg-pink-500" },
  { value: "other", label: "Autre", color: "bg-yellow-500" },
] as const;

export const STATUS_COLORS = {
  true: "bg-emerald-500 hover:bg-emerald-600",
  false: "bg-rose-500 hover:bg-rose-600",
};