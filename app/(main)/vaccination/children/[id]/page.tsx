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
    CheckCircle,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteVaccinationEnfant } from "../actions";
import { VaccinationFormModal } from "../components/VaccinationFormModal";
import { VaccinationPDF } from "../components/VaccinationPDF";
import { VaccinationEnfant, VACCINES } from "../types";

export default function VaccinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vaccination, setVaccination] = useState<VaccinationEnfant | null>(null);
  const [loading, setLoading] = useState(true);
  const [createdByName, setCreatedByName] = useState<string>("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  
  const vaccinationId = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    loadVaccination();
  }, [vaccinationId]);

  async function loadVaccination() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("vaccination_enfants")
      .select("*")
      .eq("id", parseInt(vaccinationId))
      .single();

    if (error) {
      console.error("Error loading vaccination:", error);
      router.push("/vaccination/children");
      return;
    }

    setVaccination(data);

    // Load user name
    if (data.createdBy) {
      const { data: creator } = await supabase
        .from("profiles")
        .select("fullName")
        .eq("userId", data.createdBy)
        .single();
      if (creator) setCreatedByName(creator.fullName || "Inconnu");
    }

    setLoading(false);
  }

  const handleDelete = async () => {
    if (!vaccination) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la vaccination de ${vaccination.name || "cet enfant"} ? Cette action est irréversible.`)) {
      try {
        const result = await deleteVaccinationEnfant(vaccination.id);
        if (result.success) {
          router.push("/vaccination/children");
        } else {
          alert(result.error || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Error deleting vaccination:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handlePrint = async () => {
    if (!vaccination) return;
    
    setPrintLoading(true);
    try {
      // Create PDF blob
      const blob = await pdf(
        <VaccinationPDF 
          vaccination={vaccination}
          createdByName={createdByName}
        />
      ).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vaccination_enfant_${vaccination.id}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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
    loadVaccination();
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Chargement de la vaccination...</span>
        </div>
      </div>
    );
  }

  if (!vaccination) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vaccination non trouvée</h2>
          <p className="text-gray-600 mb-6">La vaccination que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link href="/vaccination/children">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux vaccinations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getVaccineStatusColor = (status: string | null) => {
    switch (status) {
      case 'fait': return 'bg-emerald-100 text-emerald-800';
      case 'non_fait': return 'bg-amber-100 text-amber-800';
      case 'contre_indication': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVaccineStatusText = (status: string | null) => {
    switch (status) {
      case 'fait': return 'Fait';
      case 'non_fait': return 'Non fait';
      case 'contre_indication': return 'Contre-indication';
      default: return 'Non renseigné';
    }
  };

  const vaccines = VACCINES.map(vaccine => ({
    label: vaccine.label,
    key: vaccine.key,
    status: vaccination[vaccine.key as keyof VaccinationEnfant] as string | null
  }));

  const completedVaccines = vaccines.filter(v => v.status === 'fait').length;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href="/vaccination/children">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux vaccinations
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Vaccination Enfant #{vaccination.id}
              </h1>
              <div className="flex gap-2">
                <Badge className="bg-emerald-100 text-emerald-800">
                  {completedVaccines}/12 vaccins
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {vaccination.strategy ? vaccination.strategy.replace('_', ' ') : "—"}
                </Badge>
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              {vaccination.name || "Enfant sans nom"} • 
              Créée le {format(new Date(vaccination.createdAt), "PP", { locale: fr })}
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
            <Button onClick={() => setEditModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="child" className="space-y-6">
        <TabsList>
          <TabsTrigger value="child">
            <User className="mr-2 h-4 w-4" />
            Informations Enfant
          </TabsTrigger>
          <TabsTrigger value="medical">
            <Stethoscope className="mr-2 h-4 w-4" />
            Informations Médicales
          </TabsTrigger>
          <TabsTrigger value="vaccines">
            <Shield className="mr-2 h-4 w-4" />
            Vaccins
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <Clock className="mr-2 h-4 w-4" />
            Métadonnées
          </TabsTrigger>
        </TabsList>

        {/* Child Information Tab */}
        <TabsContent value="child">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Baby className="h-5 w-5" />
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium text-lg">{vaccination.name || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Âge</p>
                    <p className="font-medium text-lg">
                      {vaccination.age ? `${vaccination.age} mois` : "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sexe</p>
                    <div className="font-medium">
                      {vaccination.sex === 'M' ? (
                        <Badge className="bg-blue-100 text-blue-800">Masculin</Badge>
                      ) : vaccination.sex === 'F' ? (
                        <Badge className="bg-pink-100 text-pink-800">Féminin</Badge>
                      ) : (
                        "Non renseigné"
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Origine</p>
                    <Badge variant="outline" className="font-medium">
                      {vaccination.origin || "Non renseigné"}
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
                    {vaccination.address || "Non renseignée"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Informations Physiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Poids</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">
                        {vaccination.weight ? `${vaccination.weight} kg` : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Taille</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">
                        {vaccination.height ? `${vaccination.height} cm` : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Médicaments Administrés
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      {vaccination.receivedVitamineA ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                          <span className="font-medium">Vitamine A administrée</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-500">Vitamine A non administrée</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {vaccination.receivedAlBendazole ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                          <span className="font-medium">AlBendazole administré</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-500">AlBendazole non administré</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medical Information Tab */}
        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations de Vaccination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Stratégie de Vaccination</h4>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg py-1 px-3 capitalize">
                    {vaccination.strategy ? vaccination.strategy.replace('_', ' ') : "Non spécifiée"}
                  </Badge>
                  <span className="text-gray-600">
                    {vaccination.strategy === 'fixe' && 'Poste fixe dans le centre de santé'}
                    {vaccination.strategy === 'avance' && 'Poste avancé dans la communauté'}
                    {vaccination.strategy === 'mobile' && 'Équipe mobile de vaccination'}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Progrès de Vaccination</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vaccins complétés</span>
                    <span className="font-medium">{completedVaccines}/12</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-emerald-600 h-2.5 rounded-full" 
                      style={{ width: `${(completedVaccines / 12) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {completedVaccines === 12 ? 'Tous les vaccins sont complétés ✓' :
                     completedVaccines >= 8 ? 'Progrès satisfaisant' :
                     completedVaccines >= 4 ? 'Progrès modéré' :
                     'Progrès insuffisant - besoin de suivi'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vaccines Tab */}
        <TabsContent value="vaccines">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Vaccins Obligatoires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {vaccines.slice(0, 8).map((vaccine, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{vaccine.label}</span>
                        <Badge className={getVaccineStatusColor(vaccine.status)}>
                          {getVaccineStatusText(vaccine.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {vaccine.status === 'fait' ? 'Vaccin administré avec succès' :
                         vaccine.status === 'non_fait' ? 'Vaccin non encore administré' :
                         vaccine.status === 'contre_indication' ? 'Contre-indication médicale' :
                         'Statut non renseigné'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Vaccins Complémentaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {vaccines.slice(8).map((vaccine, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{vaccine.label}</span>
                        <Badge className={getVaccineStatusColor(vaccine.status)}>
                          {getVaccineStatusText(vaccine.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {vaccine.status === 'fait' ? 'Vaccin administré avec succès' :
                         vaccine.status === 'non_fait' ? 'Vaccin non encore administré' :
                         vaccine.status === 'contre_indication' ? 'Contre-indication médicale' :
                         'Statut non renseigné'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informations d'Enregistrement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Date d'enregistrement</p>
                  <div className="font-medium">
                    {format(new Date(vaccination.createdAt), "PPPP", { locale: fr })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Heure: {format(new Date(vaccination.createdAt), "HH:mm", { locale: fr })}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Enregistré par</p>
                  <p className="font-medium">{createdByName || "Inconnu"}</p>
                  <p className="text-xs text-gray-500">
                    ID: {vaccination.createdBy || "Non disponible"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Résumé</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total vaccins:</span>
                    <span className="font-medium ml-2">12</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Complétés:</span>
                    <span className="font-medium ml-2">{completedVaccines}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">En attente:</span>
                    <span className="font-medium ml-2">{12 - completedVaccines}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Contre-indications:</span>
                    <span className="font-medium ml-2">
                      {vaccines.filter(v => v.status === 'contre_indication').length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Vaccination #{vaccination.id} • {completedVaccines}/12 vaccins
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
            <Button onClick={() => setEditModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <VaccinationFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        vaccination={vaccination}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}