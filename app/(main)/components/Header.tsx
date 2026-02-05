/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Bell, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user: any;
  profile: any;
}

export default function Header({ user, profile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search */}
        <div className="relative flex flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start p-3 hover:bg-gray-50">
                <div className="flex w-full items-start justify-between">
                  <div className="text-sm font-medium text-gray-900">Nouvelle consultation</div>
                  <span className="text-xs text-gray-500">2 min</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">Dr. Dupont a ajouté une nouvelle consultation</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3 hover:bg-gray-50">
                <div className="flex w-full items-start justify-between">
                  <div className="text-sm font-medium text-gray-900">Transaction effectuée</div>
                  <span className="text-xs text-gray-500">15 min</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">Paiement reçu de 250€</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3 hover:bg-gray-50">
                <div className="flex w-full items-start justify-between">
                  <div className="text-sm font-medium text-gray-900">Rapport mensuel</div>
                  <span className="text-xs text-gray-500">1h</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">Votre rapport de décembre est prêt</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>

          {/* User profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.fullName || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.role || 'Médecin'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Paramètres</DropdownMenuItem>
              <DropdownMenuItem>Rapports</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Se déconnecter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}