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

interface InventoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  stockStatus: string;
  onStockStatusChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  onReset: () => void;
}

export function InventoryFilters({
  search,
  onSearchChange,
  stockStatus,
  onStockStatusChange,
  sortBy,
  onSortByChange,
  onReset,
}: InventoryFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un article..."
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={stockStatus} onValueChange={onStockStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="État du stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les articles</SelectItem>
            <SelectItem value="low">Stock faible (&lt; 10)</SelectItem>
            <SelectItem value="out">En rupture (0)</SelectItem>
            <SelectItem value="available">Disponible (≥ 10)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger>
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quantity-asc">Quantité (croissant)</SelectItem>
            <SelectItem value="quantity-desc">Quantité (décroissant)</SelectItem>
            <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
            <SelectItem value="recent">Plus récent</SelectItem>
            <SelectItem value="oldest">Plus ancien</SelectItem>
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