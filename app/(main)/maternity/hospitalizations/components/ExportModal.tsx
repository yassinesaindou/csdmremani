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
import { MaternityHospitalization } from "../types";
import * as XLSX from "xlsx";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MaternityHospitalization[];
}

export function ExportModal({ open, onOpenChange, data }: ExportModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  // Helper functions for labels
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

  const getSexLabel = (sex: string | null): string => {
    switch (sex) {
      case 'M':
        return 'Masculin';
      case 'F':
        return 'Féminin';
      default:
        return sex || '—';
    }
  };

  const getBooleanLabel = (value: boolean | null): string => {
    if (value === true) return 'Oui';
    if (value === false) return 'Non';
    return '—';
  };

  const getLeaveStatusLabel = (hospitalization: MaternityHospitalization): string => {
    if (hospitalization.leave_authorized) return 'Sortie autorisée';
    if (hospitalization.leave_evaded) return 'Sortie par évasion';
    if (hospitalization.leave_transfered) return 'Sortie par transfert';
    if (hospitalization.leave_diedBefore48h) return 'Décès avant 48h';
    if (hospitalization.leave_diedAfter48h) return 'Décès après 48h';
    return 'En cours';
  };

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

      // Prepare detailed data for Excel
      const detailedData = filteredData.map((item) => ({
        "ID Hospitalisation": item.hospitalizationId,
        "Nom complet": item.fullName || "—",
        "Âge": item.age || "—",
        "Sexe": getSexLabel(item.sex),
        "Origine": getOriginLabel(item.origin),
        "Urgence": getBooleanLabel(item.isEmergency),
        "Diagnostic d'entrée": item.entryDiagnostic || "—",
        "Diagnostic de sortie": item.leavingDiagnostic || "—",
        "Enceinte": getBooleanLabel(item.isPregnant),
        "Statut de sortie": getLeaveStatusLabel(item),
        // Detailed leave status
        "Sortie autorisée": getBooleanLabel(item.leave_authorized),
        "Sortie par évasion": getBooleanLabel(item.leave_evaded),
        "Sortie par transfert": getBooleanLabel(item.leave_transfered),
        "Décès avant 48h": getBooleanLabel(item.leave_diedBefore48h),
        "Décès après 48h": getBooleanLabel(item.leave_diedAfter48h),
        "Date création": format(new Date(item.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: fr }),
        "Dernière modification": item.updatedAt 
          ? format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })
          : "—",
      }));

      // Calculate statistics for summary sheet
      const stats = {
        total: filteredData.length,
        emergency: filteredData.filter(item => item.isEmergency).length,
        pregnant: filteredData.filter(item => item.isPregnant).length,
        male: filteredData.filter(item => item.sex === 'M').length,
        female: filteredData.filter(item => item.sex === 'F').length,
        active: filteredData.filter(item => 
          !item.leave_authorized && 
          !item.leave_evaded && 
          !item.leave_transfered && 
          !item.leave_diedBefore48h && 
          !item.leave_diedAfter48h
        ).length,
        authorized: filteredData.filter(item => item.leave_authorized).length,
        evaded: filteredData.filter(item => item.leave_evaded).length,
        transfered: filteredData.filter(item => item.leave_transfered).length,
        diedBefore48h: filteredData.filter(item => item.leave_diedBefore48h).length,
        diedAfter48h: filteredData.filter(item => item.leave_diedAfter48h).length,
      };

      // Summary data
      const summaryData = [
        ["STATISTIQUES DES HOSPITALISATIONS"],
        [],
        ["TOTAL", "VALEUR"],
        ["Hospitalisations totales", stats.total],
        ["Cas d'urgence", stats.emergency],
        ["Patient(e)s enceintes", stats.pregnant],
        [],
        ["RÉPARTITION PAR SEXE"],
        ["Masculin", stats.male],
        ["Féminin", stats.female],
        [],
        ["STATUT DE SORTIE"],
        ["En cours d'hospitalisation", stats.active],
        ["Sortie autorisée", stats.authorized],
        ["Sortie par évasion", stats.evaded],
        ["Sortie par transfert", stats.transfered],
        ["Décès avant 48h", stats.diedBefore48h],
        ["Décès après 48h", stats.diedAfter48h],
        [],
        ["TOTAL SORTIES", stats.authorized + stats.evaded + stats.transfered + stats.diedBefore48h + stats.diedAfter48h],
        ["TOTAL DÉCÈS", stats.diedBefore48h + stats.diedAfter48h],
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Detailed records worksheet
      const wsDetailed = XLSX.utils.json_to_sheet(detailedData);
      
      // Summary worksheet
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Auto-size columns for detailed sheet
      const maxWidth = detailedData.reduce((width, row) => {
        return Math.max(width, ...Object.values(row).map(v => String(v).length));
      }, 10);
      wsDetailed["!cols"] = Array(Object.keys(detailedData[0] || {}).length).fill({ wch: maxWidth });
      
      // Set column widths for summary sheet
      wsSummary["!cols"] = [{ wch: 30 }, { wch: 15 }];

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(wb, wsDetailed, "Hospitalisations détaillées");
      XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé statistique");

      // Generate filename with date range
      let filename = "hospitalisations_maternite";
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
            Exporter les hospitalisations
          </DialogTitle>
          <DialogDescription>
            Sélectionnez une période pour exporter les hospitalisations. Laissez vide pour tout exporter.
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
              {data.length} hospitalisation(s) disponibles
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