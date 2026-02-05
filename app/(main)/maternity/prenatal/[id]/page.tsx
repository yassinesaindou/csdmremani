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
  ArrowLeft,
  Baby,
  Calendar,
  Clock,
  Edit,
  FileText,
  Heart,
  Pill,
  Printer,
  Stethoscope,
  Trash2,
  User,
  CheckCircle,
  XCircle,
  Activity,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deletePrenatalRecord } from "../actions";
import { PrenatalFormModal } from "../components/PrenatalFormModal";
 
import { PrenatalRecord, CPN_VISITS, ANEMY_OPTIONS, IRON_FOLIC_OPTIONS } from "../types";
import { PrenatalPDF } from "../components/PrenatalPDF";

export default function PrenatalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<PrenatalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [createdByName, setCreatedByName] = useState<string>("");
  const [updatedByName, setUpdatedByName] = useState<string>("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  
  const id = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    loadRecord();
    
  }, [id]);

 

  async function loadRecord() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("prenatal_maternity")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error loading prenatal record:", error);
      router.push("/maternity/prenatal");
      return;
    }

    setRecord(data);

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
    if (!record) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la consultation prénatale de ${record.fullName || "cette patiente"} ? Cette action est irréversible.`)) {
      try {
        const result = await deletePrenatalRecord(record.id);
        if (result.success) {
          router.push("/maternity/prenatal");
        } else {
          alert(result.error || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Error deleting record:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handlePrint = async () => {
    if (!record) return;
    
    setPrintLoading(true);
    try {
      // Create PDF blob
      const blob = await pdf(
        <PrenatalPDF 
          record={record}
          createdByName={createdByName}
          updatedByName={updatedByName}
        />
      ).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prenatal_${record.fileNumber || record.id}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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
    loadRecord();
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

  if (!record) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Consultation non trouvée</h2>
          <p className="text-gray-600 mb-6">La consultation que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link href="/maternity/prenatal">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux consultations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

  // Get CPN visit dates
  const getCPNDate = (visitKey: string) => {
    const date = record[visitKey as keyof PrenatalRecord] as string;
    return date ? format(new Date(date), "dd/MM/yyyy", { locale: fr }) : null;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href="/maternity/prenatal">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux consultations
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Consultation Prénatale {record.fileNumber ? `- ${record.fileNumber}` : ''}
              </h1>
              <div className="flex gap-2">
                <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">
                  <Baby className="mr-1 h-3 w-3" />
                  Prénatal
                </Badge>
                {completedCPNVisits >= 4 && (
                  <Badge className="bg-emerald-100 text-emerald-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    CPN Complet
                  </Badge>
                )}
                {record.anemy && record.anemy !== 'none' && (
                  <Badge className="bg-rose-100 text-rose-800">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Anémie
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              {record.fullName || "Patiente sans nom"} • 
              {record.patientAge && ` ${record.patientAge} ans •`}
              {record.pregnancyAge && ` ${record.pregnancyAge} semaines •`}
              Créée le {format(new Date(record.createdAt), "PP", { locale: fr })}
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
          <TabsTrigger value="cpn">
            <Calendar className="mr-2 h-4 w-4" />
            Visites CPN
          </TabsTrigger>
          <TabsTrigger value="treatments">
            <Pill className="mr-2 h-4 w-4" />
            Traitements
          </TabsTrigger>
          <TabsTrigger value="observations">
            <Stethoscope className="mr-2 h-4 w-4" />
            Observations
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
                  Informations de la Patiente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Numéro de dossier</p>
                    <p className="font-medium text-lg">{record.fileNumber || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium text-lg">{record.fullName || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Âge de la patiente</p>
                    <p className="font-medium text-lg">{record.patientAge || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Âge de la grossesse</p>
                    <div className="font-medium text-lg">
                      {record.pregnancyAge ? (
                        <Badge className="bg-blue-100 text-blue-800 text-lg">
                          {record.pregnancyAge} semaines
                        </Badge>
                      ) : (
                        "Non renseigné"
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{completedCPNVisits}</div>
                    <div className="text-sm text-gray-500">Visites CPN</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{completedIronDoses}</div>
                    <div className="text-sm text-gray-500">Doses Fer/FA</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{completedSulfoxadinDoses}</div>
                    <div className="text-sm text-gray-500">Doses SP</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  État de Santé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Anemia Status */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Statut d'Anémie</p>
                  <div className={`p-4 rounded-lg ${
                    record.anemy === 'severe' ? 'bg-rose-50 border-rose-200 border' :
                    record.anemy === 'moderate' ? 'bg-orange-50 border-orange-200 border' :
                    record.anemy === 'mild' ? 'bg-yellow-50 border-yellow-200 border' :
                    'bg-gray-50 border-gray-200 border'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Heart className={`h-5 w-5 ${
                        record.anemy === 'severe' ? 'text-rose-600' :
                        record.anemy === 'moderate' ? 'text-orange-600' :
                        record.anemy === 'mild' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`} />
                      <span className="font-medium text-lg">{anemyLabel || "Non évalué"}</span>
                    </div>
                    {record.anemy && record.anemy !== 'none' && (
                      <p className="text-sm text-gray-600 mt-2">
                        {record.anemy === 'severe' ? 'Anémie sévère nécessitant une prise en charge immédiate' :
                         record.anemy === 'moderate' ? 'Anémie modérée nécessitant un suivi régulier' :
                         'Anémie légère - surveillance recommandée'}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Iron/Folic Acid Status */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Traitement Fer + Acide Folique</p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium text-lg">{ironFolicLabel || "Non spécifié"}</span>
                    </div>
                    {record.iron_folicAcid && record.iron_folicAcid !== 'none' && (
                      <p className="text-sm text-gray-600 mt-2">
                        {record.iron_folicAcid === 'completed' ? 'Traitement complété avec succès' :
                         record.iron_folicAcid === 'administered' ? 'Traitement en cours d\'administration' :
                         'Traitement prescrit - en attente d\'administration'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CPN Visits Tab */}
        <TabsContent value="cpn">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Consultations Prénatales (CPN)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Progression des visites</p>
                    <p className="font-medium">{completedCPNVisits} / 4 visites complétées</p>
                  </div>
                  <Badge variant={completedCPNVisits >= 4 ? "default" : "outline"}>
                    {completedCPNVisits >= 4 ? "Programme CPN Complet" : "En cours"}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-emerald-600 h-2.5 rounded-full" 
                    style={{ width: `${(completedCPNVisits / 4) * 100}%` }}
                  ></div>
                </div>

                {/* CPN Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {CPN_VISITS.map((visit) => {
                    const visitDate = record[visit.key as keyof PrenatalRecord] as string;
                    const isCompleted = !!visitDate;
                    
                    return (
                      <div 
                        key={visit.key} 
                        className={`p-4 rounded-lg border ${isCompleted ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`font-semibold ${isCompleted ? 'text-emerald-800' : 'text-gray-800'}`}>
                            {visit.label}
                          </span>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        
                        {isCompleted ? (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              Date: {format(new Date(visitDate), "dd MMMM yyyy", { locale: fr })}
                            </p>
                            <p className="text-xs text-gray-500">
                              Complétée le {format(new Date(visitDate), "dd/MM/yyyy", { locale: fr })}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            Non encore programmée
                          </p>
                        )}
                        
                        {visit.key === 'visitCPN1' && isCompleted && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Première visite
                          </Badge>
                        )}
                        {visit.key === 'visitCPN4' && isCompleted && (
                          <Badge className="mt-2 bg-purple-100 text-purple-800 text-xs">
                            Dernière visite
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CPN Timeline */}
                <div className="mt-8">
                  <h4 className="font-medium text-gray-700 mb-4">Chronologie des visites</h4>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {/* Timeline items */}
                    <div className="space-y-6 relative">
                      {CPN_VISITS.map((visit, index) => {
                        const visitDate = record[visit.key as keyof PrenatalRecord] as string;
                        const isCompleted = !!visitDate;
                        
                        return (
                          <div key={visit.key} className="flex items-start">
                            {/* Timeline dot */}
                            <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-emerald-100 border-2 border-emerald-500' : 'bg-gray-100 border-2 border-gray-300'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {visit.label}
                                </h5>
                                {visitDate && (
                                  <span className="text-sm text-gray-500">
                                    {format(new Date(visitDate), "dd MMM yyyy", { locale: fr })}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1">
                                {visit.key === 'visitCPN1' && 'Première consultation prénatale - Évaluation initiale'}
                                {visit.key === 'visitCPN2' && 'Deuxième consultation - Suivi de la grossesse'}
                                {visit.key === 'visitCPN3' && 'Troisième consultation - Préparation à l\'accouchement'}
                                {visit.key === 'visitCPN4' && 'Quatrième consultation - Dernier contrôle prénatal'}
                              </p>
                              
                              {!visitDate && (
                                <Badge variant="outline" className="mt-2">
                                  En attente
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Iron/Folic Acid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Fer + Acide Folique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Progression</span>
                    <Badge variant={completedIronDoses >= 3 ? "default" : "outline"}>
                      {completedIronDoses}/3 doses
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {[1, 2, 3].map((doseNum) => {
                      const completed = [
                        record.iron_folicAcidDose1,
                        record.iron_folicAcidDose2,
                        record.iron_folicAcidDose3,
                      ][doseNum - 1];
                      
                      return (
                        <div 
                          key={doseNum} 
                          className={`p-4 rounded-lg flex items-center justify-between ${
                            completed ? 'bg-emerald-50 border-emerald-200 border' : 'bg-gray-50 border-gray-200 border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              completed ? 'bg-emerald-100' : 'bg-gray-100'
                            }`}>
                              {completed ? (
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                            <div>
                              <p className={`font-medium ${completed ? 'text-emerald-800' : 'text-gray-600'}`}>
                                Dose {doseNum}
                              </p>
                              <p className="text-sm text-gray-500">
                                {completed ? 'Administrée' : 'Non administrée'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={completed ? "default" : "outline"}>
                            {completed ? 'Complété' : 'En attente'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Statut du traitement</p>
                    <p className="font-medium mt-1">{ironFolicLabel}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sulfoxadin/Pyrin */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-blue-500" />
                  Sulfadoxine-Pyriméthamine (SP)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Progression</span>
                    <Badge variant={completedSulfoxadinDoses >= 3 ? "default" : "outline"}>
                      {completedSulfoxadinDoses}/3 doses
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {[1, 2, 3].map((doseNum) => {
                      const completed = [
                        record.sulfoxadin_pyrinDose1,
                        record.sulfoxadin_pyrinDose2,
                        record.sulfoxadin_pyrinDose3,
                      ][doseNum - 1];
                      
                      return (
                        <div 
                          key={doseNum} 
                          className={`p-4 rounded-lg flex items-center justify-between ${
                            completed ? 'bg-blue-50 border-blue-200 border' : 'bg-gray-50 border-gray-200 border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              completed ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              {completed ? (
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                            <div>
                              <p className={`font-medium ${completed ? 'text-blue-800' : 'text-gray-600'}`}>
                                Dose {doseNum}
                              </p>
                              <p className="text-sm text-gray-500">
                                {completed ? 'Administrée' : 'Non administrée'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={completed ? "default" : "outline"} className={completed ? 'bg-blue-100 text-blue-800' : ''}>
                            {completed ? 'Complété' : 'En attente'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Information</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Traitement préventif intermittent contre le paludisme pendant la grossesse.
                      Recommandé à prendre au moins 3 doses espacées d'au moins un mois.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Observations Tab */}
        <TabsContent value="observations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Observations Cliniques
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.obeservations ? (
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap border border-gray-200">
                    {record.obeservations}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune observation</h3>
                  <p className="text-gray-500">
                    Aucune observation clinique n'a été enregistrée pour cette consultation prénatale.
                  </p>
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
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Date de création</p>
                    <div className="font-medium">
                      {format(new Date(record.createdAt), "PPPP", { locale: fr })}
                    </div>
                    <p className="text-xs text-gray-500">
                      Heure: {format(new Date(record.createdAt), "HH:mm", { locale: fr })}
                    </p>
                  </div>

                  {record.updatedAt && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500">Dernière modification</p>
                        <div className="font-medium">
                          {format(new Date(record.updatedAt), "PPPP", { locale: fr })}
                        </div>
                        <p className="text-xs text-gray-500">
                          Heure: {format(new Date(record.updatedAt), "HH:mm", { locale: fr })}
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
                      ID: {record.createdBy || "Non disponible"}
                    </p>
                  </div>

                  {record.updatedBy && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500">Dernière modification par</p>
                        <p className="font-medium">{updatedByName || "Inconnu"}</p>
                        <p className="text-xs text-gray-500">
                          ID: {record.updatedBy}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Consultation {record.fileNumber ? record.fileNumber : record.id.substring(0, 8)}
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
      <PrenatalFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        record={record}
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
        <span className="ml-3 text-gray-600">Chargement de la consultation...</span>
      </div>
    </div>
  );
}