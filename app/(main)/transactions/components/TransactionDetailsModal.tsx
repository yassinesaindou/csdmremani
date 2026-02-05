// app/transactions/components/TransactionDetailsModal.tsx
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Transaction } from '../types/transaction'
import { 
  X, 
  DollarSign, 
  Calendar, 
  FileText,
  TrendingUp,
  TrendingDown,
  UserCog,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TransactionDetailsModalProps {
  transaction: Transaction
  isOpen: boolean
  onClose: () => void
  userRole: 'admin' | 'doctor' | null
  userId: string | null
}

export default function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  userRole,
  userId
}: TransactionDetailsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('transactionId', transaction.id)

      if (error) throw error
      
      alert('Transaction supprimée avec succès')
      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const canEditDelete = userRole === 'admin' || transaction.createdBy === userId

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {transaction.type === 'income' ? 'Revenu' : 'Dépense'} - {formatCurrency(transaction.amount)}
                  </h2>
                  <p className="text-gray-600">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canEditDelete && (
                  <>
                    <button
                      onClick={() => alert('Édition à implémenter')}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Détails de la Transaction
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Type</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'income' ? 'Revenu' : 'Dépense'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Raison</span>
                    <span className="font-medium text-gray-900 text-right max-w-xs">
                      {transaction.reason}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Montant</span>
                    <span className={`text-xl font-bold ${
                      transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Date</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{formatDate(transaction.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor/User Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-purple-600" />
                  Informations Responsable
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nom</span>
                    <span className="font-medium text-gray-900">{transaction.doctorName}</span>
                  </div>

                  {transaction.doctorEmail && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email</span>
                      <span className="text-gray-900">{transaction.doctorEmail}</span>
                    </div>
                  )}

                  {userRole === 'admin' && transaction.createdBy && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ID Utilisateur</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {transaction.createdBy.substring(0, 8)}...
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Summary */}
              <div className={`rounded-xl p-6 ${
                transaction.type === 'income'
                  ? 'bg-green-50 border border-green-100'
                  : 'bg-red-50 border border-red-100'
              }`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className={`h-5 w-5 ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`} />
                  Résumé
                </h3>
                
                <p className="text-gray-700">
                  Cette transaction a été enregistrée comme {transaction.type === 'income' ? 'un revenu' : 'une dépense'}. 
                  {transaction.type === 'income' 
                    ? ' Elle contribue positivement aux finances de l\'hôpital.'
                    : ' Elle représente une sortie de fonds pour l\'hôpital.'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="flex justify-end gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-300 hover:border-gray-400"
              >
                Fermer
              </Button>
              {canEditDelete && (
                <Button
                  onClick={() => alert('Édition à implémenter')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Modifier la transaction
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}