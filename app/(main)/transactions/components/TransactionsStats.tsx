// app/transactions/components/TransactionsStats.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '../types/transaction'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  BarChart,
  ArrowUpRight,
  ArrowDownRight,
  CircleDollarSign
} from 'lucide-react'

interface TransactionsStatsProps {
  transactions: Transaction[]
  userRole: 'admin' | 'doctor' | null
}

export default function TransactionsStats({ transactions, userRole }: TransactionsStatsProps) {
  const today = new Date().toISOString().split('T')[0]
  
  // Calculate statistics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const netBalance = totalIncome - totalExpenses
  const incomeCount = transactions.filter(t => t.type === 'income').length
  const expenseCount = transactions.filter(t => t.type === 'expense').length

  const todayTransactions = transactions.filter(t => 
    t.createdAt.split('T')[0] === today
  )
  const todayIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
  const todayExpenses = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const stats = [
    {
      title: 'Revenus Totaux',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100',
      trend: `+${incomeCount} transactions`,
      description: `${formatCurrency(todayIncome)} aujourd'hui`,
      change: 'positive'
    },
    {
      title: 'Dépenses Totales',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-red-100 to-orange-100',
      trend: `${expenseCount} transactions`,
      description: `${formatCurrency(todayExpenses)} aujourd'hui`,
      change: 'negative'
    },
    {
      title: 'Solde Net',
      value: formatCurrency(netBalance),
      icon: Wallet,
      color: netBalance >= 0 ? 'from-blue-500 to-cyan-500' : 'from-amber-500 to-yellow-500',
      bgColor: netBalance >= 0 ? 'bg-gradient-to-br from-blue-100 to-cyan-100' : 'bg-gradient-to-br from-amber-100 to-yellow-100',
      trend: netBalance >= 0 ? 'Excédentaire' : 'Déficitaire',
      description: `${((totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0)).toFixed(1)}% des revenus`,
      change: netBalance >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Transactions',
      value: transactions.length,
      icon: BarChart,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100',
      trend: `${todayTransactions.length} aujourd'hui`,
      description: `${incomeCount} revenus / ${expenseCount} dépenses`,
      change: 'neutral'
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
                <span className={`text-2xl font-bold ${
                  stat.change === 'positive' ? 'text-green-700' :
                  stat.change === 'negative' ? 'text-red-700' : 'text-gray-900'
                }`}>
                  {stat.value}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stat.description}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  stat.change === 'positive' ? 'bg-green-100 text-green-700' :
                  stat.change === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {stat.change === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : stat.change === 'negative' ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : (
                    <CircleDollarSign className="h-3 w-3" />
                  )}
                  {stat.trend}
                </span>
              </div>

              {/* Progress bar for balance */}
              {stat.title === 'Solde Net' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Objectif mensuel</span>
                    <span>{formatCurrency(netBalance)}/{formatCurrency(10000)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        netBalance >= 0 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-red-500 to-orange-500'
                      }`}
                      style={{ width: `${Math.min((Math.abs(netBalance) / 10000) * 100, 100)}%` }}
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