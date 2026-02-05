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
import { PrenatalRecord, ANEMY_OPTIONS, IRON_FOLIC_OPTIONS } from "../types";
import { createPrenatalRecord, updatePrenatalRecord } from "../actions";

interface PrenatalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: PrenatalRecord | null;
  onSuccess: () => void;
}

// Define a type for form data
interface FormDataState {
  fileNumber: string;
  fullName: string;
  patientAge: string;
  pregnancyAge: string;
  visitCPN1: string;
  visitCPN2: string;
  visitCPN3: string;
  visitCPN4: string;
  iron_folicAcidDose1: boolean;
  iron_folicAcidDose2: boolean;
  iron_folicAcidDose3: boolean;
  sulfoxadin_pyrinDose1: boolean;
  sulfoxadin_pyrinDose2: boolean;
  sulfoxadin_pyrinDose3: boolean;
  anemy: string;
  iron_folicAcid: string;
  obeservations: string;
}

export function PrenatalFormModal({
  open,
  onOpenChange,
  record,
  onSuccess,
}: PrenatalFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataState>({
    fileNumber: "",
    fullName: "",
    patientAge: "",
    pregnancyAge: "",
    visitCPN1: "",
    visitCPN2: "",
    visitCPN3: "",
    visitCPN4: "",
    iron_folicAcidDose1: false,
    iron_folicAcidDose2: false,
    iron_folicAcidDose3: false,
    sulfoxadin_pyrinDose1: false,
    sulfoxadin_pyrinDose2: false,
    sulfoxadin_pyrinDose3: false,
    anemy: "none",
    iron_folicAcid: "none",
    obeservations: "",
  });

  // Initialize form when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        fileNumber: record.fileNumber || "",
        fullName: record.fullName || "",
        patientAge: record.patientAge || "",
        pregnancyAge: record.pregnancyAge || "",
        visitCPN1: record.visitCPN1 || "",
        visitCPN2: record.visitCPN2 || "",
        visitCPN3: record.visitCPN3 || "",
        visitCPN4: record.visitCPN4 || "",
        iron_folicAcidDose1: record.iron_folicAcidDose1 || false,
        iron_folicAcidDose2: record.iron_folicAcidDose2 || false,
        iron_folicAcidDose3: record.iron_folicAcidDose3 || false,
        sulfoxadin_pyrinDose1: record.sulfoxadin_pyrinDose1 || false,
        sulfoxadin_pyrinDose2: record.sulfoxadin_pyrinDose2 || false,
        sulfoxadin_pyrinDose3: record.sulfoxadin_pyrinDose3 || false,
        anemy: record.anemy || "none",
        iron_folicAcid: record.iron_folicAcid || "none",
        obeservations: record.obeservations || "",
      });
    } else {
      // Reset form for new record
      setFormData({
        fileNumber: "",
        fullName: "",
        patientAge: "",
        pregnancyAge: "",
        visitCPN1: "",
        visitCPN2: "",
        visitCPN3: "",
        visitCPN4: "",
        iron_folicAcidDose1: false,
        iron_folicAcidDose2: false,
        iron_folicAcidDose3: false,
        sulfoxadin_pyrinDose1: false,
        sulfoxadin_pyrinDose2: false,
        sulfoxadin_pyrinDose3: false,
        anemy: "none",
        iron_folicAcid: "none",
        obeservations: "",
      });
    }
    setError(null);
  }, [record, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataObj = new FormData();
    
    // Basic info
    formDataObj.append("fileNumber", formData.fileNumber);
    formDataObj.append("fullName", formData.fullName);
    formDataObj.append("patientAge", formData.patientAge);
    formDataObj.append("pregnancyAge", formData.pregnancyAge);
    formDataObj.append("visitCPN1", formData.visitCPN1);
    formDataObj.append("visitCPN2", formData.visitCPN2);
    formDataObj.append("visitCPN3", formData.visitCPN3);
    formDataObj.append("visitCPN4", formData.visitCPN4);
    
    // Boolean fields
    formDataObj.append("iron_folicAcidDose1", formData.iron_folicAcidDose1.toString());
    formDataObj.append("iron_folicAcidDose2", formData.iron_folicAcidDose2.toString());
    formDataObj.append("iron_folicAcidDose3", formData.iron_folicAcidDose3.toString());
    formDataObj.append("sulfoxadin_pyrinDose1", formData.sulfoxadin_pyrinDose1.toString());
    formDataObj.append("sulfoxadin_pyrinDose2", formData.sulfoxadin_pyrinDose2.toString());
    formDataObj.append("sulfoxadin_pyrinDose3", formData.sulfoxadin_pyrinDose3.toString());
    
    // Select fields
    formDataObj.append("anemy", formData.anemy);
    formDataObj.append("iron_folicAcid", formData.iron_folicAcid);
    formDataObj.append("obeservations", formData.obeservations);

    try {
      let result;
      if (record) {
        result = await updatePrenatalRecord(record.id, formDataObj);
      } else {
        result = await createPrenatalRecord(formDataObj);
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

  const handleChange = (field: keyof FormDataState, value: string | boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const handleDateChange = (field: keyof FormDataState, value: string) => {
    // Format date to YYYY-MM-DD for input type="date"
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {record ? "Modifier Consultation" : "Nouvelle Consultation Prénatale"}
            </DialogTitle>
            <DialogDescription>
              {record 
                ? "Modifier les informations de la consultation prénatale"
                : "Créer une nouvelle consultation prénatale (CPN)"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-md border border-rose-200">
              {error}
            </div>
          )}

          <div className="space-y-6 py-4">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations de la Patiente</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileNumber">Numéro de dossier</Label>
                  <Input
                    id="fileNumber"
                    value={formData.fileNumber}
                    onChange={(e) => handleChange("fileNumber", e.target.value)}
                    placeholder="Ex: PRN-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Nom de la patiente"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientAge">Âge de la patiente</Label>
                  <Input
                    id="patientAge"
                    value={formData.patientAge}
                    onChange={(e) => handleChange("patientAge", e.target.value)}
                    placeholder="Ex: 28 ans"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pregnancyAge">Âge de la grossesse (semaines)</Label>
                  <Input
                    id="pregnancyAge"
                    type="number"
                    min="0"
                    max="42"
                    value={formData.pregnancyAge}
                    onChange={(e) => handleChange("pregnancyAge", e.target.value)}
                    placeholder="Ex: 24"
                  />
                </div>
              </div>
            </div>

            {/* CPN Visits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Consultations Prénatales (CPN)</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visitCPN1">CPN1 Date</Label>
                  <Input
                    id="visitCPN1"
                    type="date"
                    value={formData.visitCPN1}
                    onChange={(e) => handleDateChange("visitCPN1", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitCPN2">CPN2 Date</Label>
                  <Input
                    id="visitCPN2"
                    type="date"
                    value={formData.visitCPN2}
                    onChange={(e) => handleDateChange("visitCPN2", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitCPN3">CPN3 Date</Label>
                  <Input
                    id="visitCPN3"
                    type="date"
                    value={formData.visitCPN3}
                    onChange={(e) => handleDateChange("visitCPN3", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitCPN4">CPN4 Date</Label>
                  <Input
                    id="visitCPN4"
                    type="date"
                    value={formData.visitCPN4}
                    onChange={(e) => handleDateChange("visitCPN4", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Traitements et Médications</h3>
              
              {/* Iron/Folic Acid */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Fer + Acide Folique</h4>
                <div className="grid grid-cols-3 gap-4">
                  {["Dose 1", "Dose 2", "Dose 3"].map((dose, index) => {
                    const field = `iron_folicAcidDose${index + 1}` as keyof FormDataState;
                    return (
                      <div key={dose} className="flex items-center space-x-2">
                        <Checkbox
                          id={field}
                          checked={formData[field] as boolean}
                          onCheckedChange={(checked) => 
                            handleChange(field, checked === true)
                          }
                        />
                        <Label htmlFor={field}>{dose}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sulfoxadin/Pyrin */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Sulfadoxine-Pyriméthamine</h4>
                <div className="grid grid-cols-3 gap-4">
                  {["Dose 1", "Dose 2", "Dose 3"].map((dose, index) => {
                    const field = `sulfoxadin_pyrinDose${index + 1}` as keyof FormDataState;
                    return (
                      <div key={dose} className="flex items-center space-x-2">
                        <Checkbox
                          id={field}
                          checked={formData[field] as boolean}
                          onCheckedChange={(checked) => 
                            handleChange(field, checked === true)
                          }
                        />
                        <Label htmlFor={field}>{dose}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Select Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="anemy">Anémie</Label>
                  <Select
                    value={formData.anemy}
                    onValueChange={(value) => handleChange("anemy", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ANEMY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iron_folicAcid">Fer + Acide Folique</Label>
                  <Select
                    value={formData.iron_folicAcid}
                    onValueChange={(value) => handleChange("iron_folicAcid", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {IRON_FOLIC_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Observations</h3>
              <div className="space-y-2">
                <Label htmlFor="obeservations">Notes et observations</Label>
                <Textarea
                  id="obeservations"
                  value={formData.obeservations}
                  onChange={(e) => handleChange("obeservations", e.target.value)}
                  placeholder="Notes cliniques, observations, recommandations..."
                  rows={4}
                />
              </div>
            </div>
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
                ? (record ? "Modification..." : "Création...")
                : (record ? "Modifier" : "Créer")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}