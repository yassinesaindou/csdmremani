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
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { MaternityAppointment, getDisplayStatus, getStatusConfig } from "../types";
import { createClient } from "@/lib/supabase/client";
import {
  Calendar,
  User,
  MapPin,
  Phone,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ClockAlert,
  CalendarOff,
  Globe,
} from "lucide-react";

// Helper function to convert UTC to Comoros time (GMT+3)
function convertUTCToComorosTime(utcDate: Date | string): Date {
  const date = new Date(utcDate);
  // Add 3 hours for Comoros timezone (GMT+3)
  return new Date(date.getTime() + (3 * 60 * 60 * 1000));
}

// Helper function to format time in Comoros timezone
function formatComorosTime(date: Date | string): string {
  const comorosDate = convertUTCToComorosTime(date);
  return format(comorosDate, "HH:mm", { locale: fr });
}

// Helper function to format date in Comoros timezone
function formatComorosDate(date: Date | string): string {
  const comorosDate = convertUTCToComorosTime(date);
  return format(comorosDate, "dd/MM/yyyy", { locale: fr });
}

// Helper function to get full date in Comoros timezone
function formatComorosFullDate(date: Date | string): string {
  const comorosDate = convertUTCToComorosTime(date);
  return format(comorosDate, "EEEE d MMMM yyyy", { locale: fr });
}

interface AppointmentDetailModalProps {
  appointment: MaternityAppointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailModal({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailModalProps) {
  const [createdByName, setCreatedByName] = useState<string>("");
  const [updatedByName, setUpdatedByName] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    async function fetchUserNames() {
      if (!appointment) return;

      if (appointment.createdBy) {
        const { data } = await supabase
          .from("profiles")
          .select("fullName")
          .eq("userId", appointment.createdBy)
          .single();
        if (data) setCreatedByName(data.fullName || "Inconnu");
      }

      if (appointment.updatedBy) {
        const { data } = await supabase
          .from("profiles")
          .select("fullName")
          .eq("userId", appointment.updatedBy)
          .single();
        if (data) setUpdatedByName(data.fullName || "Inconnu");
      }
    }

    fetchUserNames();
  }, [appointment, supabase]);

  if (!appointment) return null;

  const displayStatus = getDisplayStatus(appointment);
  const statusConfig = getStatusConfig(displayStatus);
  
  // Convert stored UTC time to Comoros time for display
  const appointmentComorosDate = appointment.appointmentDate 
    ? convertUTCToComorosTime(appointment.appointmentDate)
    : null;
  
  const now = new Date();
  const nowComoros = convertUTCToComorosTime(now);
  
  const isPast = appointmentComorosDate ? appointmentComorosDate < nowComoros : false;
  const isToday = appointmentComorosDate
    ? appointmentComorosDate.toDateString() === nowComoros.toDateString()
    : false;

  const getTimeStatus = () => {
    if (!appointmentComorosDate || displayStatus !== "scheduled") return null;

    const diffHours =
      Math.abs(appointmentComorosDate.getTime() - nowComoros.getTime()) / (1000 * 60 * 60);

    if (isToday) {
      return {
        label: "Aujourd'hui",
        color: "bg-amber-100 text-amber-800",
        icon: <AlertCircle className="h-4 w-4" />,
      };
    } else if (diffHours < 24) {
      return {
        label: "Dans moins de 24h",
        color: "bg-rose-100 text-rose-800",
        icon: <AlertCircle className="h-4 w-4" />,
      };
    } else if (diffHours < 48) {
      return {
        label: "Dans 48h",
        color: "bg-orange-100 text-orange-800",
        icon: <ClockAlert className="h-4 w-4" />,
      };
    }
    return null;
  };

  const timeStatus = getTimeStatus();

  // Calculate days missed for missed appointments
  let daysMissed = 0;
  if (displayStatus === "missed" && appointmentComorosDate) {
    daysMissed = differenceInDays(nowComoros, appointmentComorosDate);
  }

  // Calculate days difference for all appointments
  let daysDifference = 0;
  if (appointmentComorosDate) {
    daysDifference = displayStatus === "missed" 
      ? differenceInDays(nowComoros, appointmentComorosDate)
      : isPast 
        ? differenceInDays(nowComoros, appointmentComorosDate)
        : differenceInDays(appointmentComorosDate, nowComoros);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rendez-vous #{appointment.appointmentId}
          </DialogTitle>
          <DialogDescription>Consultation de maternité</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Status Banner */}
            <div
              className={`p-4 rounded-lg ${
                statusConfig?.color || "bg-gray-100"
              } flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {displayStatus === "completed" && (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                )}
                {displayStatus === "cancelled" && (
                  <XCircle className="h-5 w-5 text-rose-600" />
                )}
                {displayStatus === "scheduled" && (
                  <Clock className="h-5 w-5 text-blue-600" />
                )}
                {displayStatus === "missed" && (
                  <CalendarOff className="h-5 w-5 text-amber-600" />
                )}
                <div>
                  <p className="font-semibold">
                    {statusConfig?.label || "Statut inconnu"}
                  </p>
                  <p className="text-sm opacity-90">
                    {displayStatus === "scheduled" &&
                      "Rendez-vous programmé"}
                    {displayStatus === "completed" &&
                      "Rendez-vous terminé"}
                    {displayStatus === "cancelled" &&
                      "Rendez-vous annulé"}
                    {displayStatus === "missed" && 
                      `Rendez-vous manqué depuis ${daysMissed} jour${daysMissed > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              {timeStatus && (
                <Badge
                  className={`${timeStatus.color} flex items-center gap-1`}>
                  {timeStatus.icon}
                  {timeStatus.label}
                </Badge>
              )}
            </div>

            {/* Informations du Patient */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations du Patient
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">
                    {appointment.patientName || "Non renseigné"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </p>
                  <p className="font-medium">
                    {appointment.patientPhoneNumber || "Non renseigné"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </p>
                  <p className="font-medium">
                    {appointment.patientAddress || "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Détails du Rendez-vous */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Détails du Rendez-vous
              </h3>

              {appointmentComorosDate ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-lg">
                        {formatComorosFullDate(appointment.appointmentDate!)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatComorosDate(appointment.appointmentDate!)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Heure
                        <Badge variant="outline" className="ml-1 text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          GMT+3
                        </Badge>
                      </p>
                      <p className="font-medium text-lg">
                        {formatComorosTime(appointment.appointmentDate!)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Heure locale Comoros
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Information temporelle
                    </p>
                    <div className="mt-2 space-y-2">
                      <Badge variant={isToday ? "default" : "outline"}>
                        {isToday ? "Aujourd'hui" : isPast ? "Passé" : "À venir"}
                      </Badge>
                      {appointmentComorosDate && displayStatus !== "missed" && (
                        <p className="text-sm text-gray-600">
                          {isPast 
                            ? `Ce rendez-vous a eu lieu il y a ${daysDifference} jour${daysDifference > 1 ? 's' : ''}`
                            : `Ce rendez-vous est dans ${daysDifference} jour${daysDifference > 1 ? 's' : ''}`
                          }
                        </p>
                      )}
                      {displayStatus === "missed" && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-600">
                            ⚠️ Ce rendez-vous a été manqué il y a {daysMissed} jour{daysMissed > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Aucune date de rendez-vous définie
                </p>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Motif du rendez-vous
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-medium">
                    {appointment.appointmentReason || "Aucun motif spécifié"}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations Techniques */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informations Techniques
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Statut stocké (base de données)</p>
                    <Badge variant="outline" className="mt-1">
                      {appointment.status === 'scheduled' ? 'Programmé' : 
                       appointment.status === 'completed' ? 'Terminé' : 
                       appointment.status === 'cancelled' ? 'Annulé' : '—'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500">Statut affiché (calculé)</p>
                    <Badge className={`${statusConfig.color} border-0 mt-1`}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  {appointment.appointmentDate && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Informations temporelles</p>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs">
                          <span className="font-medium">UTC (stocké): </span>
                          {format(new Date(appointment.appointmentDate), "dd/MM/yyyy HH:mm")}
                        </p>
                        <p className="text-xs">
                          <span className="font-medium">Comoros (affiché): </span>
                          {formatComorosDate(appointment.appointmentDate)} {formatComorosTime(appointment.appointmentDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Métadonnées */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Métadonnées
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Créé le</p>
                  <p>
                    {format(new Date(appointment.createdAt), "PPpp", {
                      locale: fr,
                    })}
                  </p>
                  <p className="text-gray-500">
                    par {createdByName || "Inconnu"}
                  </p>
                </div>
                {appointment.updatedAt && (
                  <div>
                    <p className="text-gray-500">Modifié le</p>
                    <p>
                      {format(new Date(appointment.updatedAt), "PPpp", {
                        locale: fr,
                      })}
                    </p>
                    <p className="text-gray-500">
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