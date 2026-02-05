/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, Key, UserCheck, UserX } from "lucide-react";
import { ROLE_COLORS, ROLE_LABELS } from "../types";

interface UserInfoCardProps {
  user: any;
  isAdmin: boolean;
  onToggleStatus: () => void;
}

export function UserInfoCard({ user, isAdmin, onToggleStatus }: UserInfoCardProps) {
  const roleColor = ROLE_COLORS[user.role || "autre"];
  const roleLabel = ROLE_LABELS[user.role || "autre"];

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            Informations Personnelles
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge className={user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
              {user.isActive ? "Actif" : "Inactif"}
            </Badge>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleStatus}
                className={user.isActive ? "text-rose-600 border-rose-200 hover:bg-rose-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}
              >
                {user.isActive ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activer
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <User className="mr-2 h-4 w-4" />
                Nom complet
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {user.fullName || "Non renseigné"}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </div>
              <div className="text-lg text-gray-900 font-medium">
                {user.email}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Phone className="mr-2 h-4 w-4" />
                Téléphone
              </div>
              <div className="text-lg text-gray-900">
                {user.phoneNumber || "Non renseigné"}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Key className="mr-2 h-4 w-4" />
                Rôle
              </div>
              <Badge className={`${roleColor} text-white border-0`}>
                {roleLabel}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="mr-2 h-4 w-4" />
                Date de création
              </div>
              <div className="text-lg text-gray-900">
                {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <div className="text-sm text-gray-500">ID Utilisateur</div>
            <div className="font-mono text-sm bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-700 break-all">
              {user.userId}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}