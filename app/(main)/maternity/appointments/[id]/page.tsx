/* eslint-disable react/no-unescaped-entities */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { pdf } from '@react-pdf/renderer';
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  ClockAlert,
  Edit,
  FileText,
  MapPin,
  Phone,
  Printer,
  Trash2,
  User,
  XCircle,
  CalendarOff,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteAppointment } from "../actions";
import { AppointmentFormModal } from "../components/AppointmentFormModal";
import { AppointmentPDF } from "../components/AppointmentPDF";
import { getDisplayStatus, getStatusConfig, MaternityAppointment } from "../types";

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

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<MaternityAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [createdByName, setCreatedByName] = useState<string>("");
  const [updatedByName, setUpdatedByName] = useState<string>("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  
  const id = parseInt(params.id as string);
  const supabase = createClient();

  useEffect(() => {
    loadAppointment();
  }, [id]);

  async function loadAppointment() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("maternity_appointments")
      .select("*")
      .eq("appointmentId", id)
      .single();

    if (error) {
      console.error("Erreur lors du chargement du rendez-vous:", error);
      router.push("/maternity/appointments");
      return;
    }

    setAppointment(data);

    // Charger les noms des utilisateurs
    if (data.createdBy) {
      const { data: creator } = await supabase
        .from("profiles")
        .select("fullName")
        .eq("userId", data.createdBy)
        .single();
      if (creator) setCreatedByName(creator.fullName || "Inconnu");
    }

    if (data.updatedBy) {
      const { data: updater } = await supabase
        .from("profiles")
        .select("fullName")
        .eq("userId", data.updatedBy)
        .single();
      if (updater) setUpdatedByName(updater.fullName || "Inconnu");
    }

    setLoading(false);
  }

  const handleDelete = async () => {
    if (!appointment) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rendez-vous #${appointment.appointmentId} ? Cette action est irréversible.`)) {
      try {
        const result = await deleteAppointment(appointment.appointmentId);
        if (result.success) {
          router.push("/maternity/appointments");
        } else {
          alert(result.error || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du rendez-vous:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handlePrint = async () => {
    if (!appointment) return;
    
    setPrintLoading(true);
    try {
      // Créer le PDF blob
      const blob = await pdf(
        <AppointmentPDF 
          appointment={appointment}
          createdByName={createdByName}
          updatedByName={updatedByName}
        />
      ).toBlob();
      
      // Créer le lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rendezvous_${appointment.appointmentId}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setPrintLoading(false);
    }
  };

  const handleEditSuccess = () => {
    loadAppointment();
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Chargement du rendez-vous...</span>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rendez-vous non trouvé</h2>
          <p className="text-gray-600 mb-6">Le rendez-vous que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link href="/maternity/appointments">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux rendez-vous
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

  // Calculer les jours manqués pour les rendez-vous manqués
  let daysMissed = 0;
  if (displayStatus === 'missed' && appointmentComorosDate) {
    daysMissed = differenceInDays(nowComoros, appointmentComorosDate);
  }

  // Calculer la différence de jours
  let daysDifference = 0;
  if (appointmentComorosDate) {
    daysDifference = isPast 
      ? differenceInDays(nowComoros, appointmentComorosDate)
      : differenceInDays(appointmentComorosDate, nowComoros);
  }

  const getTimeStatus = () => {
    if (!appointmentComorosDate || displayStatus !== 'scheduled') return null;
    
    const diffHours = Math.abs(appointmentComorosDate.getTime() - nowComoros.getTime()) / (1000 * 60 * 60);
    
    if (isToday) {
      return {
        label: "Aujourd'hui",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <AlertCircle className="h-4 w-4" />
      };
    } else if (diffHours < 24) {
      return {
        label: "Dans moins de 24h",
        color: "bg-rose-100 text-rose-800 border-rose-200",
        icon: <AlertCircle className="h-4 w-4" />
      };
    } else if (diffHours < 48) {
      return {
        label: "Dans 48h",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: <ClockAlert className="h-4 w-4" />
      };
    }
    return null;
  };

  const timeStatus = getTimeStatus();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href="/maternity/appointments">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux rendez-vous
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Rendez-vous #{appointment.appointmentId}
              </h1>
              <div className="flex gap-2">
                <Badge className={`${statusConfig?.color} border-0`}>
                  {statusConfig?.label}
                  {displayStatus === 'missed' && daysMissed > 0 && ` (${daysMissed}j)`}
                </Badge>
                {timeStatus && (
                  <Badge variant="outline" className={timeStatus.color}>
                    {timeStatus.icon}
                    {timeStatus.label}
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              {appointment.patientName || "Patient sans nom"} • 
              Créé le {formatComorosDate(appointment.createdAt)} {formatComorosTime(appointment.createdAt)} (GMT+3)
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePrint}
              disabled={printLoading}
            >
              <Printer className="mr-2 h-4 w-4" />
              {printLoading ? "Génération..." : "Télécharger PDF"}
            </Button>
            <Button onClick={() => setEditModalOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu Principal */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">
            <User className="mr-2 h-4 w-4" />
            Détails
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="mr-2 h-4 w-4" />
            Chronologie
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <FileText className="mr-2 h-4 w-4" />
            Métadonnées
          </TabsTrigger>
        </TabsList>

        {/* Onglet Détails */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations du Patient */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations du Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium text-lg">{appointment.patientName || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </p>
                    <p className="font-medium text-lg">{appointment.patientPhoneNumber || "Non renseigné"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Adresse
                    </p>
                    <p className="font-medium text-gray-700 bg-gray-50 p-3 rounded-md mt-1">
                      {appointment.patientAddress || "Non renseignée"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-500 mb-2">Motif du rendez-vous</p>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="font-medium">
                      {appointment.appointmentReason || "Aucun motif spécifié"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Détails du Rendez-vous */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Détails du Rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {appointmentComorosDate ? (
                  <>
                    <div className="space-y-4">
                      <div className={`text-center p-4 rounded-lg border ${
                        displayStatus === 'missed' 
                          ? 'bg-amber-50 border-amber-200' 
                          : displayStatus === 'cancelled'
                          ? 'bg-rose-50 border-rose-200'
                          : displayStatus === 'completed'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <p className={`text-sm ${
                          displayStatus === 'missed' ? 'text-amber-600' :
                          displayStatus === 'cancelled' ? 'text-rose-600' :
                          displayStatus === 'completed' ? 'text-emerald-600' :
                          'text-blue-600'
                        }`}>
                          Date du rendez-vous
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {formatComorosFullDate(appointment.appointmentDate!)}
                        </p>
                        <p className="text-lg text-gray-600 mt-1">
                          {format(appointmentComorosDate, "EEEE", { locale: fr })}
                        </p>
                      </div>

                      <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <p className="text-sm text-emerald-600">Heure du rendez-vous</p>
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            GMT+3
                          </Badge>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {formatComorosTime(appointment.appointmentDate!)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Heure locale Comoros
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Statut temporel</span>
                        <Badge variant={isToday ? "default" : "outline"}>
                          {isToday ? "Aujourd'hui" : isPast ? "Passé" : "À venir"}
                        </Badge>
                      </div>
                      
                      {appointmentComorosDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Jours écoulés/restants</span>
                          <span className={`font-medium ${
                            displayStatus === 'missed' ? 'text-amber-600' : ''
                          }`}>
                            {displayStatus === 'missed' 
                              ? `Manqué depuis ${daysMissed} jour${daysMissed > 1 ? 's' : ''}`
                              : isPast 
                                ? `Il y a ${daysDifference} jour${daysDifference > 1 ? 's' : ''}`
                                : `Dans ${daysDifference} jour${daysDifference > 1 ? 's' : ''}`
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {displayStatus === 'missed' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-amber-800">Rendez-vous manqué</p>
                            <p className="text-sm text-amber-700 mt-1">
                              Ce rendez-vous était programmé mais n'a pas été marqué comme terminé ou annulé. 
                              Il est considéré comme manqué car la date est passée depuis plus de 24 heures.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune date de rendez-vous définie</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Chronologie */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Chronologie et Statut
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Ligne de chronologie */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Éléments de chronologie */}
                <div className="space-y-8 relative">
                  {/* Création */}
                  <div className="flex items-start">
                    <div className="z-10 flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900">Rendez-vous créé</h5>
                        <div className="text-right">
                          <span className="text-sm text-gray-500 block">
                            {formatComorosDate(appointment.createdAt)} {formatComorosTime(appointment.createdAt)}
                          </span>
                          <span className="text-xs text-gray-400">GMT+3</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Le rendez-vous a été créé dans le système
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Par: {createdByName || "Inconnu"}
                      </p>
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="flex items-start">
                    <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      displayStatus === 'completed' ? 'bg-emerald-100 border-emerald-500' :
                      displayStatus === 'cancelled' ? 'bg-rose-100 border-rose-500' :
                      displayStatus === 'scheduled' ? 'bg-blue-100 border-blue-500' :
                      'bg-amber-100 border-amber-500'
                    }`}>
                      {displayStatus === 'completed' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                      {displayStatus === 'cancelled' && <XCircle className="h-4 w-4 text-rose-600" />}
                      {displayStatus === 'scheduled' && <Clock className="h-4 w-4 text-blue-600" />}
                      {displayStatus === 'missed' && <CalendarOff className="h-4 w-4 text-amber-600" />}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900">Statut actuel</h5>
                        <Badge className={`${statusConfig?.color} border-0`}>
                          {statusConfig?.label}
                          {displayStatus === 'missed' && daysMissed > 0 && ` (${daysMissed}j)`}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {displayStatus === 'scheduled' && 'Rendez-vous programmé et en attente'}
                        {displayStatus === 'completed' && 'Rendez-vous terminé avec succès'}
                        {displayStatus === 'cancelled' && 'Rendez-vous annulé'}
                        {displayStatus === 'missed' && `Rendez-vous manqué il y a ${daysMissed} jour${daysMissed > 1 ? 's' : ''}`}
                      </p>
                      {displayStatus === 'missed' && (
                        <p className="text-xs text-amber-600 mt-1">
                          * Statut calculé: non terminé, non annulé, date passée depuis plus de 24h
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date du Rendez-vous */}
                  {appointmentComorosDate && (
                    <div className="flex items-start">
                      <div className="z-10 flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900">Date du rendez-vous</h5>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 block">
                              {formatComorosDate(appointment.appointmentDate!)} {formatComorosTime(appointment.appointmentDate!)}
                            </span>
                            <span className="text-xs text-gray-400">GMT+3</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {displayStatus === 'missed' 
                            ? `Date prévue pour ce rendez-vous (dépassée depuis ${daysMissed} jour${daysMissed > 1 ? 's' : ''})`
                            : isPast 
                              ? 'Ce rendez-vous a eu lieu à cette date'
                              : 'Le rendez-vous est prévu à cette date'
                          }
                        </p>
                        {timeStatus && (
                          <Badge variant="outline" className={`mt-2 ${timeStatus.color}`}>
                            {timeStatus.icon}
                            {timeStatus.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dernière Modification */}
                  {appointment.updatedAt && (
                    <div className="flex items-start">
                      <div className="z-10 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-400 flex items-center justify-center">
                        <Edit className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900">Dernière modification</h5>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 block">
                              {formatComorosDate(appointment.updatedAt)} {formatComorosTime(appointment.updatedAt)}
                            </span>
                            <span className="text-xs text-gray-400">GMT+3</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Dernière mise à jour du rendez-vous
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Par: {updatedByName || "Inconnu"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Métadonnées */}
        <TabsContent value="metadata">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Dates et Horaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Date de création</p>
                    <div className="font-medium">
                      {formatComorosFullDate(appointment.createdAt)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Heure: {formatComorosTime(appointment.createdAt)} (GMT+3)
                    </p>
                    <p className="text-xs text-gray-400">
                      UTC: {format(new Date(appointment.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>

                  {appointment.updatedAt && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500">Dernière modification</p>
                        <div className="font-medium">
                          {formatComorosFullDate(appointment.updatedAt)}
                        </div>
                        <p className="text-xs text-gray-500">
                          Heure: {formatComorosTime(appointment.updatedAt)} (GMT+3)
                        </p>
                        <p className="text-xs text-gray-400">
                          UTC: {format(new Date(appointment.updatedAt), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personnel Responsable
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Créé par</p>
                    <p className="font-medium">{createdByName || "Inconnu"}</p>
                    <p className="text-xs text-gray-500">
                      ID: {appointment.createdBy || "Non disponible"}
                    </p>
                  </div>

                  {appointment.updatedBy && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500">Dernière modification par</p>
                        <p className="font-medium">{updatedByName || "Inconnu"}</p>
                        <p className="text-xs text-gray-500">
                          ID: {appointment.updatedBy}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informations Techniques */}
          {appointment.appointmentDate && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Informations Techniques (Fuseau Horaire)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date/heure UTC (stockée)</p>
                      <p className="font-mono text-sm bg-white p-2 rounded border">
                        {format(new Date(appointment.appointmentDate), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date/heure Comoros (affichée)</p>
                      <p className="font-mono text-sm bg-white p-2 rounded border">
                        {formatComorosDate(appointment.appointmentDate)} {formatComorosTime(appointment.appointmentDate)} GMT+3
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Note: Le système stocke les dates en UTC (temps universel coordonné) et les convertit automatiquement en heure Comoros (GMT+3) pour l'affichage.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions Rapides */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Rendez-vous #{appointment.appointmentId} • 
            Statut: {statusConfig?.label}
            {displayStatus === 'missed' && daysMissed > 0 && ` (${daysMissed} jour${daysMissed > 1 ? 's' : ''})`}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePrint}
              disabled={printLoading}
            >
              <Printer className="mr-2 h-4 w-4" />
              {printLoading ? "Génération..." : "Télécharger PDF"}
            </Button>
            <Button onClick={() => setEditModalOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Modification */}
      <AppointmentFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        appointment={appointment}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

export function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-gray-600">Chargement du rendez-vous...</span>
      </div>
    </div>
  );
}