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
import { SEX_OPTIONS, STRATEGY_OPTIONS } from "../types";

interface VaccinationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sex: string;
  onSexChange: (value: string) => void;
  strategy: string;
  onStrategyChange: (value: string) => void;
  onReset: () => void;
}

export function VaccinationFilters({
  search,
  onSearchChange,
  sex,
  onSexChange,
  strategy,
  onStrategyChange,
  onReset,
}: VaccinationFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom de l'enfant..."
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <Select value={strategy} onValueChange={onStrategyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes stratégies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes stratégies</SelectItem>
            {STRATEGY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="md:col-span-2 text-right">
          <button
            onClick={onReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline">
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  );
}
