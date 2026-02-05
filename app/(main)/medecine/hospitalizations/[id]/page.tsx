/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  MapPin, 
  Stethoscope, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Printer,
  Trash2,
  Clock,
  DoorOpen,
  Activity,
  Heart,
  LogOut,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { HospitalizationFormModal } from "../components/HospitalizationFormModal";
import { MedicineHospitalization } from "../types";
import { deleteHospitalization } from "../actions";
import { pdf } from '@react-pdf/renderer';
import { HospitalizationPDF } from "../components/HospitalizationPDF";

export default function HospitalizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [hospitalization, setHospitalization] = useState<MedicineHospitalization | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [createdByName, setCreatedByName] = useState<string>("");
  const [updatedByName, setUpdatedByName] = useState<string>("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const hospitalizationId = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    loadHospitalization();
  }, [hospitalizationId]);

  async function loadHospitalization() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("hospitalization_medecine")
      .select("*")
      .eq("hospitalizationId", hospitalizationId)
      .single();

    if (error) {
      console.error("Error loading hospitalization:", error);
      router.push("/medecine/hospitalizations");
      return;
    }

    setHospitalization(data);

    // Load user names
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
    if (!hospitalization) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'hospitalisation de ${hospitalization.fullName || "ce patient"} ? Cette action est irréversible.`)) {
      try {
        const result = await deleteHospitalization(hospitalization.hospitalizationId);
        if (result.success) {
          router.push("/medecine/hospitalizations");
        } else {
          alert(result.error || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Error deleting hospitalization:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handlePrintPDF = async () => {
    if (!hospitalization) return;
    
    setPdfLoading(true);
    try {
      const blob = await pdf(
        <HospitalizationPDF 
          hospitalization={hospitalization}
          createdByName={createdByName}
          updatedByName={updatedByName}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hospitalisation_medecine_${hospitalization.hospitalizationId.slice(0, 8)}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleEditSuccess = () => {
    loadHospitalization();
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Chargement de l'hospitalisation...</span>
        </div>
      </div>
    );
  }

  if (!hospitalization) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hospitalisation non trouvée</h2>
          <p className="text-gray-600 mb-6">L'hospitalisation que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link href="/medecine/hospitalizations">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux hospitalisations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getLeaveStatus = () => {
    if (hospitalization.leave_authorized) {
      return { label: "Sortie autorisée", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle };
    }
    if (hospitalization.leave_evaded) {
      return { label: "Sortie par évasion", color: "bg-amber-100 text-amber-800", icon: DoorOpen };
    }
    if (hospitalization.leave_transfered) {
      return { label: "Sortie par transfert", color: "bg-blue-100 text-blue-800", icon: DoorOpen };
    }
    if (hospitalization.leave_diedBefore48h) {
      return { label: "Décès avant 48h", color: "bg-rose-100 text-rose-800", icon: Heart };
    }
    if (hospitalization.leave_diedAfter48h) {
      return { label: "Décès après 48h", color: "bg-rose-100 text-rose-800", icon: Heart };
    }
    return { label: "En cours d'hospitalisation", color: "bg-gray-100 text-gray-800", icon: Activity };
  };

  const leaveStatus = getLeaveStatus();
  const StatusIcon = leaveStatus.icon;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href="/medecine/hospitalizations">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux hospitalisations
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Hospitalisation #{hospitalization.hospitalizationId.slice(0, 8)}
              </h1>
              <div className="flex gap-2">
                {hospitalization.isEmergency && (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Urgence
                  </Badge>
                )}
                {hospitalization.isPregnant && (
                  <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">
                    Enceinte
                  </Badge>
                )}
                <Badge className={leaveStatus.color}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {leaveStatus.label}
                </Badge>
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              {hospitalization.fullName || "Patient sans nom"} • 
              Admis le {format(new Date(hospitalization.createdAt), "PP", { locale: fr })}
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
              onClick={handlePrintPDF}
              disabled={pdfLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {pdfLoading ? "Génération..." : "Télécharger PDF"}
            </Button>
            <Button onClick={() => setEditModalOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="patient" className="space-y-6">
        <TabsList>
          <TabsTrigger value="patient">
            <User className="mr-2 h-4 w-4" />
            Informations Patient
          </TabsTrigger>
          <TabsTrigger value="medical">
            <Stethoscope className="mr-2 h-4 w-4" />
            Informations Médicales
          </TabsTrigger>
          <TabsTrigger value="status">
            <Activity className="mr-2 h-4 w-4" />
            Statut Hospitalisation
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <Clock className="mr-2 h-4 w-4" />
            Métadonnées
          </TabsTrigger>
        </TabsList>

        {/* Patient Information Tab */}
        <TabsContent value="patient">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium text-lg">{hospitalization.fullName || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Âge</p>
                    <p className="font-medium text-lg">{hospitalization.age || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sexe</p>
                    <div className="font-medium">
                      {hospitalization.sex === 'M' ? (
                        <Badge className="bg-blue-100 text-blue-800">Masculin</Badge>
                      ) : hospitalization.sex === 'F' ? (
                        <Badge className="bg-pink-100 text-pink-800">Féminin</Badge>
                      ) : (
                        "Non renseigné"
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Origine</p>
                    <Badge variant="outline" className="font-medium">
                      {hospitalization.origin || "Non renseigné"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {hospitalization.isEmergency ? (
                      <>
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-sm text-gray-500">Type admission</p>
                          <p className="font-medium text-red-600">Cas d'urgence</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-500">Type admission</p>
                        <p className="font-medium">Admission normale</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hospitalization.isPregnant ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="text-sm text-gray-500">État</p>
                          <p className="font-medium text-emerald-600">Patient enceinte</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">État</p>
                          <p className="font-medium">Non enceinte</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaving Date Card */}
            {hospitalization.leavingDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LogOut className="h-5 w-5" />
                    Informations de Sortie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Date de sortie</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <p className="font-medium text-lg">
                          {format(new Date(hospitalization.leavingDate), "PPPP", { locale: fr })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Heure: {format(new Date(hospitalization.leavingDate), "HH:mm", { locale: fr })}
                      </p>
                    </div>
                    
                    {hospitalization.createdAt && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500">Durée d'hospitalisation</p>
                        <p className="font-medium">
                          {Math.ceil(
                            (new Date(hospitalization.leavingDate).getTime() - 
                             new Date(hospitalization.createdAt).getTime()) / 
                            (1000 * 60 * 60 * 24)
                          )} jour(s)
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Medical Information Tab */}
        <TabsContent value="medical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Diagnostic d'Entrée
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hospitalization.entryDiagnostic ? (
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                      {hospitalization.entryDiagnostic}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun diagnostic d'entrée enregistré</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Diagnostic de Sortie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hospitalization.leavingDiagnostic ? (
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                      {hospitalization.leavingDiagnostic}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun diagnostic de sortie enregistré</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Statut de l'Hospitalisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg border ${leaveStatus.color.replace('text-', 'border-').replace('bg-', 'border-')}`}>
                  <div className="flex items-center gap-3">
                    <StatusIcon className="h-6 w-6" />
                    <div>
                      <p className="text-sm text-gray-500">Statut actuel</p>
                      <p className="font-semibold text-lg">{leaveStatus.label}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-3">Détails du statut</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-5 w-5 ${hospitalization.leave_authorized ? 'text-emerald-500' : 'text-gray-300'}`} />
                      <span className={hospitalization.leave_authorized ? 'font-medium' : 'text-gray-400'}>
                        Sortie autorisée
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DoorOpen className={`h-5 w-5 ${hospitalization.leave_evaded ? 'text-amber-500' : 'text-gray-300'}`} />
                      <span className={hospitalization.leave_evaded ? 'font-medium' : 'text-gray-400'}>
                        Sortie par évasion
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DoorOpen className={`h-5 w-5 ${hospitalization.leave_transfered ? 'text-blue-500' : 'text-gray-300'}`} />
                      <span className={hospitalization.leave_transfered ? 'font-medium' : 'text-gray-400'}>
                        Sortie par transfert
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className={`h-5 w-5 ${hospitalization.leave_diedBefore48h ? 'text-rose-500' : 'text-gray-300'}`} />
                      <span className={hospitalization.leave_diedBefore48h ? 'font-medium' : 'text-gray-400'}>
                        Décès avant 48h
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className={`h-5 w-5 ${hospitalization.leave_diedAfter48h ? 'text-rose-500' : 'text-gray-300'}`} />
                      <span className={hospitalization.leave_diedAfter48h ? 'font-medium' : 'text-gray-400'}>
                        Décès après 48h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dates et Horaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Date d'admission</p>
                  <div className="font-medium">
                    {format(new Date(hospitalization.createdAt), "PPPP", { locale: fr })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Heure: {format(new Date(hospitalization.createdAt), "HH:mm", { locale: fr })}
                  </p>
                </div>

                {hospitalization.leavingDate && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Date de sortie</p>
                      <div className="font-medium">
                        {format(new Date(hospitalization.leavingDate), "PPPP", { locale: fr })}
                      </div>
                      <p className="text-xs text-gray-500">
                        Heure: {format(new Date(hospitalization.leavingDate), "HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </>
                )}

                {hospitalization.updatedAt && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Dernière modification</p>
                      <div className="font-medium">
                        {format(new Date(hospitalization.updatedAt), "PPPP", { locale: fr })}
                      </div>
                      <p className="text-xs text-gray-500">
                        Heure: {format(new Date(hospitalization.updatedAt), "HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personnel Responsable
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Enregistré par</p>
                  <p className="font-medium">{createdByName || "Inconnu"}</p>
                  <p className="text-xs text-gray-500">
                    ID: {hospitalization.createdBy || "Non disponible"}
                  </p>
                </div>

                {hospitalization.updatedBy && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Dernière modification par</p>
                      <p className="font-medium">{updatedByName || "Inconnu"}</p>
                      <p className="text-xs text-gray-500">
                        ID: {hospitalization.updatedBy}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Hospitalisation #{hospitalization.hospitalizationId.slice(0, 8)}
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
              onClick={handlePrintPDF}
              disabled={pdfLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {pdfLoading ? "Génération..." : "Télécharger PDF"}
            </Button>
            <Button onClick={() => setEditModalOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <HospitalizationFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        hospitalization={hospitalization}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}