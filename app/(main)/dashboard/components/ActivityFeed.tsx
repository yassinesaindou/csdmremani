/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/components/ActivityFeed.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  DollarSign,
  User,
  FileText,
  Calendar
} from 'lucide-react'

interface ActivityFeedProps {
  consultations: Array<{
    consultationId: string
    createdAt: string
    patientName: string
    diagnostics: string
    sexe: string
    age: string
  }>
  transactions: Array<{
    transactionId: string
    createdAt: string
    type: string
    reason: string
    amount: number
  }>
}

export default function ActivityFeed({ consultations, transactions }: ActivityFeedProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'expense':
        return <DollarSign className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-800'
      case 'expense':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5

    if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`
    } else if (diffInHours < 48) {
      return 'Hier'
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    }
  }

  const allActivities = [
    ...consultations.map(c => ({
      type: 'consultation' as const,
      id: c.consultationId,
      title: `Consultation: ${c.patientName}`,
      description: `${c.diagnostics || 'Diagnostic en attente'} • ${c.age} ans`,
      timestamp: c.createdAt,
      icon: <User className="h-4 w-4" />
    })),
    ...transactions.map(t => ({
      type: 'transaction' as const,
      id: t.transactionId,
      title: `${t.type === 'income' ? 'Revenu' : 'Dépense'}: ${t.reason}`,
      description: `${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(t.amount || 0)}`,
      timestamp: t.createdAt,
      icon: getTypeIcon(t.type)
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, 5)

  if (allActivities.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <Calendar className="h-12 w-12" />
        </div>
        <h3 className="text-sm font-medium text-gray-900">Aucune activité récente</h3>
        <p className="mt-1 text-sm text-gray-500">
          Aucune consultation ou transaction n'a été enregistrée récemment.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {allActivities.map((activity) => (
        <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                {activity.icon}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${
                    activity.type === 'transaction' 
                      ? getTypeColor((activity as any).type)
                      : 'bg-blue-100 text-blue-800'
                  } border-0`}
                >
                  {activity.type === 'consultation' ? 'Consultation' : 'Transaction'}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span>{activity.description}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span>{formatDate(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}