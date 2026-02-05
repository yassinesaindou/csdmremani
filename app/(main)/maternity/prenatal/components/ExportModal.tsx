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
import { PrenatalRecord } from "../types";
import * as XLSX from "xlsx";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PrenatalRecord[];
}

export function ExportModal({ open, onOpenChange, data }: ExportModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  // Helper functions for labels
  const getBooleanLabel = (value: boolean | null): string => {
    if (value === true) return 'Oui';
    if (value === false) return 'Non';
    return '—';
  };

  const getAnemiaLabel = (anemia: string | null): string => {
    switch (anemia) {
      case 'none':
        return 'Aucune';
      case 'mild':
        return 'Légère';
      case 'moderate':
        return 'Modérée';
      case 'severe':
        return 'Sévère';
      default:
        return anemia || '—';
    }
  };

  const getIronFolicLabel = (iron: string | null): string => {
    switch (iron) {
      case 'none':
        return 'Aucun';
      case 'prescribed':
        return 'Prescrit';
      case 'administered':
        return 'Administré';
      case 'completed':
        return 'Complété';
      default:
        return iron || '—';
    }
  };

  const getVisitDateLabel = (date: string | null): string => {
    return date ? format(new Date(date), "dd/MM/yyyy", { locale: fr }) : "—";
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
        "ID Consultation": item.id,
        "Numéro de dossier": item.fileNumber || "—",
        "Nom complet": item.fullName || "—",
        "Âge patiente": item.patientAge || "—",
        "Âge grossesse": item.pregnancyAge || "—",
        // CPN Visits
        "Date CPN1": getVisitDateLabel(item.visitCPN1),
        "Date CPN2": getVisitDateLabel(item.visitCPN2),
        "Date CPN3": getVisitDateLabel(item.visitCPN3),
        "Date CPN4": getVisitDateLabel(item.visitCPN4),
        // Iron/Folic Acid Doses
        "Fer/Acide folique - Dose 1": getBooleanLabel(item.iron_folicAcidDose1),
        "Fer/Acide folique - Dose 2": getBooleanLabel(item.iron_folicAcidDose2),
        "Fer/Acide folique - Dose 3": getBooleanLabel(item.iron_folicAcidDose3),
        // Sulfoxadin/Pyrin Doses
        "Sulfoxadin/Pyrin - Dose 1": getBooleanLabel(item.sulfoxadin_pyrinDose1),
        "Sulfoxadin/Pyrin - Dose 2": getBooleanLabel(item.sulfoxadin_pyrinDose2),
        "Sulfoxadin/Pyrin - Dose 3": getBooleanLabel(item.sulfoxadin_pyrinDose3),
        // Medical Information
        "Anémie": getAnemiaLabel(item.anemy),
        "Traitement Fer/Acide folique": getIronFolicLabel(item.iron_folicAcid),
        "Observations": item.obeservations || "—",
        "Date création": format(new Date(item.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: fr }),
        "Dernière modification": item.updatedAt 
          ? format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })
          : "—",
      }));

      // Calculate statistics for summary sheet
      const stats = {
        total: filteredData.length,
        withCPN1: filteredData.filter(item => item.visitCPN1).length,
        withCPN2: filteredData.filter(item => item.visitCPN2).length,
        withCPN3: filteredData.filter(item => item.visitCPN3).length,
        withCPN4: filteredData.filter(item => item.visitCPN4).length,
        ironDose1: filteredData.filter(item => item.iron_folicAcidDose1).length,
        ironDose2: filteredData.filter(item => item.iron_folicAcidDose2).length,
        ironDose3: filteredData.filter(item => item.iron_folicAcidDose3).length,
        sulfoxadinDose1: filteredData.filter(item => item.sulfoxadin_pyrinDose1).length,
        sulfoxadinDose2: filteredData.filter(item => item.sulfoxadin_pyrinDose2).length,
        sulfoxadinDose3: filteredData.filter(item => item.sulfoxadin_pyrinDose3).length,
        anemiaNone: filteredData.filter(item => item.anemy === 'none' || !item.anemy).length,
        anemiaMild: filteredData.filter(item => item.anemy === 'mild').length,
        anemiaModerate: filteredData.filter(item => item.anemy === 'moderate').length,
        anemiaSevere: filteredData.filter(item => item.anemy === 'severe').length,
        completedAllVisits: filteredData.filter(item => 
          item.visitCPN1 && item.visitCPN2 && item.visitCPN3 && item.visitCPN4
        ).length,
      };

      // Summary data
      const summaryData = [
        ["STATISTIQUES DES CONSULTATIONS PRÉNATALES"],
        [],
        ["TOTAL", "VALEUR"],
        ["Consultations totales", stats.total],
        ["Consultations avec toutes les visites CPN", stats.completedAllVisits],
        [],
        ["RÉPARTITION DES VISITES CPN"],
        ["CPN1 réalisée", stats.withCPN1],
        ["CPN2 réalisée", stats.withCPN2],
        ["CPN3 réalisée", stats.withCPN3],
        ["CPN4 réalisée", stats.withCPN4],
        [],
        ["TRAITEMENTS ADMINISTRÉS"],
        ["Fer/Acide folique - Dose 1", stats.ironDose1],
        ["Fer/Acide folique - Dose 2", stats.ironDose2],
        ["Fer/Acide folique - Dose 3", stats.ironDose3],
        ["Sulfoxadin/Pyrin - Dose 1", stats.sulfoxadinDose1],
        ["Sulfoxadin/Pyrin - Dose 2", stats.sulfoxadinDose2],
        ["Sulfoxadin/Pyrin - Dose 3", stats.sulfoxadinDose3],
        [],
        ["STATUT ANÉMIQUE"],
        ["Aucune anémie", stats.anemiaNone],
        ["Anémie légère", stats.anemiaMild],
        ["Anémie modérée", stats.anemiaModerate],
        ["Anémie sévère", stats.anemiaSevere],
        ["Total avec anémie", stats.anemiaMild + stats.anemiaModerate + stats.anemiaSevere],
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
      wsSummary["!cols"] = [{ wch: 35 }, { wch: 15 }];

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(wb, wsDetailed, "Consultations détaillées");
      XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé statistique");

      // Generate filename with date range
      let filename = "consultations_prenatales_maternite";
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
            Exporter les consultations
          </DialogTitle>
          <DialogDescription>
            Sélectionnez une période pour exporter les consultations prénatales. Laissez vide pour tout exporter.
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
              {data.length} consultation(s) disponible(s)
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