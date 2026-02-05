"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
 
import * as XLSX from "xlsx";
import { VaccinationFemmeEnceinte } from "../types";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: VaccinationFemmeEnceinte[];
}

export function ExportModal({ open, onOpenChange, data }: ExportModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    
    try {
      // Filter data by date range if dates are selected
      let filteredData = data;
      if (startDate || endDate) {
        filteredData = data.filter((item) => {
          const itemDate = new Date(item.createdAt);
          if (startDate && endDate) {
            return itemDate >= startDate && itemDate <= endDate;
          } else if (startDate) {
            return itemDate >= startDate;
          } else if (endDate) {
            return itemDate <= endDate;
          }
          return true;
        });
      }

      // Prepare data for Excel
      const excelData = filteredData.map((item) => ({
        "ID": item.id,
        "Date": format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: fr }),
        "Nom": item.name || "Non renseigné",
        "Mois grossesse": item.month ? `${item.month}ème mois` : "—",
        "Origine": item.origin || "—",
        "Adresse": item.address || "—",
        "Stratégie": item.strategy ? item.strategy.replace('_', ' ') : "—",
        "TD1": item.TD1 === 'fait' ? 'Fait' : item.TD1 === 'non_fait' ? 'Non fait' : item.TD1 === 'contre_indication' ? 'Contre-indication' : "—",
        "TD2": item.TD2 === 'fait' ? 'Fait' : item.TD2 === 'non_fait' ? 'Non fait' : item.TD2 === 'contre_indication' ? 'Contre-indication' : "—",
        "TD3": item.TD3 === 'fait' ? 'Fait' : item.TD3 === 'non_fait' ? 'Non fait' : item.TD3 === 'contre_indication' ? 'Contre-indication' : "—",
        "TD4": item.TD4 === 'fait' ? 'Fait' : item.TD4 === 'non_fait' ? 'Non fait' : item.TD4 === 'contre_indication' ? 'Contre-indication' : "—",
        "TD5": item.TD5 === 'fait' ? 'Fait' : item.TD5 === 'non_fait' ? 'Non fait' : item.TD5 === 'contre_indication' ? 'Contre-indication' : "—",
        "FCV": item.FCV === 'fait' ? 'Fait' : item.FCV === 'non_fait' ? 'Non fait' : item.FCV === 'contre_indication' ? 'Contre-indication' : "—",
        "Vaccins complétés": [item.TD1, item.TD2, item.TD3, item.TD4, item.TD5, item.FCV].filter(v => v === 'fait').length,
        "Total vaccins": 6,
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const maxWidth = excelData.reduce((width, row) => {
        return Math.max(width, ...Object.values(row).map(v => String(v).length));
      }, 10);
      
      ws["!cols"] = Array(Object.keys(excelData[0] || {}).length).fill({ wch: maxWidth });

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Vaccinations Femmes Enceintes");

      // Generate filename with date range
      let filename = "vaccinations_femmes_enceintes";
      if (startDate && endDate) {
        const startStr = format(startDate, "dd-MM-yyyy", { locale: fr });
        const endStr = format(endDate, "dd-MM-yyyy", { locale: fr });
        filename += `_${startStr}_au_${endStr}`;
      } else {
        filename += `_${format(new Date(), "dd-MM-yyyy", { locale: fr })}`;
      }
      filename += ".xlsx";

      // Write to file
      XLSX.writeFile(wb, filename);

      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Erreur lors de l'exportation");
    } finally {
      setLoading(false);
    }
  };

  const handleResetDates = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter les données
          </DialogTitle>
          <DialogDescription>
            Sélectionnez une période pour exporter les vaccinations. Laissez vide pour tout exporter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {startDate && endDate && startDate > endDate && (
            <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-md border border-rose-200">
              La date de début doit être antérieure à la date de fin.
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {data.length} vaccination(s) disponibles
            </span>
            <button
              onClick={handleResetDates}
              className="text-purple-600 hover:text-purple-800 underline"
            >
              Réinitialiser les dates
            </button>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={loading || (startDate && endDate && startDate > endDate)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exportation...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exporter vers Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}