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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { ReceiptWithDetails } from "../types";
import { markReceiptAsExecuted } from "../actions";

interface MarkAsExecutedModalProps {
  receipt: ReceiptWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  canExecute: boolean;
}

export function MarkAsExecutedModal({
  receipt,
  open,
  onOpenChange,
  onSuccess,
  canExecute,
}: MarkAsExecutedModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!canExecute) {
      setError("Vous n'avez pas la permission de marquer ce reçu comme exécuté");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await markReceiptAsExecuted(receipt.receiptId);

      if (result.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(result.error || "Erreur lors de l'opération");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (!canExecute) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Permission refusée
            </DialogTitle>
            <DialogDescription>
              Vous n'avez pas la permission d'exécuter cette action.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Seuls les administrateurs, les utilisateurs du département management, 
              ou les membres du département concerné peuvent marquer ce reçu comme exécuté.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Marquer comme exécuté
          </DialogTitle>
          <DialogDescription>
            Cette action supprimera le reçu de la liste.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Attention : Cette action est irréversible
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <div>
              <p className="text-sm text-gray-500">Motif</p>
              <p className="font-medium">{receipt.reason || "Non spécifié"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Département</p>
                <p className="font-medium">{receipt.department_name || "Non spécifié"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Montant</p>
                <p className="font-bold text-emerald-600">
                  {receipt.transaction_amount?.toLocaleString('fr-FR') || "0"} KMF
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Êtes-vous sûr de vouloir marquer ce reçu comme exécuté ? 
            Le reçu sera supprimé de la liste et ne pourra plus être consulté.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmer l'exécution
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}