/* eslint-disable react/no-unescaped-entities */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import { StatsData } from "../types";

interface StatsCardsProps {
  stats: StatsData;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Recettes
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {stats.totalIncome.toLocaleString('fr-FR')} KMF
          </div>
          <p className="text-xs text-gray-500">
            Montant total des entrées d'argent
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Dépenses
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600">
            {stats.totalExpenses.toLocaleString('fr-FR')} KMF
          </div>
          <p className="text-xs text-gray-500">
            Montant total des sorties d'argent
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Solde Net
          </CardTitle>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {stats.netBalance.toLocaleString('fr-FR')} KMF
          </div>
          <p className="text-xs text-gray-500">
            {stats.netBalance >= 0 ? 'Bénéfice' : 'Déficit'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Transactions
          </CardTitle>
          <FileText className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.transactionCount}
          </div>
          <p className="text-xs text-gray-500">
            Nombre total de transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}