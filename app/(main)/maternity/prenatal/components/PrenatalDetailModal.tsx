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
import { PrenatalRecord, CPN_VISITS, ANEMY_OPTIONS, IRON_FOLIC_OPTIONS } from "../types";
import { createClient } from "@/lib/supabase/client";
import {
  Calendar,
  User,
  FileText,
  Shield,
  Baby,
  Heart,
  Pill,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface PrenatalDetailModalProps {
  record: PrenatalRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrenatalDetailModal({
  record,
  open,
  onOpenChange,
}: PrenatalDetailModalProps) {
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

  // Calculate completed CPN visits
  const completedCPNVisits = CPN_VISITS.filter(
    visit => record[visit.key as keyof PrenatalRecord] !== null
  ).length;

  // Calculate completed iron doses
  const completedIronDoses = [
    record.iron_folicAcidDose1,
    record.iron_folicAcidDose2,
    record.iron_folicAcidDose3,
  ].filter(Boolean).length;

  // Calculate completed sulfoxadin doses
  const completedSulfoxadinDoses = [
    record.sulfoxadin_pyrinDose1,
    record.sulfoxadin_pyrinDose2,
    record.sulfoxadin_pyrinDose3,
  ].filter(Boolean).length;

  const anemyLabel = ANEMY_OPTIONS.find(a => a.value === record.anemy)?.label || record.anemy;
  const ironFolicLabel = IRON_FOLIC_OPTIONS.find(i => i.value === record.iron_folicAcid)?.label || record.iron_folicAcid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Consultation Prénatale
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
                Informations de la Patiente
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
                  <p className="text-sm text-gray-500">Âge de la patiente</p>
                  <p className="font-medium">{record.patientAge || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Âge de la grossesse</p>
                  <p className="font-medium">
                    {record.pregnancyAge ? `${record.pregnancyAge} semaines` : "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* CPN Visits */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Consultations Prénatales (CPN)
              </h3>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  {completedCPNVisits} / 4 visites complétées
                </span>
                <Badge variant={completedCPNVisits >= 4 ? "default" : "outline"}>
                  {completedCPNVisits >= 4 ? "Complet" : "En cours"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CPN_VISITS.map((visit) => {
                  const visitDate = record[visit.key as keyof PrenatalRecord] as string;
                  return (
                    <div key={visit.key} className="space-y-2">
                      <div className={`p-3 rounded-lg ${visit.color} flex items-center justify-between`}>
                        <span className="font-semibold">{visit.label}</span>
                        {visitDate ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      {visitDate && (
                        <p className="text-xs text-center text-gray-500">
                          {format(new Date(visitDate), "dd/MM/yyyy", { locale: fr })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Medications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Traitements et Médications
              </h3>

              {/* Iron/Folic Acid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    Fer + Acide Folique
                  </h4>
                  <Badge variant={completedIronDoses >= 3 ? "default" : "outline"}>
                    {completedIronDoses}/3 doses
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {["Dose 1", "Dose 2", "Dose 3"].map((dose, index) => {
                    const completed = [
                      record.iron_folicAcidDose1,
                      record.iron_folicAcidDose2,
                      record.iron_folicAcidDose3,
                    ][index];
                    
                    return (
                      <div key={dose} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{dose}</span>
                        {completed ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sulfoxadin/Pyrin */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">Sulfadoxine-Pyriméthamine</h4>
                  <Badge variant={completedSulfoxadinDoses >= 3 ? "default" : "outline"}>
                    {completedSulfoxadinDoses}/3 doses
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {["Dose 1", "Dose 2", "Dose 3"].map((dose, index) => {
                    const completed = [
                      record.sulfoxadin_pyrinDose1,
                      record.sulfoxadin_pyrinDose2,
                      record.sulfoxadin_pyrinDose3,
                    ][index];
                    
                    return (
                      <div key={dose} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{dose}</span>
                        {completed ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Anemia Status */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Statut d'Anémie</h4>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="font-medium">
                    {anemyLabel || "Non évalué"}
                  </span>
                </div>
              </div>

              {/* Iron/Folic Acid Status */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Traitement Fer + Acide Folique</h4>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="font-medium">
                    {ironFolicLabel || "Non spécifié"}
                  </span>
                </div>
              </div>
            </div>

            {/* Observations */}
            {record.obeservations && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observations
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">
                      {record.obeservations}
                    </p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Metadata */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
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