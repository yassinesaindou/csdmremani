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
  Baby,
  Scale,
  Heart,
  AlertTriangle,
  Edit,
  Printer,
  Trash2,
  Clock,
  Activity,
  FileText,
  Home,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { DeliveryFormModal } from "../components/DeliveryFormModal";
import { DeliveryPDF } from "../components/DeliveryPDF";
import { MaternityDelivery } from "../types";
import { deleteDelivery } from "../actions";
import { pdf } from '@react-pdf/renderer';

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [delivery, setDelivery] = useState<MaternityDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [createdByName, setCreatedByName] = useState<string>("");
  const [updatedByName, setUpdatedByName] = useState<string>("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  
  const deliveryId = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    loadDelivery();
   
  }, [deliveryId]);

 

  async function loadDelivery() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("deliveries_maternity")
      .select("*")
      .eq("deliveryId", deliveryId)
      .single();

    if (error) {
      console.error("Error loading delivery:", error);
      router.push("/maternity/deliveries");
      return;
    }

    setDelivery(data);

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
    if (!delivery) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'accouchement de ${delivery.fullName || "cette mère"} ? Cette action est irréversible.`)) {
      try {
        const result = await deleteDelivery(delivery.deliveryId);
        if (result.success) {
          router.push("/maternity/deliveries");
        } else {
          alert(result.error || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Error deleting delivery:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handlePrint = async () => {
    if (!delivery) return;
    
    setPrintLoading(true);
    try {
      // Create PDF blob
      const blob = await pdf(
        <DeliveryPDF 
          delivery={delivery}
          createdByName={createdByName}
          updatedByName={updatedByName}
        />
      ).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `accouchement_${delivery.fileNumber || delivery.deliveryId.slice(0, 8)}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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
    loadDelivery();
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Chargement de l'accouchement...</span>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accouchement non trouvé</h2>
          <p className="text-gray-600 mb-6">L'accouchement que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link href="/maternity/deliveries">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux accouchements
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getDeliveryType = () => {
    if (delivery.delivery_eutocic) {
      return { label: "Eutocique", color: "bg-emerald-100 text-emerald-800" };
    }
    if (delivery.delivery_dystocic) {
      return { label: "Dystocique", color: "bg-amber-100 text-amber-800" };
    }
    if (delivery.delivery_transfert) {
      return { label: "Transfert", color: "bg-blue-100 text-blue-800" };
    }
    return { label: "Non spécifié", color: "bg-gray-100 text-gray-800" };
  };

  const deliveryType = getDeliveryType();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href="/maternity/deliveries">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux accouchements
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Accouchement {delivery.fileNumber ? `#${delivery.fileNumber}` : delivery.deliveryId.slice(0, 8)}
              </h1>
              <div className="flex gap-2">
                <Badge className={deliveryType.color}>
                  {deliveryType.label}
                </Badge>
                {delivery.isMotherDead && (
                  <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Mère décédée
                  </Badge>
                )}
                {delivery.weight && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <Scale className="mr-1 h-3 w-3" />
                    {delivery.weight} kg
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              {delivery.fullName || "Mère sans nom"} • 
              Accouchée le {delivery.delivery_dateTime ? format(new Date(delivery.delivery_dateTime), "PP", { locale: fr }) : "Date non spécifiée"}
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
              <Download className="mr-2 h-4 w-4" />
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
      <Tabs defaultValue="mother" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mother">
            <User className="mr-2 h-4 w-4" />
            Informations Mère
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Baby className="mr-2 h-4 w-4" />
            Accouchement
          </TabsTrigger>
          <TabsTrigger value="newborn">
            <Activity className="mr-2 h-4 w-4" />
            Nouveau-né
          </TabsTrigger>
          <TabsTrigger value="followup">
            <Home className="mr-2 h-4 w-4" />
            Suivi
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <Clock className="mr-2 h-4 w-4" />
            Métadonnées
          </TabsTrigger>
        </TabsList>

        {/* Mother Information Tab */}
        <TabsContent value="mother">
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
                    <p className="text-sm text-gray-500">Numéro dossier</p>
                    <p className="font-medium text-lg">{delivery.fileNumber || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium text-lg">{delivery.fullName || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Origine</p>
                    <Badge variant="outline" className="font-medium">
                      {delivery.origin || "Non renseigné"}
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
                    {delivery.address || "Non renseignée"}
                  </p>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  {delivery.isMotherDead ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-rose-500" />
                      <div>
                        <p className="text-sm text-gray-500">Statut</p>
                        <p className="font-medium text-rose-600">Mère décédée</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-sm text-gray-500">Statut</p>
                        <p className="font-medium text-emerald-600">Mère vivante</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Delivery Information Tab */}
        <TabsContent value="delivery">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Chronologie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Début du travail</p>
                  <div className="font-medium">
                    {delivery.workTime ? (
                      <>
                        {format(new Date(delivery.workTime), "PPPP", { locale: fr })}
                        <p className="text-xs text-gray-500">
                          Heure: {format(new Date(delivery.workTime), "HH:mm", { locale: fr })}
                        </p>
                      </>
                    ) : (
                      "Non renseigné"
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Accouchement</p>
                  <div className="font-medium">
                    {delivery.delivery_dateTime ? (
                      <>
                        {format(new Date(delivery.delivery_dateTime), "PPPP", { locale: fr })}
                        <p className="text-xs text-gray-500">
                          Heure: {format(new Date(delivery.delivery_dateTime), "HH:mm", { locale: fr })}
                        </p>
                      </>
                    ) : (
                      "Non renseigné"
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Baby className="h-5 w-5" />
                  Type d'Accouchement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {delivery.delivery_eutocic && (
                    <div>
                      <p className="text-sm text-gray-500">Eutocique</p>
                      <p className="font-medium bg-emerald-50 p-3 rounded-md">
                        {delivery.delivery_eutocic}
                      </p>
                    </div>
                  )}
                  
                  {delivery.delivery_dystocic && (
                    <div>
                      <p className="text-sm text-gray-500">Dystocique</p>
                      <p className="font-medium bg-amber-50 p-3 rounded-md">
                        {delivery.delivery_dystocic}
                      </p>
                    </div>
                  )}
                  
                  {delivery.delivery_transfert && (
                    <div>
                      <p className="text-sm text-gray-500">Transfert</p>
                      <p className="font-medium bg-blue-50 p-3 rounded-md">
                        {delivery.delivery_transfert}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Newborn Information Tab */}
        <TabsContent value="newborn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Baby className="h-5 w-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <Baby className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nouveau-né(s) vivant(s)</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {delivery.newBorn_living || 0}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-rose-50 rounded-lg">
                    <Heart className="h-8 w-8 text-rose-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Total décès</p>
                    <p className="text-2xl font-bold text-rose-700">
                      {delivery.numberOfDeaths || 0}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-500 mb-2">Détails des décès</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-rose-50 rounded">
                      <p className="text-sm text-gray-600">Avant 24h</p>
                      <p className="text-lg font-semibold text-rose-700">
                        {delivery.numberOfDeaths_before24hours || 0}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-rose-50 rounded">
                      <p className="text-sm text-gray-600">Avant 7 jours</p>
                      <p className="text-lg font-semibold text-rose-700">
                        {delivery.numberOfDeaths_before7Days || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {delivery.newBorn_lessThan2point5kg !== null && (
                  <>
                    <Separator />
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <Scale className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Poids &lt; 2.5 kg</p>
                      <p className="text-2xl font-bold text-amber-700">
                        {delivery.newBorn_lessThan2point5kg}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Poids du Nouveau-né
                </CardTitle>
              </CardHeader>
              <CardContent>
                {delivery.weight ? (
                  <div className="text-center py-8">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {delivery.weight} kg
                    </div>
                    <p className="text-gray-600">Poids à la naissance</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scale className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Poids non enregistré</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Follow-up Tab */}
        <TabsContent value="followup">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Transfert et Sortie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {delivery.transfer && (
                  <div>
                    <p className="text-sm text-gray-500">Transfert vers</p>
                    <p className="font-medium bg-blue-50 p-3 rounded-md">
                      {delivery.transfer}
                    </p>
                  </div>
                )}

                {delivery.leavingDate && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Date de sortie</p>
                      <div className="font-medium">
                        {format(new Date(delivery.leavingDate), "PPPP", { locale: fr })}
                        <p className="text-xs text-gray-500">
                          Heure: {format(new Date(delivery.leavingDate), "HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {delivery.observations ? (
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                      {delivery.observations}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune observation enregistrée</p>
                  </div>
                )}
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
                  <Clock className="h-5 w-5" />
                  Dates d'Enregistrement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Date de création</p>
                  <div className="font-medium">
                    {format(new Date(delivery.createdAt), "PPPP", { locale: fr })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Heure: {format(new Date(delivery.createdAt), "HH:mm", { locale: fr })}
                  </p>
                </div>

                {delivery.updatedAt && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Dernière modification</p>
                      <div className="font-medium">
                        {format(new Date(delivery.updatedAt), "PPPP", { locale: fr })}
                      </div>
                      <p className="text-xs text-gray-500">
                        Heure: {format(new Date(delivery.updatedAt), "HH:mm", { locale: fr })}
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
                    ID: {delivery.createdBy || "Non disponible"}
                  </p>
                </div>

                {delivery.updatedBy && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Dernière modification par</p>
                      <p className="font-medium">{updatedByName || "Inconnu"}</p>
                      <p className="text-xs text-gray-500">
                        ID: {delivery.updatedBy}
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
            Accouchement {delivery.fileNumber ? `#${delivery.fileNumber}` : delivery.deliveryId.slice(0, 8)}
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
              <Download className="mr-2 h-4 w-4" />
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
      <DeliveryFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        delivery={delivery}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}