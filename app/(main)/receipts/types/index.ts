export interface Receipt {
  receiptId: string;
  createdAt: string;
  reason: string | null;
  departmentId: string | null;
  transactionId: string | null;
}

export interface ReceiptWithDetails extends Receipt {
  department_name: string | null;
  transaction_amount: number | null;
  transaction_type: 'income' | 'expense' | null;
  transaction_createdAt: string | null;
  transaction_reason: string | null;
}

export interface UserProfile {
  userId: string;
  role: string | null;
  fullName: string | null;
  email: string | null;
}