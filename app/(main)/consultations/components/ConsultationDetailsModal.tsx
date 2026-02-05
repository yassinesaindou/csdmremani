// app/consultations/components/ConsultationDetailsModal.tsx
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Consultation } from '../types/consultation'
import { 
  X, 
  User, 
  Home, 
  Calendar, 
  Stethoscope, 
  AlertTriangle, 
  Pill, 
  MapPin,
  UserCog,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react'

interface ConsultationDetailsModalProps {
  consultation: Consultation
  isOpen: boolean
  onClose: () => void
  userRole: 'admin' | 'doctor' | null
  userId: string | null
}

export default function ConsultationDetailsModal({
  consultation,
  isOpen,
  onClose,
  userRole,
  userId
}: ConsultationDetailsModalProps) {
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

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('consultationId', consultation.id)

      if (error) throw error
      
      alert('Consultation supprimée avec succès')
      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Error deleting consultation:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const canEditDelete = userRole === 'admin' || consultation.createdBy === userId

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Consultation - {consultation.patientName}
                  </h2>
                  <p className="text-gray-600">
                    {formatDate(consultation.createdAt)}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Informations du Patient
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Nom complet</span>
                      <span className="font-medium text-gray-900">{consultation.patientName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Âge</span>
                      <span className="font-medium text-gray-900">{consultation.age || 'Non spécifié'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sexe</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        consultation.sexe === 'male' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {consultation.sexe === 'male' ? 'Homme' : 'Femme'}
                      </span>
                    </div>
                    {consultation.isPregnant && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Grossesse</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          Enceinte
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {consultation.patientAddress && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Home className="h-5 w-5 text-green-600" />
                      Localisation
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Origine</span>
                        <span className="font-medium text-gray-900">{consultation.origin || 'Non spécifié'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                        <span className="text-gray-700">{consultation.patientAddress}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Medical Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Informations Médicales
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 block mb-1">Diagnostic</span>
                      <p className="font-medium text-gray-900 bg-white p-3 rounded border">
                        {consultation.diagnostics || 'Non spécifié'}
                      </p>
                    </div>
                    {consultation.dominantSigns && (
                      <div>
                        <span className="text-gray-600 block mb-1">Signes dominants</span>
                        <p className="text-gray-900 bg-white p-3 rounded border">
                          {consultation.dominantSigns}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {consultation.treatment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Pill className="h-5 w-5 text-red-600" />
                      Traitement
                    </h3>
                    <p className="text-gray-900 bg-white p-3 rounded border">
                      {consultation.treatment}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Information (Admin only or for reference) */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCog className="h-5 w-5 text-purple-600" />
                Informations Médecin
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 block mb-1">Médecin traitant</span>
                  <p className="font-medium text-gray-900">{consultation.doctorName}</p>
                </div>
                {consultation.doctorEmail && (
                  <div>
                    <span className="text-gray-600 block mb-1">Email</span>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{consultation.doctorEmail}</span>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 block mb-1">Date de consultation</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{formatDate(consultation.createdAt)}</span>
                  </div>
                </div>
                {userRole === 'admin' && consultation.createdBy && (
                  <div>
                    <span className="text-gray-600 block mb-1">ID Médecin</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {consultation.createdBy}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              {canEditDelete && (
                <button
                  onClick={() => alert('Édition à implémenter')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier la consultation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}