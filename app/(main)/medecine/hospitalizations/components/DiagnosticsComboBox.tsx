/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface DiagnosticsComboBoxProps {
  value: string[];
  onChange: (diagnostics: string[]) => void;
}

export function DiagnosticsComboBox({ value, onChange }: DiagnosticsComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [diagnosticsList, setDiagnosticsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadDiagnostics();
  }, []);

  async function loadDiagnostics() {
    setLoading(true);
    const { data } = await supabase
      .from("diagnostics")
      .select("diagnosticName")
      .not("diagnosticName", "is", null)
      .order("diagnosticName");
    
    if (data) {
      const names = data.map(d => d.diagnosticName).filter((name): name is string => !!name);
      setDiagnosticsList(names);
    }
    setLoading(false);
  }

  const handleSelect = (diagnostic: string) => {
    if (!value.includes(diagnostic)) {
      onChange([...value, diagnostic]);
    } else {
      onChange(value.filter(d => d !== diagnostic));
    }
    setSearch("");
  };

  const handleAddNew = () => {
    if (search.trim() && !value.includes(search.trim()) && !diagnosticsList.includes(search.trim())) {
      onChange([...value, search.trim()]);
      setSearch("");
      setOpen(false);
    }
  };

  const removeDiagnostic = (diagnostic: string) => {
    onChange(value.filter(d => d !== diagnostic));
  };

  const filteredDiagnostics = diagnosticsList.filter(diag =>
    diag.toLowerCase().includes(search.toLowerCase()) &&
    !value.includes(diag)
  );

  return (
    <div className="space-y-2">
      {/* Selected diagnostics as pills */}
      <div className="flex flex-wrap gap-2">
        {value.map((diag) => (
          <Badge
            key={diag}
            variant="secondary"
            className="px-3 py-1 cursor-pointer hover:bg-gray-200"
            onClick={() => removeDiagnostic(diag)}
          >
            {diag} ×
          </Badge>
        ))}
      </div>

      {/* ComboBox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            Ajouter un diagnostic...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Rechercher un diagnostic..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {search ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleAddNew}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter "{search}"
                  </Button>
                ) : (
                  "Aucun diagnostic trouvé."
                )}
              </CommandEmpty>
              <CommandGroup heading="Diagnostics existants">
                {filteredDiagnostics.map((diag) => (
                  <CommandItem
                    key={diag}
                    value={diag}
                    onSelect={() => handleSelect(diag)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(diag) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {diag}
                  </CommandItem>
                ))}
              </CommandGroup>
              {search && !filteredDiagnostics.some(d => d.toLowerCase() === search.toLowerCase()) && (
                <CommandGroup heading="Nouveau diagnostic">
                  <CommandItem onSelect={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter "{search}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}