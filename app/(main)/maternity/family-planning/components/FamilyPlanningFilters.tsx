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
import { ORIGIN_OPTIONS } from "../types";

interface FamilyPlanningFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  origin: string;
  onOriginChange: (value: string) => void;
  isNew: string;
  onIsNewChange: (value: string) => void;
  fileNumber: string;
  onFileNumberChange: (value: string) => void;
  onReset: () => void;
}

export function FamilyPlanningFilters({
  search,
  onSearchChange,
  origin,
  onOriginChange,
  isNew,
  onIsNewChange,
  fileNumber,
  onFileNumberChange,
  onReset,
}: FamilyPlanningFiltersProps) {
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
        <div>
          <Input
            placeholder="Numéro de dossier"
            value={fileNumber}
            onChange={(e) => onFileNumberChange(e.target.value)}
          />
        </div>

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

        <Select value={isNew} onValueChange={onIsNewChange}>
          <SelectTrigger>
            <SelectValue placeholder="Type de consultation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="true">Nouvelle consultation</SelectItem>
            <SelectItem value="false">Renouvellement</SelectItem>
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