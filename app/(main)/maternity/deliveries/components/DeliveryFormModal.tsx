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
import { MaternityDelivery } from "../types";
import { createDelivery, updateDelivery } from "../actions";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DeliveryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery?: MaternityDelivery | null;
  onSuccess: () => void;
}

export function DeliveryFormModal({
  open,
  onOpenChange,
  delivery,
  onSuccess,
}: DeliveryFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fileNumber: "",
    fullName: "",
    address: "",
    origin: "HD" as "HD" | "DS",
    workTime: "",
    delivery_dateTime: "",
    delivery_eutocic: "",
    delivery_dystocic: "",
    delivery_transfert: "",
    weight: "",
    newBorn_living: "",
    newBorn_lessThan2point5kg: "",
    numberOfDeaths: "",
    numberOfDeaths_before24hours: "",
    numberOfDeaths_before7Days: "",
    isMotherDead: false,
    transfer: "",
    leavingDate: "",
    observations: "",
  });

  // Initialize form when delivery changes
  useEffect(() => {
    if (delivery) {
      setFormData({
        fileNumber: delivery.fileNumber || "",
        fullName: delivery.fullName || "",
        address: delivery.address || "",
        origin: delivery.origin || "HD",
        workTime: delivery.workTime ? format(new Date(delivery.workTime), "yyyy-MM-dd'T'HH:mm") : "",
        delivery_dateTime: delivery.delivery_dateTime ? format(new Date(delivery.delivery_dateTime), "yyyy-MM-dd'T'HH:mm") : "",
        delivery_eutocic: delivery.delivery_eutocic || "",
        delivery_dystocic: delivery.delivery_dystocic || "",
        delivery_transfert: delivery.delivery_transfert || "",
        weight: delivery.weight?.toString() || "",
        newBorn_living: delivery.newBorn_living?.toString() || "",
        newBorn_lessThan2point5kg: delivery.newBorn_lessThan2point5kg?.toString() || "",
        numberOfDeaths: delivery.numberOfDeaths?.toString() || "",
        numberOfDeaths_before24hours: delivery.numberOfDeaths_before24hours?.toString() || "",
        numberOfDeaths_before7Days: delivery.numberOfDeaths_before7Days?.toString() || "",
        isMotherDead: delivery.isMotherDead || false,
        transfer: delivery.transfer || "",
        leavingDate: delivery.leavingDate ? format(new Date(delivery.leavingDate), "yyyy-MM-dd'T'HH:mm") : "",
        observations: delivery.observations || "",
      });
    } else {
      // Reset form for new delivery
      const now = new Date();
      const defaultDateTime = format(now, "yyyy-MM-dd'T'HH:mm");
      
      setFormData({
        fileNumber: "",
        fullName: "",
        address: "",
        origin: "HD",
        workTime: defaultDateTime,
        delivery_dateTime: defaultDateTime,
        delivery_eutocic: "",
        delivery_dystocic: "",
        delivery_transfert: "",
        weight: "",
        newBorn_living: "1",
        newBorn_lessThan2point5kg: "",
        numberOfDeaths: "",
        numberOfDeaths_before24hours: "",
        numberOfDeaths_before7Days: "",
        isMotherDead: false,
        transfer: "",
        leavingDate: "",
        observations: "",
      });
    }
    setError(null);
  }, [delivery, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value.toString());
    });

    try {
      let result;
      if (delivery) {
        result = await updateDelivery(delivery.deliveryId, formDataObj);
      } else {
        result = await createDelivery(formDataObj);
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

  // Calculate total deaths
  const totalDeaths = 
    (parseInt(formData.numberOfDeaths_before24hours) || 0) +
    (parseInt(formData.numberOfDeaths_before7Days) || 0);

  // Update total deaths when component fields change
  useEffect(() => {
    if (formData.numberOfDeaths_before24hours || formData.numberOfDeaths_before7Days) {
      handleChange("numberOfDeaths", totalDeaths.toString());
    }
  }, [formData.numberOfDeaths_before24hours, formData.numberOfDeaths_before7Days]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {delivery ? "Modifier Accouchement" : "Nouvel Accouchement"}
            </DialogTitle>
            <DialogDescription>
              {delivery 
                ? "Modifier les informations de l'accouchement"
                : "Enregistrer un nouvel accouchement en maternité"}
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
              <h3 className="text-lg font-semibold">Informations de la Mère</h3>
              
              <div className="space-y-2">
                <Label htmlFor="fileNumber">Numéro de dossier</Label>
                <Input
                  id="fileNumber"
                  value={formData.fileNumber}
                  onChange={(e) => handleChange("fileNumber", e.target.value)}
                  placeholder="N° dossier"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Nom complet de la mère"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Adresse"
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isMotherDead"
                  checked={formData.isMotherDead}
                  onCheckedChange={(checked: any) => handleChange("isMotherDead", checked)}
                />
                <Label htmlFor="isMotherDead" className="text-rose-600">
                  Décès de la mère
                </Label>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informations de l'Accouchement</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workTime" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Heure de travail
                  </Label>
                  <Input
                    id="workTime"
                    type="datetime-local"
                    value={formData.workTime}
                    onChange={(e) => handleChange("workTime", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_dateTime" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Heure d'accouchement
                  </Label>
                  <Input
                    id="delivery_dateTime"
                    type="datetime-local"
                    value={formData.delivery_dateTime}
                    onChange={(e) => handleChange("delivery_dateTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type d'accouchement</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Eutocique"
                    value={formData.delivery_eutocic}
                    onChange={(e) => handleChange("delivery_eutocic", e.target.value)}
                    className="text-center"
                  />
                  <Input
                    placeholder="Dystocique"
                    value={formData.delivery_dystocic}
                    onChange={(e) => handleChange("delivery_dystocic", e.target.value)}
                    className="text-center"
                  />
                  <Input
                    placeholder="Transfert"
                    value={formData.delivery_transfert}
                    onChange={(e) => handleChange("delivery_transfert", e.target.value)}
                    className="text-center"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Poids du nouveau-né (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  placeholder="Ex: 3.2"
                />
              </div>
            </div>
          </div>

          {/* Newborn Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Informations du Nouveau-né</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="newBorn_living">Nouveau-né(s) vivant(s)</Label>
                <Input
                  id="newBorn_living"
                  type="number"
                  min="0"
                  value={formData.newBorn_living}
                  onChange={(e) => handleChange("newBorn_living", e.target.value)}
                  placeholder="Nombre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newBorn_lessThan2point5kg">Poids &lt; 2.5 kg</Label>
                <Input
                  id="newBorn_lessThan2point5kg"
                  type="number"
                  min="0"
                  value={formData.newBorn_lessThan2point5kg}
                  onChange={(e) => handleChange("newBorn_lessThan2point5kg", e.target.value)}
                  placeholder="Nombre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfDeaths">Total décès</Label>
                <Input
                  id="numberOfDeaths"
                  type="number"
                  min="0"
                  value={totalDeaths}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfDeaths_before24hours">Décès avant 24h</Label>
                <Input
                  id="numberOfDeaths_before24hours"
                  type="number"
                  min="0"
                  value={formData.numberOfDeaths_before24hours}
                  onChange={(e) => handleChange("numberOfDeaths_before24hours", e.target.value)}
                  placeholder="Nombre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfDeaths_before7Days">Décès avant 7 jours</Label>
                <Input
                  id="numberOfDeaths_before7Days"
                  type="number"
                  min="0"
                  value={formData.numberOfDeaths_before7Days}
                  onChange={(e) => handleChange("numberOfDeaths_before7Days", e.target.value)}
                  placeholder="Nombre"
                />
              </div>
            </div>
          </div>

          {/* Transfer and Leaving Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Transfert</h3>
              <div className="space-y-2">
                <Label htmlFor="transfer">Destination</Label>
                <Input
                  id="transfer"
                  value={formData.transfer}
                  onChange={(e) => handleChange("transfer", e.target.value)}
                  placeholder="Lieu de transfert"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sortie</h3>
              <div className="space-y-2">
                <Label htmlFor="leavingDate" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Date de sortie
                </Label>
                <Input
                  id="leavingDate"
                  type="datetime-local"
                  value={formData.leavingDate}
                  onChange={(e) => handleChange("leavingDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Observations</h3>
            <div className="space-y-2">
              <Label htmlFor="observations">Notes et observations</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => handleChange("observations", e.target.value)}
                placeholder="Observations supplémentaires..."
                rows={4}
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
                ? (delivery ? "Modification..." : "Création...")
                : (delivery ? "Modifier" : "Créer")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}