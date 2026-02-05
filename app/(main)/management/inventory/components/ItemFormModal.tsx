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
import { InventoryItem } from "../types";
import { createInventoryItem, updateInventoryItem } from "../actions";

interface ItemFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSuccess: () => void;
}

export function ItemFormModal({
  open,
  onOpenChange,
  item,
  onSuccess,
}: ItemFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    itemName: "",
    quantity: "0",
  });

  // Initialize form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.itemName || "",
        quantity: item.quantity?.toString() || "0",
      });
    } else {
      setFormData({
        itemName: "",
        quantity: "0",
      });
    }
    setError(null);
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataObj = new FormData();
    formDataObj.append("itemName", formData.itemName);
    formDataObj.append("quantity", formData.quantity);

    try {
      let result;
      if (item) {
        result = await updateInventoryItem(item.itemId, formDataObj);
      } else {
        result = await createInventoryItem(formDataObj);
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {item ? "Modifier l'Article" : "Nouvel Article d'Inventaire"}
            </DialogTitle>
            <DialogDescription>
              {item 
                ? "Modifier les informations de l'article"
                : "Ajouter un nouvel article à l'inventaire"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-md border border-rose-200">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Nom de l'article *</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) => handleChange("itemName", e.target.value)}
                placeholder="Ex: Gants stériles, seringues 5ml, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité initiale</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500">
                Utilisez un point (.) pour les décimales
              </p>
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
                ? (item ? "Modification..." : "Création...")
                : (item ? "Modifier" : "Ajouter")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}