// app/consultations/components/ConsultationsStats.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Consultation } from '../types/consultation'
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  TrendingUp, 
  User, 
  UserCheck,
  Activity,
  Award
} from 'lucide-react'

interface ConsultationsStatsProps {
  consultations: Consultation[]
  userRole: 'admin' | 'doctor' | null
}

export default function ConsultationsStats({ consultations, userRole }: ConsultationsStatsProps) {
  const today = new Date().toISOString().split('T')[0]
  
  const todayConsultations = consultations.filter(c => 
    c.createdAt.split('T')[0] === today
  ).length

  const malePatients = consultations.filter(c => c.sexe === 'male').length
  const femalePatients = consultations.filter(c => c.sexe === 'female').length
  
  const totalPatients = malePatients + femalePatients
  const malePercentage = totalPatients > 0 ? Math.round((malePatients / totalPatients) * 100) : 0
  const femalePercentage = totalPatients > 0 ? Math.round((femalePatients / totalPatients) * 100) : 0

  // Calculate average age
  const ages = consultations
    .map(c => parseInt(c.age || '0'))
    .filter(age => age > 0)
  const averageAge = ages.length > 0 
    ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
    : 0

  // Calculate diagnostics diversity
  const uniqueDiagnostics = new Set(
    consultations
      .map(c => c.diagnostics)
      .filter(Boolean)
  ).size

  const stats = [
    {
      title: 'Total Consultations',
      value: consultations.length,
      icon: Stethoscope,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-100 to-cyan-100',
      trend: '+12%',
      description: userRole === 'admin' ? 'Toutes consultations' : 'Vos consultations'
    },
    {
      title: 'Aujourd\'hui',
      value: todayConsultations,
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100',
      trend: consultations.length > 0 
        ? `${Math.round((todayConsultations / consultations.length) * 1000) / 10}%`
        : '0%',
      description: 'Consultations du jour'
    },
    {
      title: 'Patients',
      value: totalPatients,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100',
      trend: `${malePercentage}%H / ${femalePercentage}%F`,
      description: `${averageAge} ans en moyenne`
    },
    {
      title: 'Diagnostics',
      value: uniqueDiagnostics,
      icon: Activity,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-amber-100 to-orange-100',
      trend: consultations.length > 0 
        ? `${Math.round((uniqueDiagnostics / consultations.length) * 100)}%`
        : '0%',
      description: 'Diversité des diagnostics'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {stat.title}
              </CardTitle>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm text-gray-500">/ {consultations.length} total</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stat.description}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stat.title === 'Aujourd\'hui' && todayConsultations > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {stat.trend}
                </span>
              </div>

              {/* Progress bar for today's consultations */}
              {stat.title === 'Aujourd\'hui' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Objectif journalier</span>
                    <span>{todayConsultations}/20</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min((todayConsultations / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}