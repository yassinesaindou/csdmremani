// app/transactions/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TransactionsTable from './components/TransactionsTable'
import TransactionsStats from './components/TransactionsStats'
import AddTransactionModal from './components/AddTransactionModal'
import { Transaction } from './types/transaction'
import { Skeleton } from '@/components/ui/skeleton'
import { PlusCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<'admin' | 'doctor' | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const supabase = createClient()
      
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, userId, fullName')
        .eq('userId', session.user.id)
        .single()

      if (!profile) {
        router.push('/login')
        return
      }

      setUserRole(profile.role as 'admin' | 'doctor')
      setUserId(profile.userId)

      // Fetch transactions based on role
      let query = supabase
        .from('transactions')
        .select(`
          *,
          profiles:createdBy(fullName, email)
        `)
        .order('createdAt', { ascending: false })

      if (profile.role === 'doctor') {
        query = query.eq('createdBy', profile.userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching transactions:', error)
        return
      }

      const formattedTransactions: Transaction[] = (data || []).map(transaction => ({
        id: transaction.transactionId,
        type: transaction.type as 'income' | 'expense',
        reason: transaction.reason || 'Non spécifié',
        amount: transaction.amount || 0,
        createdBy: transaction.createdBy,
        createdAt: transaction.createdAt,
        doctorName: transaction.profiles?.fullName || 'Inconnu',
        doctorEmail: transaction.profiles?.email,
      }))

      setTransactions(formattedTransactions)
      setFilteredTransactions(formattedTransactions)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions)
      return
    }

    const filtered = transactions.filter(transaction =>
      transaction.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTransactions(filtered)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    loadTransactions()
  }

  const handleAddSuccess = () => {
    setIsAddModalOpen(false)
    handleRefresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Transactions Financières
            </h1>
            <p className="text-gray-600">
              {userRole === 'admin' 
                ? 'Gérez toutes les transactions financières de l\'hôpital' 
                : 'Consultez vos transactions'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="gap-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Nouvelle Transaction</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <TransactionsStats 
          transactions={filteredTransactions}
          userRole={userRole}
        />

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <TransactionsTable
            transactions={filteredTransactions}
            onSearch={handleSearch}
            isLoading={isLoading}
            userRole={userRole}
            userId={userId}
          />
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        userId={userId}
        userRole={userRole}
      />
    </div>
  )
}