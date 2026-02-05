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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FamilyPlanningRecord } from "../types";
import { createFamilyPlanningRecord, updateFamilyPlanningRecord } from "../actions";
import { CONTRACEPTIVE_METHODS } from "../types";

interface FamilyPlanningFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: FamilyPlanningRecord | null;
  onSuccess: () => void;
}

// Define a type for form data
interface FormDataState {
  fileNumber: string;
  fullName: string;
  age: string;
  origin: "HD" | "DS";
  address: string;
  isNew: boolean;
  // New methods - store as strings for form input
  new_noristerat: string;
  new_microlut: string;
  new_microgynon: string;
  new_emergencyPill: string;
  new_maleCondom: string;
  new_femaleCondom: string;
  new_IUD: string;
  new_implano_explano: string;
  // Renewal methods - store as strings for form input
  renewal_noristerat: string;
  renewal_microgynon: string;
  renewal_lofemanal: string;
  renewal_maleCondom: string;
  renewal_femaleCondom: string;
  renewal_IUD: string;
  renewal_implants: string;
}

export function FamilyPlanningFormModal({
  open,
  onOpenChange,
  record,
  onSuccess,
}: FamilyPlanningFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataState>({
    fileNumber: "",
    fullName: "",
    age: "",
    origin: "HD",
    address: "",
    isNew: true,
    // New methods
    new_noristerat: "",
    new_microlut: "",
    new_microgynon: "",
    new_emergencyPill: "",
    new_maleCondom: "",
    new_femaleCondom: "",
    new_IUD: "",
    new_implano_explano: "",
    // Renewal methods
    renewal_noristerat: "",
    renewal_microgynon: "",
    renewal_lofemanal: "",
    renewal_maleCondom: "",
    renewal_femaleCondom: "",
    renewal_IUD: "",
    renewal_implants: "",
  });

  // Initialize form when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        fileNumber: record.fileNumber || "",
        fullName: record.fullName || "",
        age: record.age || "",
        origin: record.origin || "HD",
        address: record.address || "",
        isNew: record.isNew ?? true,
        // New methods - convert numbers to strings
        new_noristerat: record.new_noristerat?.toString() || "",
        new_microlut: record.new_microlut?.toString() || "",
        new_microgynon: record.new_microgynon?.toString() || "",
        new_emergencyPill: record.new_emergencyPill?.toString() || "",
        new_maleCondom: record.new_maleCondom?.toString() || "",
        new_femaleCondom: record.new_femaleCondom?.toString() || "",
        new_IUD: record.new_IUD?.toString() || "",
        new_implano_explano: record.new_implano_explano?.toString() || "",
        // Renewal methods - convert numbers to strings
        renewal_noristerat: record.renewal_noristerat?.toString() || "",
        renewal_microgynon: record.renewal_microgynon?.toString() || "",
        renewal_lofemanal: record.renewal_lofemanal?.toString() || "",
        renewal_maleCondom: record.renewal_maleCondom?.toString() || "",
        renewal_femaleCondom: record.renewal_femaleCondom?.toString() || "",
        renewal_IUD: record.renewal_IUD?.toString() || "",
        renewal_implants: record.renewal_implants?.toString() || "",
      });
    } else {
      // Reset form for new record
      setFormData({
        fileNumber: "",
        fullName: "",
        age: "",
        origin: "HD",
        address: "",
        isNew: true,
        new_noristerat: "",
        new_microlut: "",
        new_microgynon: "",
        new_emergencyPill: "",
        new_maleCondom: "",
        new_femaleCondom: "",
        new_IUD: "",
        new_implano_explano: "",
        renewal_noristerat: "",
        renewal_microgynon: "",
        renewal_lofemanal: "",
        renewal_maleCondom: "",
        renewal_femaleCondom: "",
        renewal_IUD: "",
        renewal_implants: "",
      });
    }
    setError(null);
  }, [record, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataObj = new FormData();
    
    // Basic info - convert everything to string
    formDataObj.append("fileNumber", formData.fileNumber);
    formDataObj.append("fullName", formData.fullName);
    formDataObj.append("age", formData.age);
    formDataObj.append("origin", formData.origin);
    formDataObj.append("address", formData.address);
    formDataObj.append("isNew", formData.isNew.toString());

    // Methods - convert empty strings to empty string
    const methods = [
      "new_noristerat", "new_microlut", "new_microgynon", "new_emergencyPill",
      "new_maleCondom", "new_femaleCondom", "new_IUD", "new_implano_explano",
      "renewal_noristerat", "renewal_microgynon", "renewal_lofemanal",
      "renewal_maleCondom", "renewal_femaleCondom", "renewal_IUD", "renewal_implants"
    ];

    methods.forEach(method => {
      const value = formData[method as keyof FormDataState];
      // Append as string - FormData only accepts string or Blob
      formDataObj.append(method, String(value || ""));
    });

    try {
      let result;
      if (record) {
        result = await updateFamilyPlanningRecord(record.id, formDataObj);
      } else {
        result = await createFamilyPlanningRecord(formDataObj);
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

  const handleNumberChange = (field: keyof FormDataState, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ 
      ...prev, 
      [field]: numericValue 
    }));
  };

  const renderMethodFields = (category: 'new' | 'renewal') => {
    const methods = CONTRACEPTIVE_METHODS.filter(m => m.category === category);
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {methods.map((method) => (
          <div key={method.key} className="space-y-2">
            <Label htmlFor={method.key}>{method.label}</Label>
            <Input
              id={method.key}
              type="number"
              min="0"
              value={formData[method.key as keyof FormDataState] as string}
              onChange={(e) => handleNumberChange(method.key as keyof FormDataState, e.target.value)}
              placeholder="0"
              className="text-sm"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {record ? "Modifier Consultation" : "Nouvelle Consultation"}
            </DialogTitle>
            <DialogDescription>
              {record 
                ? "Modifier les informations de la consultation de planning familial"
                : "Créer une nouvelle consultation de planning familial"}
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
              <h3 className="text-lg font-semibold">Informations du Patient</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileNumber">Numéro de dossier</Label>
                  <Input
                    id="fileNumber"
                    value={formData.fileNumber}
                    onChange={(e) => handleChange("fileNumber", e.target.value)}
                    placeholder="Ex: PF-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Nom du patient"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Âge</Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    placeholder="Ex: 28 ans"
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="isNew">Type de consultation</Label>
                  <Select
                    value={formData.isNew ? "true" : "false"}
                    onValueChange={(value) => handleChange("isNew", value === "true")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Nouvelle consultation</SelectItem>
                      <SelectItem value="false">Renouvellement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Adresse du patient"
                  rows={2}
                />
              </div>
            </div>

            {/* Contraceptive Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {formData.isNew ? "Nouvelles Méthodes Contraceptives" : "Renouvellement des Méthodes"}
              </h3>
              
              <div className="text-sm text-gray-500 mb-4">
                Entrez les quantités pour chaque méthode (laisser vide pour 0)
              </div>

              {renderMethodFields(formData.isNew ? 'new' : 'renewal')}
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