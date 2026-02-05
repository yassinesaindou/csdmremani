"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ReceiptFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  onReset: () => void;
  onSearchSubmit: () => void;
  userDepartments: string[];
  canSeeAllDepartments: boolean; // Changed from showAllDepartments
  allDepartments: Array<{departmentId: string, departementName: string}>;
}

export function ReceiptFilters({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  onReset,
  onSearchSubmit,
  userDepartments,
  canSeeAllDepartments, // Changed parameter name
  allDepartments,
}: ReceiptFiltersProps) {
  const [filteredDepartments, setFilteredDepartments] = useState<Array<{departmentId: string, departementName: string}>>([]);
  const supabase = createClient();

  useEffect(() => {
    // Filter departments based on user permissions
    if (canSeeAllDepartments) {
      // User can see all departments
      setFilteredDepartments(allDepartments);
    } else {
      // User can only see their departments
      const userDepts = allDepartments.filter(dept => 
        userDepartments.includes(dept.departmentId)
      );
      setFilteredDepartments(userDepts);
    }
  }, [allDepartments, userDepartments, canSeeAllDepartments]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par motif..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">Filtres:</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select 
          value={department} 
          onValueChange={onDepartmentChange}
          disabled={filteredDepartments.length === 0 && !canSeeAllDepartments}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              filteredDepartments.length === 0 && !canSeeAllDepartments
                ? "Aucun département disponible"
                : "Tous les départements"
            } />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les départements</SelectItem>
            {filteredDepartments.map((dept) => (
              <SelectItem key={dept.departmentId} value={dept.departmentId}>
                {dept.departementName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            onClick={onSearchSubmit}
            variant="default"
            className="flex-1"
          >
            Rechercher
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1"
          >
            Réinitialiser
          </Button>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">
            {canSeeAllDepartments ? "Vue complète" : "Vue limitée à vos départements"}
            {filteredDepartments.length > 0 && (
              <div className="text-xs text-gray-400">
                {filteredDepartments.length} département(s) disponible(s)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}