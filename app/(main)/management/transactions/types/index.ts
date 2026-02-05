export interface Transaction {
  transactionId: string;
  createdAt: string;
  createdBy: string | null;
  type: 'income' | 'expense' | null;
  reason: string | null;
  amount: number | null;
  departmentToSee: string | null;
}

export interface Department {
  departmentId: string;
  departementName: string;
  createdAt: string;
}

export interface TransactionWithDepartment extends Transaction {
  department_name: string | null;
  created_by_name: string | null;
}

export interface StatsData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
}

export const TRANSACTION_TYPES = [
  { value: 'income', label: 'Recette' },
  { value: 'expense', label: 'Dépense' },
];

export const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous les types' },
  { value: 'income', label: 'Recettes seulement' },
  { value: 'expense', label: 'Dépenses seulement' },
];