export interface UserDetails {
  userId: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  role: string | null;
  branch: string | null;
  isActive: boolean | null;
  createdAt: string;
}

export interface DepartmentAssignment {
  assignmentId: string;
  departmentId: string;
  createdAt: string;
  departments: {
    departmentId: string;
    departementName: string;
  };
}

export const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-500",
  doctor: "bg-blue-500",
  nurse: "bg-emerald-500",
  pharmacist: "bg-indigo-500",
  technician: "bg-cyan-500",
  secretary: "bg-gray-500",
  cashier: "bg-amber-500",
  major: "bg-teal-500",
  surgeon: "bg-red-500",
  accountant: "bg-orange-500",
  manager: "bg-lime-500",
  anesthetist: "bg-pink-500",
  autre: "bg-amber-500",
};

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  doctor: "Docteur",
  nurse: "Infirmier",
  pharmacist: "Pharmacien",
  technician: "Technicien",
  secretary: "Secrétaire",
  cashier: "Caissier",
  major: "Major",
  surgeon: "Chirurgien",
  accountant: "Comptable",
  manager: "Gestionnaire",
  anesthetist: "Anesthésiste",
  autre: "Autre",
};