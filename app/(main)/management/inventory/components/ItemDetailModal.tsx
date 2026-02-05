/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { InventoryItem } from "../types";
import { createClient } from "@/lib/supabase/client";
import {
  Package,
  Calendar,
  User,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Edit,
  PackageMinus,
  PackagePlus,
} from "lucide-react";

interface ItemDetailModalProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onUseItem: () => void;
  onRestock: () => void;
}

export function ItemDetailModal({
  item,
  open,
  onOpenChange,
  onEdit,
  onUseItem,
  onRestock,
}: ItemDetailModalProps) {
  const [createdByName, setCreatedByName] = useState<string>("");
  const [updatedByName, setUpdatedByName] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    async function fetchUserNames() {
      if (!item) return;

      // Fetch createdBy user name
      if (item.createdBy) {
        const { data } = await supabase
          .from("profiles")
          .select("fullName")
          .eq("userId", item.createdBy)
          .single();
        if (data) setCreatedByName(data.fullName || "Inconnu");
      }

      // Fetch updatedBy user name
      if (item.updatedBy) {
        const { data } = await supabase
          .from("profiles")
          .select("fullName")
          .eq("userId", item.updatedBy)
          .single();
        if (data) setUpdatedByName(data.fullName || "Inconnu");
      }
    }

    fetchUserNames();
  }, [item, supabase]);

  if (!item) return null;

  const quantity = item.quantity || 0;
  const usedQuantity = item.usedQuantity || 0;
  const total = quantity + usedQuantity;
  const stockPercentage = total > 0 ? (quantity / total) * 100 : 0;
  const isLowStock = quantity < 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Détails de l'Article
          </DialogTitle>
          <DialogDescription>
            ID: {item.itemId}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Item Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Informations de l'Article
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Nom de l'article</p>
                  <p className="font-medium text-xl">{item.itemName || "Non nommé"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Stock Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                État du Stock
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Quantité en stock</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={isLowStock ? "destructive" : "default"}
                      className="text-lg font-mono"
                    >
                      {quantity.toFixed(2)}
                    </Badge>
                    {isLowStock && (
                      <TrendingDown className="h-5 w-5 text-rose-500" />
                    )}
                  </div>
                  {isLowStock && (
                    <p className="text-xs text-rose-600">Stock faible</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Quantité utilisée</p>
                  <Badge variant="outline" className="text-lg font-mono">
                    {usedQuantity.toFixed(2)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Total</p>
                  <Badge variant="secondary" className="text-lg font-mono">
                    {total.toFixed(2)}
                  </Badge>
                </div>

                <div className="col-span-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Répartition du stock</span>
                      <span>{stockPercentage.toFixed(1)}% disponible</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Disponible: {quantity.toFixed(2)}</span>
                      <span>Utilisé: {usedQuantity.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Actions Rapides</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={onEdit}
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20"
                >
                  <Edit className="h-5 w-5 mb-2" />
                  <span className="text-xs">Modifier</span>
                </Button>
                
                <Button
                  onClick={onUseItem}
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20 border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <PackageMinus className="h-5 w-5 mb-2" />
                  <span className="text-xs">Utiliser du stock</span>
                </Button>
                
                <Button
                  onClick={onRestock}
                  className="flex flex-col items-center justify-center h-20 bg-emerald-600 hover:bg-emerald-700"
                >
                  <PackagePlus className="h-5 w-5 mb-2" />
                  <span className="text-xs">Réapprovisionner</span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Métadonnées
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Créé le
                  </p>
                  <p>
                    {format(new Date(item.createdAt), "PPpp", { locale: fr })}
                  </p>
                  <p className="text-gray-500 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    par {createdByName || "Inconnu"}
                  </p>
                </div>
                {item.updatedAt && (
                  <div>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Modifié le
                    </p>
                    <p>
                      {format(new Date(item.updatedAt), "PPpp", { locale: fr })}
                    </p>
                    <p className="text-gray-500 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      par {updatedByName || "Inconnu"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}