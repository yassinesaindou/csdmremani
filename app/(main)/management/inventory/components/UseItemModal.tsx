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
import { useInventoryItem } from "../actions";

interface UseItemModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UseItemModal({
  item,
  open,
  onOpenChange,
  onSuccess,
}: UseItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantityToUse, setQuantityToUse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("quantityToUse", quantityToUse);

    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const result = await useInventoryItem(item.itemId, formData);

      if (result.success) {
        onOpenChange(false);
        setQuantityToUse("");
        onSuccess();
      } else {
        setError(result.error || "Erreur lors de l'utilisation du stock");
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
              Utiliser du Stock
            </DialogTitle>
            <DialogDescription>
              Déduire de la quantité disponible pour "{item.itemName}"
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
              <Label htmlFor="quantityToUse">Quantité à utiliser *</Label>
              <Input
                id="quantityToUse"
                type="number"
                min="0.01"
                step="0.01"
                max={currentStock}
                value={quantityToUse}
                onChange={(e) => setQuantityToUse(e.target.value)}
                placeholder="0.00"
                required
              />
              <div className="text-xs text-gray-500">
                Maximum disponible: {currentStock.toFixed(2)}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="text-sm font-medium text-amber-800 mb-1">
                Nouveau stock après déduction:
              </div>
              <div className="text-lg font-bold text-amber-900">
                {currentStock - (parseFloat(quantityToUse) || 0) >= 0 
                  ? (currentStock - (parseFloat(quantityToUse) || 0)).toFixed(2)
                  : "0.00"
                }
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setQuantityToUse("");
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !quantityToUse || parseFloat(quantityToUse) <= 0}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? "Déduction..." : "Déduire du stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}