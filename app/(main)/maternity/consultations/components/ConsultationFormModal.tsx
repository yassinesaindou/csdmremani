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
import { MaternityConsultation } from "../types";
import { DiagnosticsComboBox } from "./DiagnosticsComboBox";
import { createConsultation, updateConsultation } from "../actions";

interface ConsultationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation?: MaternityConsultation | null;
  onSuccess: () => void;
}

export function ConsultationFormModal({
  open,
  onOpenChange,
  consultation,
  onSuccess,
}: ConsultationFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "F" as "M" | "F",
    origin: "HD" as "HD" | "DS",
    address: "",
    isNewCase: true,
    seenByDoctor: false,
    dominantSign: "",
    isPregnant: true,
    treatment: "",
    reference: "",
    mitualist: "undefined",
  });

  // Initialize form when consultation changes
  useEffect(() => {
    if (consultation) {
      setFormData({
        name: consultation.name || "",
        age: consultation.age || "",
        sex: consultation.sex || "F",
        origin: consultation.origin || "HD",
        address: consultation.address || "",
        isNewCase: consultation.isNewCase ?? true,
        seenByDoctor: consultation.seenByDoctor ?? false,
        dominantSign: consultation.dominantSign || "",
        isPregnant: consultation.isPregnant ?? true,
        treatment: consultation.treatment || "",
        reference: consultation.reference || "",
        mitualist: consultation.mitualist || "undefined",
      });
      setDiagnostics(
        consultation.diagnostic 
          ? consultation.diagnostic.split(",").map(d => d.trim()).filter(d => d)
          : []
      );
    } else {
      // Reset form for new consultation
      setFormData({
        name: "",
        age: "",
        sex: "F",
        origin: "HD",
        address: "",
        isNewCase: true,
        seenByDoctor: false,
        dominantSign: "",
        isPregnant: true,
        treatment: "",
        reference: "",
        mitualist: "undefined",
      });
      setDiagnostics([]);
    }
    setError(null);
  }, [consultation, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value.toString());
    });
    formDataObj.append("diagnostic", diagnostics.join(", "));

    try {
      let result;
      if (consultation) {
        result = await updateConsultation(consultation.consultationId, formDataObj);
      } else {
        result = await createConsultation(formDataObj);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {consultation ? "Modifier Consultation" : "Nouvelle Consultation"}
            </DialogTitle>
            <DialogDescription>
              {consultation 
                ? "Modifier les informations de la consultation"
                : "Créer une nouvelle consultation de maternité"}
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
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nom du patient"
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
                    placeholder="Ex: 28 ans"
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
                      <SelectItem value="F">Féminin</SelectItem>
                      <SelectItem value="M">Masculin</SelectItem>
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

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations Médicales</h3>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNewCase"
                    checked={formData.isNewCase}
                    onCheckedChange={(checked :any) => handleChange("isNewCase", checked)}
                  />
                  <Label htmlFor="isNewCase">Nouveau cas</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="seenByDoctor"
                    checked={formData.seenByDoctor}
                    onCheckedChange={(checked :any) => handleChange("seenByDoctor", checked)}
                  />
                  <Label htmlFor="seenByDoctor">Vu par docteur</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPregnant"
                    checked={formData.isPregnant}
                    onCheckedChange={(checked :any) => handleChange("isPregnant", checked)}
                  />
                  <Label htmlFor="isPregnant">Enceinte</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dominantSign">Signe dominant</Label>
                <Input
                  id="dominantSign"
                  value={formData.dominantSign}
                  onChange={(e) => handleChange("dominantSign", e.target.value)}
                  placeholder="Signe dominant observé"
                />
              </div>

              <div className="space-y-2">
                <Label>Diagnostics</Label>
                <DiagnosticsComboBox
                  value={diagnostics}
                  onChange={setDiagnostics}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment">Traitement</Label>
                <Textarea
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => handleChange("treatment", e.target.value)}
                  placeholder="Traitement prescrit"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => handleChange("reference", e.target.value)}
                placeholder="Référence"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mitualist">Mutualiste</Label>
              <Input
                id="mitualist"
                value={formData.mitualist}
                onChange={(e) => handleChange("mitualist", e.target.value)}
                placeholder="Mutualiste"
              />
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
                ? (consultation ? "Modification..." : "Création...")
                : (consultation ? "Modifier" : "Créer")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}