/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
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
  VaccinationEnfant,
  STRATEGY_OPTIONS,
  SEX_OPTIONS,
  VACCINATION_OPTIONS,
  VACCINES,
} from "../types";
import { createVaccinationEnfant, updateVaccinationEnfant } from "../actions";

interface VaccinationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaccination?: VaccinationEnfant | null;
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
    name: "",
    address: "",
    age: "",
    sex: "M" as "M" | "F",
    origin: "",
    receivedVitamineA: false,
    receivedAlBendazole: false,
    weight: "",
    height: "",
    strategy: "fixe",
    BCG: "",
    TD0: "",
    TD1: "",
    TD2: "",
    TD3: "",
    VP1: "",
    Penta1: "",
    Penta2: "",
    Penta3: "",
    RR1: "",
    RR2: "",
    ECV: "",
  });

  // Initialize form when vaccination changes
  useEffect(() => {
    if (vaccination) {
      setFormData({
        name: vaccination.name || "",
        address: vaccination.address || "",
        age: vaccination.age?.toString() || "",
        sex: vaccination.sex || "M",
        origin: vaccination.origin || "",
        receivedVitamineA: vaccination.receivedVitamineA || false,
        receivedAlBendazole: vaccination.receivedAlBendazole || false,
        weight: vaccination.weight?.toString() || "",
        height: vaccination.height?.toString() || "",
        strategy: vaccination.strategy || "fixe",
        BCG: vaccination.BCG || "",
        TD0: vaccination.TD0 || "",
        TD1: vaccination.TD1 || "",
        TD2: vaccination.TD2 || "",
        TD3: vaccination.TD3 || "",
        VP1: vaccination.VP1 || "",
        Penta1: vaccination.Penta1 || "",
        Penta2: vaccination.Penta2 || "",
        Penta3: vaccination.Penta3 || "",
        RR1: vaccination.RR1 || "",
        RR2: vaccination.RR2 || "",
        ECV: vaccination.ECV || "",
      });
    } else {
      // Reset form for new vaccination
      setFormData({
        name: "",
        address: "",
        age: "",
        sex: "M",
        origin: "",
        receivedVitamineA: false,
        receivedAlBendazole: false,
        weight: "",
        height: "",
        strategy: "fixe",
        BCG: "",
        TD0: "",
        TD1: "",
        TD2: "",
        TD3: "",
        VP1: "",
        Penta1: "",
        Penta2: "",
        Penta3: "",
        RR1: "",
        RR2: "",
        ECV: "",
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
        result = await updateVaccinationEnfant(vaccination.id, formDataObj);
      } else {
        result = await createVaccinationEnfant(formDataObj);
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
    setFormData((prev) => ({ ...prev, [field]: value }));
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
                : "Enregistrer une nouvelle vaccination d'enfant"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-md border border-rose-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Child Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Informations de l'Enfant
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nom de l'enfant"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Âge (mois)</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    max="72"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    placeholder="Ex: 12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sex">Sexe</Label>
                  <Select
                    value={formData.sex}
                    onValueChange={(value: "M" | "F") =>
                      handleChange("sex", value)
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEX_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Poids (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    placeholder="Ex: 8.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Taille (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="0"
                    max="150"
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    placeholder="Ex: 75"
                  />
                </div>
              </div>
            </div>

            {/* Vaccination Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Informations de Vaccination
              </h3>

              <div className="space-y-2">
                <Label htmlFor="strategy">Stratégie</Label>
                <Select
                  value={formData.strategy}
                  onValueChange={(value: string) =>
                    handleChange("strategy", value)
                  }>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="receivedVitamineA"
                    checked={formData.receivedVitamineA}
                    onCheckedChange={(checked: boolean) =>
                      handleChange("receivedVitamineA", checked)
                    }
                  />
                  <Label htmlFor="receivedVitamineA">Vitamine A</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="receivedAlBendazole"
                    checked={formData.receivedAlBendazole}
                    onCheckedChange={(checked: boolean) =>
                      handleChange("receivedAlBendazole", checked)
                    }
                  />
                  <Label htmlFor="receivedAlBendazole">AlBendazole</Label>
                </div>
              </div>

              {/* Vaccines Grid */}
              <div className="space-y-3">
                <Label>Vaccins</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {VACCINES.map((vaccine) => (
                    <div key={vaccine.key} className="space-y-1">
                      <Label className="text-sm">{vaccine.label}</Label>
                      <Select
                        value={
                          formData[
                            vaccine.key as keyof typeof formData
                          ] as string
                        }
                        onValueChange={(value: string) =>
                          handleChange(vaccine.key, value)
                        }>
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
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700">
              {loading
                ? vaccination
                  ? "Modification..."
                  : "Création..."
                : vaccination
                ? "Modifier"
                : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
