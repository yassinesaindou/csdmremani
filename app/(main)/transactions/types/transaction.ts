// app/transactions/types/transaction.ts
export interface Transaction {
  id: string
  type: 'income' | 'expense'
  reason: string
  amount: number
  createdBy?: string
  createdAt: string
  doctorName: string
  doctorEmail?: string
}

export interface TransactionFormData {
  type: 'income' | 'expense'
  reason: string
  amount: number
}

export interface TransactionStats {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  totalTransactions: number
  incomeCount: number
  expenseCount: number
}