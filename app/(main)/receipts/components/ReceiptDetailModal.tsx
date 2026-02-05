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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ReceiptWithDetails } from "../types";
import { createClient } from "@/lib/supabase/client";
import { Calendar, DollarSign, FileText, Building, TrendingUp, TrendingDown, User } from "lucide-react";

interface ReceiptDetailModalProps {
  receipt: ReceiptWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptDetailModal({
  receipt,
  open,
  onOpenChange,
}: ReceiptDetailModalProps) {
  if (!receipt) return null;

  const isIncome = receipt.transaction_type === 'income';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Détails du Reçu
          </DialogTitle>
          <DialogDescription>
            ID: {receipt.receiptId.substring(0, 8)}...
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Receipt Summary */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <Badge 
                    className={isIncome ? 
                      "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : 
                      "bg-rose-100 text-rose-800 hover:bg-rose-100"
                    }
                  >
                    {isIncome ? (
                      <>
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Recette
                      </>
                    ) : (
                      <>
                        <TrendingDown className="mr-1 h-3 w-3" />
                        Dépense
                      </>
                    )}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {receipt.transaction_amount?.toLocaleString('fr-FR') || "0"} KMF
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Motif</p>
                <p className="font-medium">{receipt.reason || "Non spécifié"}</p>
              </div>
            </div>

            <Separator />

            {/* Department Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Département Concerné
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <Badge variant="outline">
                  {receipt.department_name || "Général"}
                </Badge>
                <p className="text-sm text-gray-500 mt-2">
                  Ce reçu concerne le département {receipt.department_name || "Non spécifié"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Transaction Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Information Transaction
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Type de transaction</p>
                  <p className="font-medium">
                    {isIncome ? 'Recette (Entrée)' : 'Dépense (Sortie)'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Montant transaction</p>
                  <p className="font-bold">
                    {receipt.transaction_amount?.toLocaleString('fr-FR') || "0"} KMF
                  </p>
                </div>
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
                  <p className="text-gray-500">Date création reçu</p>
                  <p className="font-medium">
                    {format(new Date(receipt.createdAt), "PPpp", { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date transaction</p>
                  <p className="font-medium">
                    {receipt.transaction_createdAt 
                      ? format(new Date(receipt.transaction_createdAt), "PPpp", { locale: fr })
                      : "Non disponible"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}