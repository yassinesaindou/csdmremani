/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// app/dashboard/components/DashboardDoctor.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowUpRight,
  Calendar,
  FileText,
  Heart,
  Stethoscope,
  TrendingUp,
  Users,
  Clock,
  Award
} from 'lucide-react'
import Link from 'next/link'

interface DashboardDoctorProps {
  data: {
    totalConsultations: number
    todayConsultations: number
    malePatients: number
    femalePatients: number
    topDiagnostics: [string, number][]
    recentConsultations: any[]
  }
  doctorId: string
}

export default function DashboardDoctor({ data, doctorId }: DashboardDoctorProps) {
  const successRate = Math.round((data.totalConsultations / (data.totalConsultations + 10)) * 100)
  const avgConsultationsPerDay = Math.round(data.totalConsultations / 30)

  const getProgressStyle = (value: number, type: 'blue' | 'green' | 'purple' | 'orange') => {
    let gradient = ''
    switch(type) {
      case 'blue':
        gradient = 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)'
        break
      case 'green':
        gradient = 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
        break
      case 'purple':
        gradient = 'linear-gradient(90deg, #8b5cf6 0%, #d946ef 100%)'
        break
      case 'orange':
        gradient = 'linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)'
        break
    }
    
    return {
      width: `${Math.min(value, 100)}%`,
      background: gradient,
      height: '100%',
      borderRadius: '9999px',
      transition: 'width 0.3s ease-in-out'
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Médical</h1>
            <p className="text-gray-600 mt-2">
              Suivez vos consultations et vos patients
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Disponible aujourd'hui</span>
              <span className="text-gray-400 mx-2">•</span>
              <span>{data.todayConsultations} consultation(s) programmée(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Schedule */}
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Consultations Aujourd'hui</CardTitle>
              <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <CardDescription className="text-gray-600">Agenda du jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{data.todayConsultations}</span>
                <span className="text-sm text-gray-500">rendez-vous</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progression de la journée</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round((data.todayConsultations / 10) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div style={getProgressStyle(
                    Math.min((data.todayConsultations / 10) * 100, 100),
                    'blue'
                  )}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Prochaine</div>
                  <div className="text-lg font-semibold text-gray-900">09:00</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Dernière</div>
                  <div className="text-lg font-semibold text-gray-900">17:30</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" className="w-full justify-between group" asChild>
              <Link href="/schedule">
                <span>Voir mon agenda</span>
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Total Consultations */}
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Consultations Totales</CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                <Stethoscope className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <CardDescription className="text-gray-600">Votre activité globale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{data.totalConsultations}</span>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Moyenne: {avgConsultationsPerDay}/jour</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Performance mensuelle</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round((data.todayConsultations / avgConsultationsPerDay) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" className="w-full justify-between group" asChild>
              <Link href="/my-consultations">
                <span>Mes consultations</span>
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Patient Demographics */}
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Démographie Patients</CardTitle>
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <CardDescription className="text-gray-600">Répartition par sexe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{data.malePatients + data.femalePatients}</span>
                <span className="text-sm text-gray-500">patients</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-blue-700">Hommes</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{data.malePatients}</div>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                    <span className="text-sm font-medium text-pink-700">Femmes</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{data.femalePatients}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ratio H/F</span>
                  <span className="font-semibold text-gray-900">
                    {data.femalePatients > 0 ? (data.malePatients / data.femalePatients).toFixed(1) : '0'}:1
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" className="w-full justify-between group" asChild>
              <Link href="/my-patients">
                <span>Voir mes patients</span>
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Success Rate */}
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Taux de Satisfaction</CardTitle>
              <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <CardDescription className="text-gray-600">Performance médicale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{successRate}%</span>
                <span className="text-sm text-gray-500">de réussite</span>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-orange-600" />
                  <div className="text-sm">
                    <span className="font-medium text-orange-700">Niveau: </span>
                    <span className="text-gray-600">
                      {successRate >= 90 ? 'Excellent' : 
                       successRate >= 70 ? 'Très bon' : 
                       successRate >= 50 ? 'Bon' : 'À améliorer'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Score de performance</span>
                  <span className="font-semibold text-gray-900">{successRate}/100</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div style={getProgressStyle(successRate, 'orange')}></div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" className="w-full justify-between group" asChild>
              <Link href="/dashboard/performance">
                <span>Analyser ma performance</span>
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Common Diagnostics */}
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Diagnostics Fréquents</CardTitle>
              <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
            </div>
            <CardDescription className="text-gray-600">Vos diagnostics les plus courants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                {data.topDiagnostics.map(([diagnostic, count], index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        index === 0 ? 'bg-red-100 text-red-600' :
                        index === 1 ? 'bg-orange-100 text-orange-600' :
                        index === 2 ? 'bg-amber-100 text-amber-600' :
                        index === 3 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <span className="text-sm font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                          {diagnostic}
                        </h4>
                        <p className="text-xs text-gray-500">{count} cas</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      count > 10 ? 'bg-green-50 text-green-700 border-green-200' :
                      count > 5 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }>
                      {count > 10 ? 'Fréquent' : count > 5 ? 'Occasionnel' : 'Rare'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" className="w-full justify-between group" asChild>
              <Link href="/my-diagnostics">
                <span>Voir tous les diagnostics</span>
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Consultations */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Consultations Récentes</h3>
              <p className="text-sm text-gray-600">{data.recentConsultations.length} consultation(s) récente(s)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                <span>Tout voir</span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {data.recentConsultations.map((consultation, index) => (
              <div key={consultation.consultationId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    consultation.sexe === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                  }`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{consultation.patientName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(consultation.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{consultation.age} ans</span>
                      <span className="text-xs text-gray-500">•</span>
                      <Badge variant="outline" className="text-xs">
                        {consultation.diagnostics || 'Diagnostic en attente'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span>Détails</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}