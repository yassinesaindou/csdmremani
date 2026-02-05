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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionWithDepartment } from "../types";
import { createTransaction, updateTransaction } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Department } from "../types";

interface TransactionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: TransactionWithDepartment | null;
  onSuccess: () => void;
}

export function TransactionFormModal({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: TransactionFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    reason: "",
    amount: "",
    departmentToSee: "general" as string,
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadDepartments() {
      const { data } = await supabase
        .from("departments")
        .select("*")
        .order("departementName");
      
      if (data) {
        setDepartments(data);
      }
    }

    loadDepartments();
  }, []);

  // Initialize form when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || "expense",
        reason: transaction.reason || "",
        amount: transaction.amount?.toString() || "",
        departmentToSee: transaction.departmentToSee || "general",
      });
    } else {
      // Reset form for new transaction
      setFormData({
        type: "expense",
        reason: "",
        amount: "",
        departmentToSee: "general",
      });
    }
    setError(null);
  }, [transaction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataObj = new FormData();
    formDataObj.append("type", formData.type);
    formDataObj.append("reason", formData.reason);
    formDataObj.append("amount", formData.amount);
    formDataObj.append("departmentToSee", formData.departmentToSee === "general" ? "" : formData.departmentToSee);

    try {
      let result;
      if (transaction) {
        result = await updateTransaction(transaction.transactionId, formDataObj);
      } else {
        result = await createTransaction(formDataObj);
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
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {transaction ? "Modifier Transaction" : "Nouvelle Transaction"}
            </DialogTitle>
            <DialogDescription>
              {transaction 
                ? "Modifier les informations de la transaction"
                : "Enregistrer une nouvelle transaction financière"}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-rose-50 text-rose-700 text-sm p-3 rounded-md border border-rose-200">
              {error}
            </div>
          )}

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type de transaction *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "income" | "expense") => handleChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Recette (Entrée d'argent)</SelectItem>
                    <SelectItem value="expense">Dépense (Sortie d'argent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (KMF) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="Ex: 150000"
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="departmentToSee">Département concerné</Label>
              <Select
                value={formData.departmentToSee}
                onValueChange={(value) => handleChange("departmentToSee", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Général (Tous départements)</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.departmentId} value={dept.departmentId}>
                      {dept.departementName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Laisser "Général" si la transaction concerne n'appartient à aucun département spécifique.
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Motif de la transaction *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                placeholder="Décrivez la raison de cette transaction..."
                rows={4}
                required
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
                ? (transaction ? "Modification..." : "Création...")
                : (transaction ? "Modifier" : "Créer")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}