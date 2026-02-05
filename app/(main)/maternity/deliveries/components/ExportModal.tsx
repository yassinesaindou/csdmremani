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
import { MaternityDelivery } from "../types";
import * as XLSX from "xlsx";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MaternityDelivery[];
}

export function ExportModal({ open, onOpenChange, data }: ExportModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  // Helper function to determine delivery type
  const getDeliveryType = (delivery: MaternityDelivery): string => {
    if (delivery.delivery_eutocic) return "Eutocique";
    if (delivery.delivery_dystocic) return "Dystocique";
    if (delivery.delivery_transfert) return "Transfert";
    return "—";
  };

  // Helper function to get origin label
  const getOriginLabel = (origin: string | null): string => {
    switch (origin) {
      case 'HD':
        return 'HD';
      case 'DS':
        return 'DS';
      default:
        return origin || '—';
    }
  };

  const handleExport = () => {
    setLoading(true);
    
    try {
      // Filter data by date range if dates are selected
      let filteredData = data;
      if (startDate || endDate) {
        filteredData = data.filter((item) => {
          if (!item.delivery_dateTime) return false;
          const itemDate = new Date(item.delivery_dateTime);
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
        "ID Accouchement": item.deliveryId,
        "Numéro de dossier": item.fileNumber || "—",
        "Nom complet": item.fullName || "—",
        "Adresse": item.address || "—",
        "Origine": getOriginLabel(item.origin),
        "Date de travail": item.workTime 
          ? format(new Date(item.workTime), "dd/MM/yyyy HH:mm", { locale: fr })
          : "—",
        "Date d'accouchement": item.delivery_dateTime 
          ? format(new Date(item.delivery_dateTime), "dd/MM/yyyy HH:mm", { locale: fr })
          : "—",
        "Type d'accouchement": getDeliveryType(item),
        "Poids (kg)": item.weight || "—",
        "Nouveau-né(s) vivant(s)": item.newBorn_living || 0,
        "Nouveau-né(s) < 2.5kg": item.newBorn_lessThan2point5kg || 0,
        "Nombre de décès": item.numberOfDeaths || 0,
        "Décès < 24h": item.numberOfDeaths_before24hours || 0,
        "Décès < 7 jours": item.numberOfDeaths_before7Days || 0,
        "Mère décédée": item.isMotherDead ? "Oui" : "Non",
        "Transfert": item.transfer || "—",
        "Date de sortie": item.leavingDate 
          ? format(new Date(item.leavingDate), "dd/MM/yyyy", { locale: fr })
          : "—",
        "Observations": item.observations || "—",
        "Date création": format(new Date(item.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: fr }),
        "Dernière modification": item.updatedAt 
          ? format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })
          : "—",
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
      XLSX.utils.book_append_sheet(wb, ws, "Accouchements Maternité");

      // Generate filename with date range
      let filename = "accouchements_maternite";
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
            Exporter les accouchements
          </DialogTitle>
          <DialogDescription>
            Sélectionnez une période pour exporter les accouchements. Laissez vide pour tout exporter.
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
              {data.length} accouchement(s) disponibles
            </span>
            <button
              onClick={handleResetDates}
              className="text-emerald-600 hover:text-emerald-800 underline"
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
            className="bg-emerald-600 hover:bg-emerald-700"
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