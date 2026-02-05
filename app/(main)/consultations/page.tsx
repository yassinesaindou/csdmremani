// app/consultations/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AddConsultationModal from './components/AddConsultationModal'
import ConsultationsStats from './components/ConsultationsStats'
import ConsultationsTable from './components/ConsultationsTable'
import { Consultation } from './types/consultation'

export default function ConsultationsPage() {
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<'admin' | 'doctor' | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    loadConsultations()
  }, [])

  const loadConsultations = async () => {
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

      // Fetch consultations based on role
      let query = supabase
        .from('consultations')
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
        console.error('Error fetching consultations:', error)
        return
      }

      const formattedConsultations: Consultation[] = (data || []).map(consultation => ({
        id: consultation.consultationId,
        patientName: consultation.patientName || 'Non spécifié',
        patientAddress: consultation.patientAddress,
        age: consultation.age,
        sexe: consultation.sexe,
        diagnostics: consultation.diagnostics,
        dominantSigns: consultation.daminantSigns,
        treatment: consultation.treatment,
        origin: consultation.origin,
        isPregnant: consultation.isPregnant,
        doctorName: consultation.profiles?.fullName || 'Inconnu',
        doctorEmail: consultation.profiles?.email,
        createdAt: consultation.createdAt,
        createdBy: consultation.createdBy
      }))

      setConsultations(formattedConsultations)
      setFilteredConsultations(formattedConsultations)
    } catch (error) {
      console.error('Error loading consultations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredConsultations(consultations)
      return
    }

    const filtered = consultations.filter(consultation =>
      consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.diagnostics?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.origin?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredConsultations(filtered)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    loadConsultations()
  }

  const handleAddSuccess = () => {
    setIsAddModalOpen(false)
    handleRefresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Consultations Médicales
            </h1>
            <p className="text-gray-600">
              {userRole === 'admin' 
                ? 'Gérez toutes les consultations de l\'hôpital' 
                : 'Consultez et gérez vos patients'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="gap-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Nouvelle Consultation</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <ConsultationsStats 
          consultations={filteredConsultations}
          userRole={userRole}
        />

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <ConsultationsTable
            consultations={filteredConsultations}
            onSearch={handleSearch}
            isLoading={isLoading}
            userRole={userRole}
            userId={userId}
          />
        </div>
      </div>

      {/* Add Consultation Modal */}
      <AddConsultationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        userId={userId}
        userRole={userRole}
      />
    </div>
  )
}