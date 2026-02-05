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
  MapPin,
  Package,
  Printer,
  RefreshCw,
  Trash2,
  User,
  UserCheck,
  UserX
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteFamilyPlanningRecord } from "../actions";
import { FamilyPlanningFormModal } from "../components/FamilyPlanningFormModal";
import { FamilyPlanningPDF } from "../components/FamilyPlanningPDF";
import { FamilyPlanningRecord, CONTRACEPTIVE_METHODS } from "../types";

export default function FamilyPlanningDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<FamilyPlanningRecord | null>(null);
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
      .from("panning_familial_maternity")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error loading family planning record:", error);
      router.push("/maternity/family-planning");
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
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la consultation de ${record.fullName || "ce patient"} ? Cette action est irréversible.`)) {
      try {
        const result = await deleteFamilyPlanningRecord(record.id);
        if (result.success) {
          router.push("/maternity/family-planning");
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
        <FamilyPlanningPDF 
          record={record}
          createdByName={createdByName}
          updatedByName={updatedByName}
        />
      ).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `planning_familial_${record.fileNumber || record.id}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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
          <Link href="/maternity/family-planning">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux consultations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter methods based on record type and quantity
  const newMethods = CONTRACEPTIVE_METHODS
    .filter(m => m.category === 'new')
    .filter(m => record[m.key as keyof FamilyPlanningRecord] !== null && record[m.key as keyof FamilyPlanningRecord] !== 0);

  const renewalMethods = CONTRACEPTIVE_METHODS
    .filter(m => m.category === 'renewal')
    .filter(m => record[m.key as keyof FamilyPlanningRecord] !== null && record[m.key as keyof FamilyPlanningRecord] !== 0);

  // Calculate totals
  const totalNewMethods = newMethods.reduce((sum, method) => 
    sum + (record[method.key as keyof FamilyPlanningRecord] as number || 0), 0);
  
  const totalRenewalMethods = renewalMethods.reduce((sum, method) => 
    sum + (record[method.key as keyof FamilyPlanningRecord] as number || 0), 0);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href="/maternity/family-planning">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux consultations
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Planning Familial {record.fileNumber ? `- ${record.fileNumber}` : ''}
              </h1>
              <div className="flex gap-2">
                <Badge variant={record.isNew ? "default" : "outline"}>
                  {record.isNew ? "Nouvelle consultation" : "Renouvellement"}
                </Badge>
                <Badge variant="outline">
                  {record.origin || "—"}
                </Badge>
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              {record.fullName || "Patient sans nom"} • 
              {record.age && ` ${record.age} ans •`}
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
          <TabsTrigger value="methods">
            <Package className="mr-2 h-4 w-4" />
            Méthodes Contraceptives
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
                    <p className="text-sm text-gray-500">Numéro de dossier</p>
                    <p className="font-medium text-lg">{record.fileNumber || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium text-lg">{record.fullName || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Âge</p>
                    <p className="font-medium text-lg">{record.age || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Origine</p>
                    <Badge variant="outline" className="font-medium">
                      {record.origin || "Non renseigné"}
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
                    {record.address || "Non renseignée"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Type de Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Type</p>
                  <div className="flex items-center gap-2">
                    {record.isNew ? (
                      <>
                        <UserCheck className="h-5 w-5 text-emerald-500" />
                        <span className="font-medium">Nouvelle consultation</span>
                      </>
                    ) : (
                      <>
                        <UserX className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Renouvellement</span>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Statut</p>
                  <div className="flex items-center gap-2">
                    <Baby className="h-5 w-5 text-pink-500" />
                    <span className="font-medium text-gray-600">
                      {record.isNew 
                        ? "Première consultation de planning familial" 
                        : "Consultation de renouvellement"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contraceptive Methods Tab */}
        <TabsContent value="methods">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {record.isNew ? "Nouvelles Méthodes Prescrites" : "Méthodes Renouvelées"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {record.isNew ? (
                  <>
                    {newMethods.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-500">
                            Total des méthodes: {totalNewMethods}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {newMethods.map((method) => {
                            const quantity = record[method.key as keyof FamilyPlanningRecord] as number;
                            return (
                              <div 
                                key={method.key} 
                                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-gray-800">{method.label}</span>
                                  <Badge variant="secondary" className="text-lg">
                                    {quantity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {method.key.includes('Condom') ? 'Préservatifs' : 
                                   method.key.includes('IUD') ? 'Dispositif intra-utérin' :
                                   method.key.includes('emergencyPill') ? 'Contraception d\'urgence' :
                                   'Contraception hormonale'}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune méthode contraceptive prescrite</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {renewalMethods.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-500">
                            Total des méthodes renouvelées: {totalRenewalMethods}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {renewalMethods.map((method) => {
                            const quantity = record[method.key as keyof FamilyPlanningRecord] as number;
                            return (
                              <div 
                                key={method.key} 
                                className="bg-green-50 p-4 rounded-lg border border-green-200"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-gray-800">{method.label}</span>
                                  <Badge variant="outline" className="text-lg bg-white">
                                    {quantity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Renouvellement de méthode contraceptive
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune méthode contraceptive renouvelée</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Récapitulatif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Type de consultation</p>
                      <p className="font-medium">{record.isNew ? "Nouvelle" : "Renouvellement"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Nombre total de méthodes</p>
                      <p className="font-medium text-lg">
                        {record.isNew ? totalNewMethods : totalRenewalMethods}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Détails par catégorie</p>
                    <div className="space-y-2">
                      {record.isNew ? (
                        <>
                          {record.new_maleCondom && record.new_maleCondom > 0 && (
                            <div className="flex justify-between">
                              <span>Préservatifs masculins</span>
                              <Badge variant="secondary">{record.new_maleCondom}</Badge>
                            </div>
                          )}
                          {record.new_femaleCondom && record.new_femaleCondom > 0 && (
                            <div className="flex justify-between">
                              <span>Préservatifs féminins</span>
                              <Badge variant="secondary">{record.new_femaleCondom}</Badge>
                            </div>
                          )}
                          {record.new_microgynon && record.new_microgynon > 0 && (
                            <div className="flex justify-between">
                              <span>Microgynon</span>
                              <Badge variant="secondary">{record.new_microgynon}</Badge>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {record.renewal_maleCondom && record.renewal_maleCondom > 0 && (
                            <div className="flex justify-between">
                              <span>Préservatifs masculins</span>
                              <Badge variant="outline">{record.renewal_maleCondom}</Badge>
                            </div>
                          )}
                          {record.renewal_femaleCondom && record.renewal_femaleCondom > 0 && (
                            <div className="flex justify-between">
                              <span>Préservatifs féminins</span>
                              <Badge variant="outline">{record.renewal_femaleCondom}</Badge>
                            </div>
                          )}
                          {record.renewal_microgynon && record.renewal_microgynon > 0 && (
                            <div className="flex justify-between">
                              <span>Microgynon</span>
                              <Badge variant="outline">{record.renewal_microgynon}</Badge>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                    {format(new Date(record.createdAt), "PPPP", { locale: fr })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Heure: {format(new Date(record.createdAt), "HH:mm", { locale: fr })}
                  </p>
                </div>

                {record.updatedAt && (
                  <>
                    <Separator />
                    <div className="space-y-2">
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
                    ID: {record.createdBy || "Non disponible"}
                  </p>
                </div>

                {record.updatedBy && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Dernière modification par</p>
                      <p className="font-medium">{updatedByName || "Inconnu"}</p>
                      <p className="text-xs text-gray-500">
                        ID: {record.updatedBy}
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
      <FamilyPlanningFormModal
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