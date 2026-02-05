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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TYPE_OPTIONS } from "../types";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Department } from "../types";

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  onReset: () => void;
  onSearchSubmit: () => void;
}

export function TransactionFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  department,
  onDepartmentChange,
  dateRange,
  onDateRangeChange,
  onReset,
  onSearchSubmit,
}: TransactionFiltersProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadDepartments() {
      const { data } = await supabase
        .from("departments")
        .select("*")
        .order("departementName");
      
      if (data) {
        setDepartments(data);
      }
    }

    loadDepartments();
  }, []);

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={department} onValueChange={onDepartmentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tous les départements" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les départements</SelectItem>
            <SelectItem value="general">Général</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.departmentId} value={dept.departmentId}>
                {dept.departementName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                (!dateRange.from && !dateRange.to) && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yy", { locale: fr })} -{" "}
                    {format(dateRange.to, "dd/MM/yy", { locale: fr })}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yy", { locale: fr })
                )
              ) : (
                "Période"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => onDateRangeChange({
                from: range?.from,
                to: range?.to
              })}
              numberOfMonths={2}
              locale={fr}
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <Button
            onClick={onSearchSubmit}
            variant="default"
            className="flex-1"
          >
            Appliquer
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1"
          >
            Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  );
}