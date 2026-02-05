/* eslint-disable @typescript-eslint/no-explicit-any */
// app/transactions/components/AddTransactionModal.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TransactionFormData } from '../types/transaction'
import { 
  X, 
  DollarSign, 
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string | null
  userRole: 'admin' | 'doctor' | null
}

const defaultFormData: TransactionFormData = {
  type: 'income',
  reason: '',
  amount: 0
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userRole
}: AddTransactionModalProps) {
  const [formData, setFormData] = useState<TransactionFormData>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const validateForm = (): boolean => {
    if (!formData.reason.trim()) {
      setError('La raison est requise')
      return false
    }
    
    if (formData.amount <= 0) {
      setError('Le montant doit être supérieur à 0')
      return false
    }
    
    setError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!userId) {
      setError('Utilisateur non authentifié')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // Prepare transaction data
      const transactionData = {
        type: formData.type,
        reason: formData.reason.trim(),
        amount: formData.amount,
        createdBy: userId
      }
      
      console.log('Inserting transaction data:', transactionData)
      
      // Insert transaction
      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
      
      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw new Error(`Erreur: ${insertError.message}`)
      }
      
      console.log('Transaction added successfully:', data)
      
      // Reset form
      setFormData(defaultFormData)
      
      // Show success and close modal
      alert('✅ Transaction ajoutée avec succès!')
      onSuccess()
      
    } catch (err: any) {
      console.error('Error adding transaction:', err)
      setError(err.message || 'Erreur lors de l\'ajout de la transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof TransactionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData(defaultFormData)
      setError(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Nouvelle Transaction
                  </h2>
                  <p className="text-gray-600">
                    Enregistrez une transaction financière
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Transaction Type */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Type de transaction</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'income')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'income'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    disabled={isSubmitting}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-medium">Revenu</span>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'expense')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'expense'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    disabled={isSubmitting}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <TrendingDown className="h-5 w-5" />
                      <span className="font-medium">Dépense</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-700 font-medium">
                  Montant (€)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                    className="pl-10"
                    placeholder="0.00"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-xs text-gray-500">Montant en euros</p>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-gray-700 font-medium">
                  Raison *
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    className="pl-10 min-h-[100px]"
                    placeholder="Décrivez la raison de cette transaction..."
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-xs text-gray-500">Ex: Consultation médicale, Achat matériel, etc.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="border-gray-300 hover:border-gray-400 px-6"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`gap-2 shadow-lg hover:shadow-xl px-8 transition-all ${
                    formData.type === 'income'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}