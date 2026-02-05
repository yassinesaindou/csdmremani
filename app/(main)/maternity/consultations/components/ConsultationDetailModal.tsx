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
import { MaternityConsultation } from "../types";
import { createClient } from "@/lib/supabase/client";
import { Calendar, User, MapPin, Stethoscope, Pill, FileText, Shield } from "lucide-react";

interface ConsultationDetailModalProps {
  consultation: MaternityConsultation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsultationDetailModal({
  consultation,
  open,
  onOpenChange,
}: ConsultationDetailModalProps) {
  const [createdByName, setCreatedByName] = useState<string>("");
  const [updatedByName, setUpdatedByName] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    async function fetchUserNames() {
      if (!consultation) return;

      // Fetch createdBy user name
      if (consultation.createdBy) {
        const { data } = await supabase
          .from("profiles")
          .select("fullName")
          .eq("userId", consultation.createdBy)
          .single();
        if (data) setCreatedByName(data.fullName || "Inconnu");
      }

      // Fetch updatedBy user name
      if (consultation.updatedBy) {
        const { data } = await supabase
          .from("profiles")
          .select("fullName")
          .eq("userId", consultation.updatedBy)
          .single();
        if (data) setUpdatedByName(data.fullName || "Inconnu");
      }
    }

    fetchUserNames();
  }, [consultation, supabase]);

  if (!consultation) return null;

  const diagnostics = consultation.diagnostic
    ? consultation.diagnostic.split(",").map(d => d.trim()).filter(d => d)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Consultation de Maternité
          </DialogTitle>
          <DialogDescription>
            ID: {consultation.consultationId}
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
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{consultation.name || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Âge</p>
                  <p className="font-medium">{consultation.age || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sexe</p>
                  <p className="font-medium">
                    {consultation.sex === 'M' ? 'Masculin' : 
                     consultation.sex === 'F' ? 'Féminin' : 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Origine</p>
                  <Badge variant="outline">
                    {consultation.origin || "Non renseigné"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">{consultation.address || "Non renseigné"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informations Médicales
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nouveau cas</p>
                  <Badge variant={consultation.isNewCase ? "default" : "outline"}>
                    {consultation.isNewCase ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vu par docteur</p>
                  <Badge variant={consultation.seenByDoctor ? "default" : "outline"}>
                    {consultation.seenByDoctor ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enceinte</p>
                  <Badge variant={consultation.isPregnant ? "default" : "outline"}>
                    {consultation.isPregnant ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Signe dominant</p>
                  <p className="font-medium">{consultation.dominantSign || "Non renseigné"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Diagnostics */}
            {diagnostics.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Diagnostics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {diagnostics.map((diag, index) => (
                    <Badge key={index} variant="secondary">
                      {diag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment */}
            {consultation.treatment && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Traitement</h3>
                <p className="text-sm bg-gray-50 p-3 rounded-md">
                  {consultation.treatment}
                </p>
              </div>
            )}

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Informations Additionnelles
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mutualiste</p>
                  <p className="font-medium">{consultation.mitualist || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Référence</p>
                  <p className="font-medium">{consultation.reference || "Non renseigné"}</p>
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
                  <p className="text-gray-500">Créé le</p>
                  <p>
                    {format(new Date(consultation.createdAt), "PPpp", { locale: fr })}
                  </p>
                  <p className="text-gray-500">par {createdByName || "Inconnu"}</p>
                </div>
                {consultation.updatedAt && (
                  <div>
                    <p className="text-gray-500">Modifié le</p>
                    <p>
                      {format(new Date(consultation.updatedAt), "PPpp", { locale: fr })}
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