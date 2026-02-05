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
import { ORIGIN_OPTIONS, SEX_OPTIONS } from "../types";

interface ConsultationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  origin: string;
  onOriginChange: (value: string) => void;
  sex: string;
  onSexChange: (value: string) => void;
  newCase: string;
  onNewCaseChange: (value: string) => void;
  seenByDoctor: string;
  onSeenByDoctorChange: (value: string) => void;
  onReset: () => void;
}

export function ConsultationFilters({
  search,
  onSearchChange,
  origin,
  onOriginChange,
  sex,
  onSexChange,
  newCase,
  onNewCaseChange,
  seenByDoctor,
  onSeenByDoctorChange,
  onReset,
}: ConsultationFiltersProps) {
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

        <Select value={newCase} onValueChange={onNewCaseChange}>
          <SelectTrigger>
            <SelectValue placeholder="Type de cas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les cas</SelectItem>
            <SelectItem value="true">Nouveau cas</SelectItem>
            <SelectItem value="false">Cas de suivi</SelectItem>
          </SelectContent>
        </Select>

        <Select value={seenByDoctor} onValueChange={onSeenByDoctorChange}>
          <SelectTrigger>
            <SelectValue placeholder="Vu par docteur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="true">Vu par docteur</SelectItem>
            <SelectItem value="false">Non vu</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-right">
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