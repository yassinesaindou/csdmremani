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
import { FamilyPlanningRecord } from "../types";
import * as XLSX from "xlsx";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: FamilyPlanningRecord[];
}

export function ExportModal({ open, onOpenChange, data }: ExportModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

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

  // Helper function to get type label
  const getTypeLabel = (isNew: boolean | null): string => {
    if (isNew === true) return 'Nouveau';
    if (isNew === false) return 'Renouvellement';
    return '—';
  };

  // Calculate totals for each contraceptive method
  const calculateTotals = (records: FamilyPlanningRecord[]) => {
    const totals = {
      new_noristerat: 0,
      new_microlut: 0,
      new_microgynon: 0,
      new_emergencyPill: 0,
      new_maleCondom: 0,
      new_femaleCondom: 0,
      new_IUD: 0,
      new_implano_explano: 0,
      renewal_noristerat: 0,
      renewal_microgynon: 0,
      renewal_lofemanal: 0,
      renewal_maleCondom: 0,
      renewal_femaleCondom: 0,
      renewal_IUD: 0,
      renewal_implants: 0,
    };

    records.forEach(record => {
      totals.new_noristerat += record.new_noristerat || 0;
      totals.new_microlut += record.new_microlut || 0;
      totals.new_microgynon += record.new_microgynon || 0;
      totals.new_emergencyPill += record.new_emergencyPill || 0;
      totals.new_maleCondom += record.new_maleCondom || 0;
      totals.new_femaleCondom += record.new_femaleCondom || 0;
      totals.new_IUD += record.new_IUD || 0;
      totals.new_implano_explano += record.new_implano_explano || 0;
      totals.renewal_noristerat += record.renewal_noristerat || 0;
      totals.renewal_microgynon += record.renewal_microgynon || 0;
      totals.renewal_lofemanal += record.renewal_lofemanal || 0;
      totals.renewal_maleCondom += record.renewal_maleCondom || 0;
      totals.renewal_femaleCondom += record.renewal_femaleCondom || 0;
      totals.renewal_IUD += record.renewal_IUD || 0;
      totals.renewal_implants += record.renewal_implants || 0;
    });

    return totals;
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

      // Calculate totals
      const totals = calculateTotals(filteredData);

      // Create two worksheets: detailed records and summary
      const detailedData = filteredData.map((item) => ({
        "ID Consultation": item.id,
        "Numéro de dossier": item.fileNumber || "—",
        "Nom complet": item.fullName || "—",
        "Âge": item.age || "—",
        "Adresse": item.address || "—",
        "Origine": getOriginLabel(item.origin),
        "Type": getTypeLabel(item.isNew),
        // New contraceptive methods
        "Noristérat (Nouveau)": item.new_noristerat || 0,
        "Microlut (Nouveau)": item.new_microlut || 0,
        "Microgynon (Nouveau)": item.new_microgynon || 0,
        "Pilule du lendemain (Nouveau)": item.new_emergencyPill || 0,
        "Préservatif masculin (Nouveau)": item.new_maleCondom || 0,
        "Préservatif féminin (Nouveau)": item.new_femaleCondom || 0,
        "DIU (Nouveau)": item.new_IUD || 0,
        "Implanon/Explanon (Nouveau)": item.new_implano_explano || 0,
        // Renewal contraceptive methods
        "Noristérat (Renouvellement)": item.renewal_noristerat || 0,
        "Microgynon (Renouvellement)": item.renewal_microgynon || 0,
        "Loféminal (Renouvellement)": item.renewal_lofemanal || 0,
        "Préservatif masculin (Renouvellement)": item.renewal_maleCondom || 0,
        "Préservatif féminin (Renouvellement)": item.renewal_femaleCondom || 0,
        "DIU (Renouvellement)": item.renewal_IUD || 0,
        "Implants (Renouvellement)": item.renewal_implants || 0,
        "Date création": format(new Date(item.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: fr }),
        "Dernière modification": item.updatedAt 
          ? format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })
          : "—",
      }));

      // Summary data
      const summaryData = [
        ["RÉSUMÉ DES CONTRACEPTIFS"],
        [],
        ["NOUVEAUX CONTRACEPTIFS", "QUANTITÉ"],
        ["Noristérat", totals.new_noristerat],
        ["Microlut", totals.new_microlut],
        ["Microgynon", totals.new_microgynon],
        ["Pilule du lendemain", totals.new_emergencyPill],
        ["Préservatif masculin", totals.new_maleCondom],
        ["Préservatif féminin", totals.new_femaleCondom],
        ["DIU", totals.new_IUD],
        ["Implanon/Explanon", totals.new_implano_explano],
        [],
        ["RENOUVELLEMENTS", "QUANTITÉ"],
        ["Noristérat", totals.renewal_noristerat],
        ["Microgynon", totals.renewal_microgynon],
        ["Loféminal", totals.renewal_lofemanal],
        ["Préservatif masculin", totals.renewal_maleCondom],
        ["Préservatif féminin", totals.renewal_femaleCondom],
        ["DIU", totals.renewal_IUD],
        ["Implants", totals.renewal_implants],
        [],
        ["TOTAL GÉNÉRAL"],
        ["Nouveaux contraceptifs", 
          totals.new_noristerat + totals.new_microlut + totals.new_microgynon + 
          totals.new_emergencyPill + totals.new_maleCondom + totals.new_femaleCondom + 
          totals.new_IUD + totals.new_implano_explano
        ],
        ["Renouvellements", 
          totals.renewal_noristerat + totals.renewal_microgynon + totals.renewal_lofemanal + 
          totals.renewal_maleCondom + totals.renewal_femaleCondom + 
          totals.renewal_IUD + totals.renewal_implants
        ],
        ["Total consultations", filteredData.length],
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
      XLSX.utils.book_append_sheet(wb, wsDetailed, "Consultations détaillées");
      XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé statistique");

      // Generate filename with date range
      let filename = "planning_familial_maternite";
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
            Sélectionnez une période pour exporter les consultations de planning familial. Laissez vide pour tout exporter.
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
              {data.length} consultation(s) disponibles
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