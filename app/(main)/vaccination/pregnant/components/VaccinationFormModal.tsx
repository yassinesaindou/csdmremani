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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VaccinationFemmeEnceinte, STRATEGY_OPTIONS, VACCINATION_OPTIONS, VACCINES, MONTH_OPTIONS } from "../types";
import { createVaccinationFemmeEnceinte, updateVaccinationFemmeEnceinte } from "../actions";

interface VaccinationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaccination?: VaccinationFemmeEnceinte | null;
  onSuccess: () => void;
}

export function VaccinationFormModal({
  open,
  onOpenChange,
  vaccination,
  onSuccess,
}: VaccinationFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    month: "",
    name: "",
    address: "",
    origin: "",
    strategy: "fixe",
    TD1: "",
    TD2: "",
    TD3: "",
    TD4: "",
    TD5: "",
    FCV: "",
  });

  // Initialize form when vaccination changes
  useEffect(() => {
    if (vaccination) {
      setFormData({
        month: vaccination.month?.toString() || "",
        name: vaccination.name || "",
        address: vaccination.address || "",
        origin: vaccination.origin || "",
        strategy: vaccination.strategy || "fixe",
        TD1: vaccination.TD1 || "",
        TD2: vaccination.TD2 || "",
        TD3: vaccination.TD3 || "",
        TD4: vaccination.TD4 || "",
        TD5: vaccination.TD5 || "",
        FCV: vaccination.FCV || "",
      });
    } else {
      // Reset form for new vaccination
      setFormData({
        month: "",
        name: "",
        address: "",
        origin: "",
        strategy: "fixe",
        TD1: "",
        TD2: "",
        TD3: "",
        TD4: "",
        TD5: "",
        FCV: "",
      });
    }
    setError(null);
  }, [vaccination, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataObj.append(key, value.toString());
      }
    });

    try {
      let result;
      if (vaccination) {
        result = await updateVaccinationFemmeEnceinte(vaccination.id, formDataObj);
      } else {
        result = await createVaccinationFemmeEnceinte(formDataObj);
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
              {vaccination ? "Modifier Vaccination" : "Nouvelle Vaccination"}
            </DialogTitle>
            <DialogDescription>
              {vaccination 
                ? "Modifier les informations de la vaccination"
                : "Enregistrer une nouvelle vaccination de femme enceinte"}
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
              <h3 className="text-lg font-semibold">Informations de la Patiente</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nom de la patiente"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Mois de grossesse</Label>
                <Select
                  value={formData.month}
                  onValueChange={(value: string) => handleChange("month", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le mois" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Origine</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => handleChange("origin", e.target.value)}
                  placeholder="Origine"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Adresse"
                  rows={2}
                />
              </div>
            </div>

            {/* Vaccination Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations de Vaccination</h3>
              
              <div className="space-y-2">
                <Label htmlFor="strategy">Stratégie</Label>
                <Select
                  value={formData.strategy}
                  onValueChange={(value: string) => handleChange("strategy", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {STRATEGY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vaccines Grid */}
              <div className="space-y-3">
                <Label>Vaccins Recommandés pour Femmes Enceintes</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {VACCINES.map((vaccine) => (
                    <div key={vaccine.key} className="space-y-1">
                      <Label className="text-sm">{vaccine.label}</Label>
                      <Select
                        value={formData[vaccine.key as keyof typeof formData] as string}
                        onValueChange={(value: string) => handleChange(vaccine.key, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                          {VACCINATION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded-md mt-4">
                <p className="text-sm text-purple-700">
                  <strong>Note :</strong> Les vaccins TD (Tétanos-Diphtérie) et FCV (Fièvre Covid-19) 
                  sont recommandés pendant la grossesse pour protéger la mère et le bébé.
                </p>
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
            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading 
                ? (vaccination ? "Modification..." : "Création...")
                : (vaccination ? "Modifier" : "Créer")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}