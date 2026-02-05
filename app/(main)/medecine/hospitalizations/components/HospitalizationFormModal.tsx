/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
 
import { createHospitalization, updateHospitalization } from "../actions";
import { DiagnosticsComboBox } from "./DiagnosticsComboBox";
import { MedicineHospitalization } from "../types";
 

interface HospitalizationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitalization?: MedicineHospitalization | null;
  onSuccess: () => void;
}

export function HospitalizationFormModal({
  open,
  onOpenChange,
  hospitalization,
  onSuccess,
}: HospitalizationFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryDiagnostics, setEntryDiagnostics] = useState<string[]>([]);
  const [leavingDiagnostics, setLeavingDiagnostics] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    sex: "M" as "M" | "F",
    origin: "HD" as "HD" | "DS",
    isEmergency: false,
    isPregnant: false,
    leave_authorized: false,
    leave_evaded: false,
    leave_transfered: false,
    leave_diedBefore48h: false,
    leave_diedAfter48h: false,
    leavingDate: "",
  });

  // Initialize form when hospitalization changes
  useEffect(() => {
    if (hospitalization) {
      setFormData({
        fullName: hospitalization.fullName || "",
        age: hospitalization.age || "",
        sex: hospitalization.sex || "M",
        origin: hospitalization.origin || "HD",
        isEmergency: hospitalization.isEmergency ?? false,
        isPregnant: hospitalization.isPregnant ?? false,
        leave_authorized: hospitalization.leave_authorized ?? false,
        leave_evaded: hospitalization.leave_evaded ?? false,
        leave_transfered: hospitalization.leave_transfered ?? false,
        leave_diedBefore48h: hospitalization.leave_diedBefore48h ?? false,
        leave_diedAfter48h: hospitalization.leave_diedAfter48h ?? false,
        leavingDate: hospitalization.leavingDate || "",
      });
      
      // Parse diagnostics from comma-separated strings
      setEntryDiagnostics(
        hospitalization.entryDiagnostic 
          ? hospitalization.entryDiagnostic.split(",").map((d: any) => d.trim()).filter((d:any) => d)
          : []
      );
      setLeavingDiagnostics(
        hospitalization.leavingDiagnostic 
          ? hospitalization.leavingDiagnostic.split(",").map((d: any) => d.trim()).filter((d: any) => d)
          : []
      );
    } else {
      // Reset form for new hospitalization
      setFormData({
        fullName: "",
        age: "",
        sex: "M",
        origin: "HD",
        isEmergency: false,
        isPregnant: false,
        leave_authorized: false,
        leave_evaded: false,
        leave_transfered: false,
        leave_diedBefore48h: false,
        leave_diedAfter48h: false,
        leavingDate: "",
      });
      setEntryDiagnostics([]);
      setLeavingDiagnostics([]);
    }
    setError(null);
  }, [hospitalization, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value.toString());
    });
    // Join diagnostics arrays into comma-separated strings
    formDataObj.append("entryDiagnostic", entryDiagnostics.join(", "));
    formDataObj.append("leavingDiagnostic", leavingDiagnostics.join(", "));

    try {
      let result;
      if (hospitalization) {
        result = await updateHospitalization(hospitalization.hospitalizationId, formDataObj);
      } else {
        result = await createHospitalization(formDataObj);
      }

      if (result.success) {
        onOpenChange(false);
        onSuccess();
      } else {
        setError(result.error || "Erreur lors de l'opération");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Reset leave status when one is selected (mutually exclusive)
  const handleLeaveStatusChange = (field: string, value: boolean) => {
    if (value) {
      // Reset all other leave statuses
      const newFormData = {
        ...formData,
        leave_authorized: false,
        leave_evaded: false,
        leave_transfered: false,
        leave_diedBefore48h: false,
        leave_diedAfter48h: false,
        [field]: value,
      };
      setFormData(newFormData);
    } else {
      handleChange(field, value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {hospitalization ? "Modifier Hospitalisation" : "Nouvelle Hospitalisation"}
            </DialogTitle>
            <DialogDescription>
              {hospitalization 
                ? "Modifier les informations d'hospitalisation"
                : "Enregistrer une nouvelle hospitalisation en médecine"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-md border border-rose-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations du Patient</h3>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Nom complet du patient"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Âge</Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    placeholder="Ex: 45 ans"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sex">Sexe</Label>
                  <Select
                    value={formData.sex}
                    onValueChange={(value: "M" | "F") => handleChange("sex", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Origine</Label>
                <Select
                  value={formData.origin}
                  onValueChange={(value: "HD" | "DS") => handleChange("origin", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HD">HD</SelectItem>
                    <SelectItem value="DS">DS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEmergency"
                  checked={formData.isEmergency}
                  onCheckedChange={(checked: any) => handleChange("isEmergency", checked)}
                />
                <Label htmlFor="isEmergency">Cas d'urgence</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPregnant"
                  checked={formData.isPregnant}
                  onCheckedChange={(checked: any) => handleChange("isPregnant", checked)}
                />
                <Label htmlFor="isPregnant">Patient enceinte</Label>
              </div>

              {/* Leaving Date Field */}
              <div className="space-y-2">
                <Label htmlFor="leavingDate">Date de sortie</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.leavingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.leavingDate ? (
                        format(new Date(formData.leavingDate), "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.leavingDate ? new Date(formData.leavingDate) : undefined}
                      onSelect={(date) => handleChange("leavingDate", date?.toISOString() || "")}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations Médicales</h3>
              
              <div className="space-y-2">
                <Label htmlFor="entryDiagnostic">Diagnostic d'entrée</Label>
                <DiagnosticsComboBox
                  value={entryDiagnostics}
                  onChange={setEntryDiagnostics}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leavingDiagnostic">Diagnostic de sortie</Label>
                <DiagnosticsComboBox
                  value={leavingDiagnostics}
                  onChange={setLeavingDiagnostics}
                />
              </div>
            </div>
          </div>

          {/* Leave Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Statut de Sortie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leave_authorized"
                  checked={formData.leave_authorized}
                  onCheckedChange={(checked: any) => handleLeaveStatusChange("leave_authorized", checked)}
                />
                <Label htmlFor="leave_authorized">Sortie autorisée</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leave_evaded"
                  checked={formData.leave_evaded}
                  onCheckedChange={(checked: any) => handleLeaveStatusChange("leave_evaded", checked)}
                />
                <Label htmlFor="leave_evaded">Sortie par évasion</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leave_transfered"
                  checked={formData.leave_transfered}
                  onCheckedChange={(checked: any) => handleLeaveStatusChange("leave_transfered", checked)}
                />
                <Label htmlFor="leave_transfered">Sortie par transfert</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leave_diedBefore48h"
                  checked={formData.leave_diedBefore48h}
                  onCheckedChange={(checked: any) => handleLeaveStatusChange("leave_diedBefore48h", checked)}
                />
                <Label htmlFor="leave_diedBefore48h">Décès avant 48h</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leave_diedAfter48h"
                  checked={formData.leave_diedAfter48h}
                  onCheckedChange={(checked: any) => handleLeaveStatusChange("leave_diedAfter48h", checked)}
                />
                <Label htmlFor="leave_diedAfter48h">Décès après 48h</Label>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Sélectionnez un seul statut de sortie
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (hospitalization ? "Modification..." : "Création...")
                : (hospitalization ? "Modifier" : "Créer")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}