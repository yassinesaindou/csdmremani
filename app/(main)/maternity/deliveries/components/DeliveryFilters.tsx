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
import { ORIGIN_OPTIONS, DELIVERY_TYPES } from "../types";

interface DeliveryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  origin: string;
  onOriginChange: (value: string) => void;
  deliveryType: string;
  onDeliveryTypeChange: (value: string) => void;
  motherStatus: string;
  onMotherStatusChange: (value: string) => void;
  onReset: () => void;
}

export function DeliveryFilters({
  search,
  onSearchChange,
  origin,
  onOriginChange,
  deliveryType,
  onDeliveryTypeChange,
  motherStatus,
  onMotherStatusChange,
  onReset,
}: DeliveryFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom ou numéro dossier..."
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

        <Select value={deliveryType} onValueChange={onDeliveryTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Type accouchement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            {DELIVERY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={motherStatus} onValueChange={onMotherStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Statut mère" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="alive">Vivante</SelectItem>
            <SelectItem value="dead">Décédée</SelectItem>
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