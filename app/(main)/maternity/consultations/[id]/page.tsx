/* eslint-disable react/no-unescaped-entities */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { pdf } from '@react-pdf/renderer';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Activity,
    ArrowLeft,
    Baby,
    Calendar,
    Clock,
    Edit,
    FileText,
    MapPin,
    Pill,
    Printer,
    Shield,
    Stethoscope,
    Trash2,
    User,
    UserCheck,
    UserX
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteConsultation } from "../actions";
import { ConsultationFormModal } from "../components/ConsultationFormModal";
import { ConsultationPDF } from "../components/ConsultationPDF";
import { MaternityConsultation } from "../types";

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [consultation, setConsultation] = useState<MaternityConsultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [createdByName, setCreatedByName] = useState<string>("");
  const [updatedByName, setUpdatedByName] = useState<string>("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  
  const consultationId = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    loadConsultation();
    
  }, [consultationId]);
 

  async function loadConsultation() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("consultation_maternity")
      .select("*")
      .eq("consultationId", parseInt(consultationId))
      .single();

    if (error) {
      console.error("Error loading consultation:", error);
      router.push("/maternity/consultations");
      return;
    }

    setConsultation(data);

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
    if (!consultation) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la consultation de ${consultation.name || "ce patient"} ? Cette action est irréversible.`)) {
      try {
        const result = await deleteConsultation(consultation.consultationId);
        if (result.success) {
          router.push("/maternity/consultations");
        } else {
          alert(result.error || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Error deleting consultation:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handlePrint = async () => {
    if (!consultation) return;
    
    setPrintLoading(true);
    try {
      // Create PDF blob
      const blob = await pdf(
        <ConsultationPDF 
          consultation={consultation}
          createdByName={createdByName}
          updatedByName={updatedByName}
        />
      ).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `consultation_${consultation.consultationId}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setPrintLoading(false);
    }
  };

  const handleEditSuccess = () => {
    loadConsultation();
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Chargement de la consultation...</span>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Consultation non trouvée</h2>
          <p className="text-gray-600 mb-6">La consultation que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link href="/maternity/consultations">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux consultations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const diagnostics = consultation.diagnostic
    ? consultation.diagnostic.split(",").map(d => d.trim()).filter(d => d)
    : [];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href="/maternity/consultations">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux consultations
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Consultation #{consultation.consultationId}
              </h1>
              <div className="flex gap-2">
                <Badge variant={consultation.isNewCase ? "default" : "outline"}>
                  {consultation.isNewCase ? "Nouveau cas" : "Suivi"}
                </Badge>
                <Badge variant={consultation.seenByDoctor ? "default" : "secondary"}>
                  {consultation.seenByDoctor ? "Vu par docteur" : "Non vu"}
                </Badge>
                {consultation.isPregnant && (
                  <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">
                    <Baby className="mr-1 h-3 w-3" />
                    Enceinte
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              {consultation.name || "Patient sans nom"} • 
              Créée le {format(new Date(consultation.createdAt), "PP", { locale: fr })}
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
          <TabsTrigger value="treatment">
            <Pill className="mr-2 h-4 w-4" />
            Traitement
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
                    <p className="font-medium text-lg">{consultation.name || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Âge</p>
                    <p className="font-medium text-lg">{consultation.age || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sexe</p>
                    <div className="font-medium">
                      {consultation.sex === 'M' ? (
                        <Badge className="bg-blue-100 text-blue-800">Masculin</Badge>
                      ) : consultation.sex === 'F' ? (
                        <Badge className="bg-pink-100 text-pink-800">Féminin</Badge>
                      ) : (
                        "Non renseigné"
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Origine</p>
                    <Badge variant="outline" className="font-medium">
                      {consultation.origin || "Non renseigné"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {consultation.address || "Non renseignée"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Statut de la Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Type de cas</p>
                    <div className="flex items-center gap-2">
                      {consultation.isNewCase ? (
                        <>
                          <UserCheck className="h-5 w-5 text-emerald-500" />
                          <span className="font-medium">Nouveau patient</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">Patient de suivi</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Examen médical</p>
                    <div className="flex items-center gap-2">
                      {consultation.seenByDoctor ? (
                        <>
                          <UserCheck className="h-5 w-5 text-emerald-500" />
                          <span className="font-medium">Examiné par docteur</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-5 w-5 text-amber-500" />
                          <span className="font-medium">Non examiné</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-500 mb-2">État de grossesse</p>
                  <div className="flex items-center gap-2">
                    {consultation.isPregnant ? (
                      <>
                        <Baby className="h-5 w-5 text-pink-500" />
                        <span className="font-medium text-pink-600">Patient enceinte</span>
                      </>
                    ) : (
                      <span className="font-medium text-gray-600">Non enceinte</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medical Information Tab */}
        <TabsContent value="medical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Examen Clinique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Signe dominant</p>
                  <p className="font-medium bg-gray-50 p-3 rounded-md">
                    {consultation.dominantSign || "Aucun signe dominant noté"}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-500 mb-2">Diagnostics</p>
                  {diagnostics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {diagnostics.map((diag, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {diag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucun diagnostic enregistré</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Informations Additionnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Mutualiste</p>
                    <p className="font-medium">
                      {consultation.mitualist !== 'undefined' ? consultation.mitualist : "Non spécifié"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Référence</p>
                    <p className="font-medium">{consultation.reference || "Non renseignée"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Treatment Tab */}
        <TabsContent value="treatment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Prescription et Traitement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consultation.treatment ? (
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {consultation.treatment}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun traitement enregistré pour cette consultation</p>
                </div>
              )}
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
                  <p className="text-sm text-gray-500">Date de création</p>
                  <div className="font-medium">
                    {format(new Date(consultation.createdAt), "PPPP", { locale: fr })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Heure: {format(new Date(consultation.createdAt), "HH:mm", { locale: fr })}
                  </p>
                </div>

                {consultation.updatedAt && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Dernière modification</p>
                      <div className="font-medium">
                        {format(new Date(consultation.updatedAt), "PPPP", { locale: fr })}
                      </div>
                      <p className="text-xs text-gray-500">
                        Heure: {format(new Date(consultation.updatedAt), "HH:mm", { locale: fr })}
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
                  <p className="text-sm text-gray-500">Créé par</p>
                  <p className="font-medium">{createdByName || "Inconnu"}</p>
                  <p className="text-xs text-gray-500">
                    ID: {consultation.createdBy || "Non disponible"}
                  </p>
                </div>

                {consultation.updatedBy && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Dernière modification par</p>
                      <p className="font-medium">{updatedByName || "Inconnu"}</p>
                      <p className="text-xs text-gray-500">
                        ID: {consultation.updatedBy}
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
            Consultation #{consultation.consultationId}
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

      {/* Edit Modal */}
      <ConsultationFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        consultation={consultation}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}