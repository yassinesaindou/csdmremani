// app/dashboard/components/DashboardHeader.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Bell,
  Calendar,
  Home,
  RefreshCw,
  Settings,
  LogOut
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  user: {
    fullName: string
    email: string
    role: string
    branch: string
    isActive: boolean
  }
  onRefresh: () => void
  isLoading: boolean
}

export default function DashboardHeader({ user, onRefresh, isLoading }: DashboardHeaderProps) {
  const router = useRouter()
  
  const handleLogout = async () => {
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'doctor': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
              <Home className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Bonjour, Dr. {user.fullName} 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenue sur votre tableau de bord {user.role === 'admin' ? 'administrateur' : 'médical'}
              </p>
            </div>
          </div>

          {/* User Status Card */}
          <div className="inline-flex items-center gap-4 px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                {user.role === 'admin' ? 'Administrateur' : 'Médecin'}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                {user.isActive ? 'Actif' : 'Inactif'}
              </div>
              <span className="text-sm text-gray-600">{user.email}</span>
              {user.branch && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{user.branch}</span>
                </>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-gray-300 hover:bg-gray-50"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-gray-300 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </Button>
          <Button
            onClick={onRefresh}
            variant="default"
            size="sm"
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isLoading ? 'Actualisation...' : 'Actualiser'}
            </span>
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </div>
    </div>
  )
}