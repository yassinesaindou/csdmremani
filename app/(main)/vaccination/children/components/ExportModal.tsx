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
import { VaccinationEnfant } from "../types";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: VaccinationEnfant[];
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
        ID: item.id,
        Date: format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", {
          locale: fr,
        }),
        Nom: item.name || "Non renseigné",
        "Âge (mois)": item.age || "—",
        Sexe:
          item.sex === "M" ? "Masculin" : item.sex === "F" ? "Féminin" : "—",
        Origine: item.origin || "—",
        Adresse: item.address || "—",
        "Poids (kg)": item.weight || "—",
        "Taille (cm)": item.height || "—",
        Stratégie: item.strategy ? item.strategy.replace("_", " ") : "—",
        "Vitamine A": item.receivedVitamineA ? "Oui" : "Non",
        AlBendazole: item.receivedAlBendazole ? "Oui" : "Non",
        BCG:
          item.BCG === "fait"
            ? "Fait"
            : item.BCG === "non_fait"
            ? "Non fait"
            : item.BCG === "contre_indication"
            ? "Contre-indication"
            : "—",
        TD0:
          item.TD0 === "fait"
            ? "Fait"
            : item.TD0 === "non_fait"
            ? "Non fait"
            : item.TD0 === "contre_indication"
            ? "Contre-indication"
            : "—",
        TD1:
          item.TD1 === "fait"
            ? "Fait"
            : item.TD1 === "non_fait"
            ? "Non fait"
            : item.TD1 === "contre_indication"
            ? "Contre-indication"
            : "—",
        TD2:
          item.TD2 === "fait"
            ? "Fait"
            : item.TD2 === "non_fait"
            ? "Non fait"
            : item.TD2 === "contre_indication"
            ? "Contre-indication"
            : "—",
        TD3:
          item.TD3 === "fait"
            ? "Fait"
            : item.TD3 === "non_fait"
            ? "Non fait"
            : item.TD3 === "contre_indication"
            ? "Contre-indication"
            : "—",
        VP1:
          item.VP1 === "fait"
            ? "Fait"
            : item.VP1 === "non_fait"
            ? "Non fait"
            : item.VP1 === "contre_indication"
            ? "Contre-indication"
            : "—",
        Penta1:
          item.Penta1 === "fait"
            ? "Fait"
            : item.Penta1 === "non_fait"
            ? "Non fait"
            : item.Penta1 === "contre_indication"
            ? "Contre-indication"
            : "—",
        Penta2:
          item.Penta2 === "fait"
            ? "Fait"
            : item.Penta2 === "non_fait"
            ? "Non fait"
            : item.Penta2 === "contre_indication"
            ? "Contre-indication"
            : "—",
        Penta3:
          item.Penta3 === "fait"
            ? "Fait"
            : item.Penta3 === "non_fait"
            ? "Non fait"
            : item.Penta3 === "contre_indication"
            ? "Contre-indication"
            : "—",
        RR1:
          item.RR1 === "fait"
            ? "Fait"
            : item.RR1 === "non_fait"
            ? "Non fait"
            : item.RR1 === "contre_indication"
            ? "Contre-indication"
            : "—",
        RR2:
          item.RR2 === "fait"
            ? "Fait"
            : item.RR2 === "non_fait"
            ? "Non fait"
            : item.RR2 === "contre_indication"
            ? "Contre-indication"
            : "—",
        ECV:
          item.ECV === "fait"
            ? "Fait"
            : item.ECV === "non_fait"
            ? "Non fait"
            : item.ECV === "contre_indication"
            ? "Contre-indication"
            : "—",
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const maxWidth = excelData.reduce((width, row) => {
        return Math.max(
          width,
          ...Object.values(row).map((v) => String(v).length)
        );
      }, 10);

      ws["!cols"] = Array(Object.keys(excelData[0] || {}).length).fill({
        wch: maxWidth,
      });

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Vaccinations Enfants");

      // Generate filename with date range
      let filename = "vaccinations_enfants";
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
            Sélectionnez une période pour exporter les vaccinations. Laissez
            vide pour tout exporter.
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
                    )}>
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
                    )}>
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
            <span>{data.length} vaccination(s) disponibles</span>
            <button
              onClick={handleResetDates}
              className="text-emerald-600 hover:text-emerald-800 underline">
              Réinitialiser les dates
            </button>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={loading || (startDate && endDate && startDate > endDate)}
            className="bg-emerald-600 hover:bg-emerald-700">
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
