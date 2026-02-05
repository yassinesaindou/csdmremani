/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// app/dashboard/components/DashboardAdmin.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  DollarSign,
  FileText,
  Heart,
  Stethoscope,
  TrendingUp,
  Users,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'
import ActivityFeed from './ActivityFeed'

interface DashboardAdminProps {
  data: {
    todayConsultations: number
    totalConsultations: number
    totalPatients: number
    malePatients: number
    femalePatients: number
    childPatients: number
    adultPatients: number
    monthlyRevenue: number
    monthlyExpenses: number
    monthlyProfit: number
    topDiagnostics: [string, number][]
    activeStaff: number
    recentTransactions: any[]
    recentConsultations: any[]
  }
}

export default function DashboardAdmin({ data }: DashboardAdminProps) {
  const getProgressStyle = (value: number, type: 'blue' | 'green' | 'orange' | 'purple') => {
    let gradient = ''
    switch(type) {
      case 'blue':
        gradient = 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)'
        break
      case 'green':
        gradient = 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
        break
      case 'orange':
        gradient = 'linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)'
        break
      case 'purple':
        gradient = 'linear-gradient(90deg, #8b5cf6 0%, #d946ef 100%)'
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
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Hospitalier</h1>
            <p className="text-gray-600 mt-2">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Système actif</span>
              <span className="text-gray-400 mx-2">•</span>
              <span>Données en temps réel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Consultations */}
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Consultations Aujourd'hui</CardTitle>
              <div className="p-2 bg-linear-to-br from-blue-100 to-indigo-100 rounded-lg">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <CardDescription className="text-gray-600">Nombre de consultations du jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{data.todayConsultations}</span>
                <span className="text-sm text-gray-500">consultations</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Moyenne journalière</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(data.totalConsultations / 30)}/jour
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div style={getProgressStyle(
                    Math.min((data.todayConsultations / 50) * 100, 100),
                    'blue'
                  )}></div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" className="w-full justify-between group" asChild>
              <Link href="/consultations">
                <span>Voir les consultations</span>
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Total Patients */}
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Patients</CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <CardDescription className="text-gray-600">Démographie des patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{data.totalPatients}</span>
                <span className="text-sm text-gray-500">patients uniques</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-700 mb-1">Hommes</div>
                  <div className="text-xl font-bold text-gray-900">{data.malePatients}</div>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-pink-700 mb-1">Femmes</div>
                  <div className="text-xl font-bold text-gray-900">{data.femalePatients}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-amber-700 mb-1">Enfants (&lt;18)</div>
                  <div className="text-xl font-bold text-gray-900">{data.childPatients}</div>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-indigo-700 mb-1">Adultes (≥18)</div>
                  <div className="text-xl font-bold text-gray-900">{data.adultPatients}</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" className="w-full justify-between group" asChild>
              <Link href="/patients">
                <span>Voir tous les patients</span>
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Financial Overview */}
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Finances</CardTitle>
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <CardDescription className="text-gray-600">Vue d'ensemble financière</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenus mensuels</span>
                  <span className="font-semibold text-green-600">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(data.monthlyRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dépenses mensuelles</span>
                  <span className="font-semibold text-red-600">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(data.monthlyExpenses)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-900 font-semibold">Profit mensuel</span>
                  <span className={`font-bold ${data.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(data.monthlyProfit)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" className="w-full justify-between group" asChild>
              <Link href="/finance">
                <span>Voir les transactions</span>
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Staff Management */}
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Personnel</CardTitle>
              <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                <UserPlus className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <CardDescription className="text-gray-600">Gestion du personnel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{data.activeStaff}</span>
                <span className="text-sm text-gray-500">membres actifs</span>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-700">Équipe médicale</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Gestion des médecins et personnel soignant
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Capacité d'accueil</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Activity className="h-3 w-3 mr-1" />
                    Optimale
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" className="w-full justify-between group" asChild>
              <Link href="/staff">
                <span>Gérer le personnel</span>
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Common Diagnostics */}
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Diagnostics Fréquents</CardTitle>
              <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
            </div>
            <CardDescription className="text-gray-600">Top 5 des diagnostics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                {data.topDiagnostics.map(([diagnostic, count], index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-orange-500' :
                        index === 2 ? 'bg-yellow-500' :
                        index === 3 ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <span className="text-sm text-gray-700 truncate max-w-[200px]">
                        {diagnostic}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" className="w-full justify-between group" asChild>
              <Link href="/analytics">
                <span>Analyses détaillées</span>
                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Performance Summary */}
        <Card className="overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Résumé Performance</CardTitle>
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <CardDescription className="text-gray-600">Indicateurs clés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-gray-600">Consultations totales</span>
                  </div>
                  <span className="font-semibold text-gray-900">{data.totalConsultations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Patients uniques</span>
                  </div>
                  <span className="font-semibold text-gray-900">{data.totalPatients}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Revenu par patient</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0
                    }).format(data.totalPatients > 0 ? data.monthlyRevenue / data.totalPatients : 0)}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-2 w-2 rounded-full ${
                    data.monthlyProfit >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">Performance financière</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {data.monthlyProfit >= 0 ? 'Excédentaire' : 'Déficitaire'} ce mois-ci
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="w-full text-center">
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
                Actualiser les indicateurs
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Activité Récente</h2>
              <p className="text-sm text-gray-600">Dernières consultations et transactions</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-2">
              <span>Voir tout</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ActivityFeed 
          consultations={data.recentConsultations} 
          transactions={data.recentTransactions}
        />
      </div>
    </div>
  )
}