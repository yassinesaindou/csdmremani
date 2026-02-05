"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { ORIGIN_OPTIONS, SEX_OPTIONS, LEAVE_STATUS_OPTIONS } from "../types";

interface HospitalizationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  origin: string;
  onOriginChange: (value: string) => void;
  sex: string;
  onSexChange: (value: string) => void;
  emergency: string;
  onEmergencyChange: (value: string) => void;
  leaveStatus: string;
  onLeaveStatusChange: (value: string) => void;
  onReset: () => void;
}

export function HospitalizationFilters({
  search,
  onSearchChange,
  origin,
  onOriginChange,
  sex,
  onSexChange,
  emergency,
  onEmergencyChange,
  leaveStatus,
  onLeaveStatusChange,
  onReset,
}: HospitalizationFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom patient..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">Filtres:</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Select value={origin} onValueChange={onOriginChange}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes origines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes origines</SelectItem>
            {ORIGIN_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sex} onValueChange={onSexChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tous sexes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous sexes</SelectItem>
            {SEX_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={emergency} onValueChange={onEmergencyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Type admission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes admissions</SelectItem>
            <SelectItem value="true">Urgence</SelectItem>
            <SelectItem value="false">Normale</SelectItem>
          </SelectContent>
        </Select>

        <Select value={leaveStatus} onValueChange={onLeaveStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Statut sortie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">En cours</SelectItem>
            {LEAVE_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-right col-span-2">
          <button
            onClick={onReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}