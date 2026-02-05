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
import { TransactionWithDepartment } from "../types";
import { createClient } from "@/lib/supabase/client";
import { Calendar, DollarSign, FileText, Building, User, TrendingUp, TrendingDown } from "lucide-react";

interface TransactionDetailModalProps {
  transaction: TransactionWithDepartment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailModal({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailModalProps) {
  const [createdByName, setCreatedByName] = useState<string>("");
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserName() {
      if (!transaction || !transaction.createdBy) return;

      const { data } = await supabase
        .from("profiles")
        .select("fullName")
        .eq("userId", transaction.createdBy)
        .single();
      
      if (data) setCreatedByName(data.fullName || "Inconnu");
    }

    fetchUserName();
  }, [transaction, supabase]);

  if (!transaction) return null;

  const isIncome = transaction.type === 'income';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Détails de la Transaction
          </DialogTitle>
          <DialogDescription>
            ID: {transaction.transactionId}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Transaction Summary */}
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
                    {transaction.amount?.toLocaleString('fr-FR') || "0"} KMF
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Motif</p>
                <p className="font-medium">{transaction.reason || "Non spécifié"}</p>
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
                  {transaction.department_name || "Général"}
                </Badge>
                <p className="text-sm text-gray-500 mt-2">
                  Cette transaction concerne {transaction.department_name ? `le département ${transaction.department_name}` : "tous les départements"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informations Système
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date de création</p>
                  <p className="font-medium">
                    {format(new Date(transaction.createdAt), "PPpp", { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Créé par</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{createdByName || "Inconnu"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}