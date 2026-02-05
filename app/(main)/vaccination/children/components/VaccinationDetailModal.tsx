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
import { VaccinationEnfant, VACCINES } from "../types";
import { createClient } from "@/lib/supabase/client";
import {
  Calendar,
  User,
  MapPin,
  Activity,
  Pill,
  Shield,
  Baby,
} from "lucide-react";

interface VaccinationDetailModalProps {
  vaccination: VaccinationEnfant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VaccinationDetailModal({
  vaccination,
  open,
  onOpenChange,
}: VaccinationDetailModalProps) {
  const [createdByName, setCreatedByName] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    async function fetchUserName() {
      if (!vaccination || !vaccination.createdBy) return;

      const { data } = await supabase
        .from("profiles")
        .select("fullName")
        .eq("userId", vaccination.createdBy)
        .single();

      if (data) setCreatedByName(data.fullName || "Inconnu");
    }

    fetchUserName();
  }, [vaccination, supabase]);

  if (!vaccination) return null;

  const getVaccineStatusColor = (status: string | null) => {
    switch (status) {
      case "fait":
        return "bg-emerald-100 text-emerald-800";
      case "non_fait":
        return "bg-amber-100 text-amber-800";
      case "contre_indication":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVaccineStatusText = (status: string | null) => {
    switch (status) {
      case "fait":
        return "Fait";
      case "non_fait":
        return "Non fait";
      case "contre_indication":
        return "Contre-indication";
      default:
        return "Non renseigné";
    }
  };

  const vaccines = VACCINES.map((vaccine) => ({
    label: vaccine.label,
    status: vaccination[vaccine.key as keyof VaccinationEnfant] as
      | string
      | null,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-emerald-600" />
            Vaccination Enfant
          </DialogTitle>
          <DialogDescription>ID: {vaccination.id}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Child Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations de l'Enfant
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">
                    {vaccination.name || "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Âge</p>
                  <p className="font-medium">
                    {vaccination.age
                      ? `${vaccination.age} mois`
                      : "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sexe</p>
                  <p className="font-medium">
                    {vaccination.sex === "M"
                      ? "Masculin"
                      : vaccination.sex === "F"
                      ? "Féminin"
                      : "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Origine</p>
                  <Badge variant="outline">
                    {vaccination.origin || "Non renseigné"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">
                    {vaccination.address || "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Physical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Informations Physiques
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Poids</p>
                  <p className="font-medium">
                    {vaccination.weight
                      ? `${vaccination.weight} kg`
                      : "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Taille</p>
                  <p className="font-medium">
                    {vaccination.height
                      ? `${vaccination.height} cm`
                      : "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Medication Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Médicaments Administrés
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vitamine A</p>
                  <Badge
                    variant={
                      vaccination.receivedVitamineA ? "default" : "outline"
                    }>
                    {vaccination.receivedVitamineA ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">AlBendazole</p>
                  <Badge
                    variant={
                      vaccination.receivedAlBendazole ? "default" : "outline"
                    }>
                    {vaccination.receivedAlBendazole ? "Oui" : "Non"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Vaccines */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Vaccins
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vaccines.map((vaccine, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-sm text-gray-500">{vaccine.label}</p>
                    <Badge className={getVaccineStatusColor(vaccine.status)}>
                      {getVaccineStatusText(vaccine.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Strategy Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Stratégie de Vaccination
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {vaccination.strategy
                    ? vaccination.strategy.replace("_", " ")
                    : "Non renseignée"}
                </Badge>
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
                    {format(new Date(vaccination.createdAt), "PPpp", {
                      locale: fr,
                    })}
                  </p>
                  <p className="text-gray-500">
                    par {createdByName || "Inconnu"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
