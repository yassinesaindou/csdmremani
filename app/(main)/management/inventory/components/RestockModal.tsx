/* eslint-disable react/no-unescaped-entities */
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItem } from "../types";
import { restockInventoryItem } from "../actions";

interface RestockModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RestockModal({
  item,
  open,
  onOpenChange,
  onSuccess,
}: RestockModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("quantityToAdd", quantityToAdd);

    try {
      const result = await restockInventoryItem(item.itemId, formData);

      if (result.success) {
        onOpenChange(false);
        setQuantityToAdd("");
        onSuccess();
      } else {
        setError(result.error || "Erreur lors du réapprovisionnement");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  const currentStock = item.quantity || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Réapprovisionner le Stock
            </DialogTitle>
            <DialogDescription>
              Ajouter de la quantité disponible pour "{item.itemName}"
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-md border border-rose-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Stock actuel</Label>
              <div className="text-2xl font-bold text-gray-900">
                {currentStock.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500">
                Quantité actuellement disponible
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantityToAdd">Quantité à ajouter *</Label>
              <Input
                id="quantityToAdd"
                type="number"
                min="0.01"
                step="0.01"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(e.target.value)}
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500">
                Utilisez un point (.) pour les décimales
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
              <div className="text-sm font-medium text-emerald-800 mb-1">
                Nouveau stock après ajout:
              </div>
              <div className="text-lg font-bold text-emerald-900">
                {(currentStock + (parseFloat(quantityToAdd) || 0)).toFixed(2)}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setQuantityToAdd("");
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !quantityToAdd || parseFloat(quantityToAdd) <= 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "Ajout..." : "Ajouter au stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}