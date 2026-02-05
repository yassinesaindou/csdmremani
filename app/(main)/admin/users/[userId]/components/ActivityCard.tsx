/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, FileText, ClipboardList, AlertCircle, Edit, Printer, Download } from "lucide-react";
import Link from "next/link";
import { UserPDFExport } from "./UserPDFExport";

interface ActivityCardProps {
  user: any;
}

export function ActivityCard({ user }: ActivityCardProps) {
  const activities = [
    { id: 1, action: "Compte créé", date: new Date(user.createdAt).toISOString() },
  ];

  if (user.role === "docteur") {
    activities.push(
      { id: 2, action: "Consultations enregistrées", date: new Date(Date.now() - 86400000).toISOString() }
    );
  } else if (user.role === "infirmier") {
    activities.push(
      { id: 2, action: "Soins administrés", date: new Date(Date.now() - 86400000).toISOString() }
    );
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    return `Il y a ${diffDays} jours`;
  };

  return (
    <Card className="border-2 border-emerald-100">
      <CardHeader className="pb-4">
  <div className="flex justify-between items-center">
    <CardTitle className="text-xl flex items-center gap-2">
      <Activity className="h-5 w-5 text-emerald-500" />
      Activité Récente
    </CardTitle>
     
  </div>
</CardHeader>
      
      <CardContent className="space-y-6">
        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user.isActive ? "✓" : "✗"}
            </div>
            <div className="text-sm text-gray-600 mt-1">Statut</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-blue-700">
              {user.role ? "✓" : "—"}
            </div>
            <div className="text-sm text-blue-600 mt-1">Rôle défini</div>
          </div>
          
          <div className="bg-emerald-50 p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-emerald-700">
              {user.phoneNumber ? "✓" : "—"}
            </div>
            <div className="text-sm text-emerald-600 mt-1">Téléphone</div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-amber-700">
              {user.email ? "✓" : "—"}
            </div>
            <div className="text-sm text-amber-600 mt-1">Email</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center text-sm text-gray-500">
            <FileText className="mr-2 h-4 w-4" />
            Activités récentes
          </div>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span>{activity.action}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {getTimeAgo(activity.date)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center text-sm text-gray-500">
            <ClipboardList className="mr-2 h-4 w-4" />
            Actions rapides
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm">
              Réinitialiser MDP
            </Button>
            <Button variant="outline" size="sm">
              Voir permissions
            </Button>
            <Link href={`/admin/users/${user.userId}/edit`} className="col-span-2">
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Modifier le profil
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}