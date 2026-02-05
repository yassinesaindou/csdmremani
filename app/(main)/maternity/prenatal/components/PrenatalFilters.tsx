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

interface PrenatalFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  fileNumber: string;
  onFileNumberChange: (value: string) => void;
  hasCPN1: string;
  onHasCPN1Change: (value: string) => void;
  hasCPN4: string;
  onHasCPN4Change: (value: string) => void;
  hasAnemia: string;
  onHasAnemiaChange: (value: string) => void;
  onReset: () => void;
}

export function PrenatalFilters({
  search,
  onSearchChange,
  fileNumber,
  onFileNumberChange,
  hasCPN1,
  onHasCPN1Change,
  hasCPN4,
  onHasCPN4Change,
  hasAnemia,
  onHasAnemiaChange,
  onReset,
}: PrenatalFiltersProps) {
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

        <Select value={hasCPN1} onValueChange={onHasCPN1Change}>
          <SelectTrigger>
            <SelectValue placeholder="CPN1" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes CPN1</SelectItem>
            <SelectItem value="yes">Avec CPN1</SelectItem>
            <SelectItem value="no">Sans CPN1</SelectItem>
          </SelectContent>
        </Select>

        <Select value={hasCPN4} onValueChange={onHasCPN4Change}>
          <SelectTrigger>
            <SelectValue placeholder="CPN4" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes CPN4</SelectItem>
            <SelectItem value="yes">Avec CPN4</SelectItem>
            <SelectItem value="no">Sans CPN4</SelectItem>
          </SelectContent>
        </Select>

        <Select value={hasAnemia} onValueChange={onHasAnemiaChange}>
          <SelectTrigger>
            <SelectValue placeholder="Anémie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="yes">Avec anémie</SelectItem>
            <SelectItem value="no">Sans anémie</SelectItem>
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