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
import { FamilyPlanningRecord } from "../types";
import { createClient } from "@/lib/supabase/client";
import {
  Calendar,
  User,
  MapPin,
  FileText,
  Shield,
  Baby,
  Package,
  RefreshCw,
} from "lucide-react";
import { CONTRACEPTIVE_METHODS } from "../types";

interface FamilyPlanningDetailModalProps {
  record: FamilyPlanningRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FamilyPlanningDetailModal({
  record,
  open,
  onOpenChange,
}: FamilyPlanningDetailModalProps) {
  const [createdByName, setCreatedByName] = useState<string>("");
  const [updatedByName, setUpdatedByName] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    async function fetchUserNames() {
      if (!record) return;

      if (record.createdBy) {
        const { data } = await supabase
          .from("profiles")
          .select("fullName")
          .eq("userId", record.createdBy)
          .single();
        if (data) setCreatedByName(data.fullName || "Inconnu");
      }

      if (record.updatedBy) {
        const { data } = await supabase
          .from("profiles")
          .select("fullName")
          .eq("userId", record.updatedBy)
          .single();
        if (data) setUpdatedByName(data.fullName || "Inconnu");
      }
    }

    fetchUserNames();
  }, [record, supabase]);

  if (!record) return null;

  // Calculate totals for each category
  const newMethods = CONTRACEPTIVE_METHODS
    .filter(m => m.category === 'new')
    .filter(m => record[m.key as keyof FamilyPlanningRecord] !== null && record[m.key as keyof FamilyPlanningRecord] !== 0);

  const renewalMethods = CONTRACEPTIVE_METHODS
    .filter(m => m.category === 'renewal')
    .filter(m => record[m.key as keyof FamilyPlanningRecord] !== null && record[m.key as keyof FamilyPlanningRecord] !== 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Consultation Planning Familial
          </DialogTitle>
          <DialogDescription>
            Dossier: {record.fileNumber || "Non renseigné"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations du Patient
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Numéro de dossier</p>
                  <p className="font-medium">{record.fileNumber || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{record.fullName || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Âge</p>
                  <p className="font-medium">{record.age || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Origine</p>
                  <Badge variant="outline">
                    {record.origin || "Non renseigné"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">{record.address || "Non renseigné"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Consultation Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Type de Consultation
              </h3>
              <div className="flex items-center gap-2">
                {record.isNew ? (
                  <Badge className="bg-blue-100 text-blue-800">
                    Nouvelle consultation
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Renouvellement
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Contraceptive Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Méthodes Contraceptives
              </h3>
              
              {record.isNew ? (
                <>
                  <h4 className="font-medium text-gray-700">Nouvelles méthodes prescrites:</h4>
                  {newMethods.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {newMethods.map((method) => (
                        <div key={method.key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{method.label}</span>
                          <Badge variant="secondary">
                            {record[method.key as keyof FamilyPlanningRecord] as number}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucune nouvelle méthode prescrite</p>
                  )}
                </>
              ) : (
                <>
                  <h4 className="font-medium text-gray-700">Méthodes renouvelées:</h4>
                  {renewalMethods.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {renewalMethods.map((method) => (
                        <div key={method.key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{method.label}</span>
                          <Badge variant="outline">
                            {record[method.key as keyof FamilyPlanningRecord] as number}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucune méthode renouvelée</p>
                  )}
                </>
              )}
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
                  <p className="text-gray-500">Créé le</p>
                  <p>
                    {format(new Date(record.createdAt), "PPpp", { locale: fr })}
                  </p>
                  <p className="text-gray-500">par {createdByName || "Inconnu"}</p>
                </div>
                {record.updatedAt && (
                  <div>
                    <p className="text-gray-500">Modifié le</p>
                    <p>
                      {format(new Date(record.updatedAt), "PPpp", { locale: fr })}
                    </p>
                    <p className="text-gray-500">par {updatedByName || "Inconnu"}</p>
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