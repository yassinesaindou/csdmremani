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
    Printer,
    Shield,
    Trash2,
    User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteVaccinationFemmeEnceinte } from "../actions";
import { VaccinationFormModal } from "../components/VaccinationFormModal";
import { VaccinationPDF } from "../components/VaccinationPDF";
import { VaccinationFemmeEnceinte, VACCINES } from "../types";

export default function VaccinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vaccination, setVaccination] = useState<VaccinationFemmeEnceinte | null>(null);
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
      .from("vaccination_femme_enceinte")
      .select("*")
      .eq("id", parseInt(vaccinationId))
      .single();

    if (error) {
      console.error("Error loading vaccination:", error);
      router.push("/vaccination/pregnant");
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
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la vaccination de ${vaccination.name || "cette patiente"} ? Cette action est irréversible.`)) {
      try {
        const result = await deleteVaccinationFemmeEnceinte(vaccination.id);
        if (result.success) {
          router.push("/vaccination/pregnant");
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
      link.download = `vaccination_femme_enceinte_${vaccination.id}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
          <Link href="/vaccination/pregnant">
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
      case 'fait': return 'bg-purple-100 text-purple-800';
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
    status: vaccination[vaccine.key as keyof VaccinationFemmeEnceinte] as string | null
  }));

  const completedVaccines = vaccines.filter(v => v.status === 'fait').length;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href="/vaccination/pregnant">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux vaccinations
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Vaccination Femme Enceinte #{vaccination.id}
              </h1>
              <div className="flex gap-2">
                <Badge className="bg-purple-100 text-purple-800">
                  {completedVaccines}/6 vaccins
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {vaccination.strategy ? vaccination.strategy.replace('_', ' ') : "—"}
                </Badge>
              </div>
            </div>
            <p className="text-gray-600 mt-2">
              {vaccination.name || "Patiente sans nom"} • 
              {vaccination.month ? ` ${vaccination.month}ème mois de grossesse •` : ""}
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
            <Button onClick={() => setEditModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
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
            Informations Patiente
          </TabsTrigger>
          <TabsTrigger value="vaccines">
            <Shield className="mr-2 h-4 w-4" />
            Vaccins
          </TabsTrigger>
          <TabsTrigger value="medical">
            <FileText className="mr-2 h-4 w-4" />
            Informations Médicales
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
                    <p className="text-sm text-gray-500">Mois de grossesse</p>
                    <p className="font-medium text-lg">
                      {vaccination.month ? `${vaccination.month}ème mois` : "Non renseigné"}
                    </p>
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
                  <Shield className="h-5 w-5" />
                  Stratégie de Vaccination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-lg py-1 px-3 capitalize">
                    {vaccination.strategy ? vaccination.strategy.replace('_', ' ') : "Non spécifiée"}
                  </Badge>
                  <p className="text-gray-600">
                    {vaccination.strategy === 'fixe' && 'Poste fixe dans le centre de santé'}
                    {vaccination.strategy === 'avance' && 'Poste avancé dans la communauté'}
                    {vaccination.strategy === 'mobile' && 'Équipe mobile de vaccination'}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Progrès de Vaccination</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Vaccins complétés</span>
                      <span className="font-medium">{completedVaccines}/6</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        style={{ width: `${(completedVaccines / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vaccines Tab */}
        <TabsContent value="vaccines">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Vaccins Recommandés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {vaccines.map((vaccine, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-lg">{vaccine.label}</span>
                      <Badge className={getVaccineStatusColor(vaccine.status)}>
                        {getVaccineStatusText(vaccine.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {vaccine.label.startsWith('TD') ? 
                        'Vaccin Tétanos-Diphtérie recommandé pendant la grossesse' :
                        vaccine.label === 'FCV' ? 
                        'Vaccin contre la COVID-19 recommandé pour les femmes enceintes' :
                        'Vaccin recommandé pendant la grossesse'}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      <strong>Statut :</strong> {vaccine.status === 'fait' ? 
                        '✓ Administré avec succès' : 
                        vaccine.status === 'non_fait' ? 
                        '✗ Non encore administré' : 
                        vaccine.status === 'contre_indication' ? 
                        '⚠ Contre-indication médicale détectée' : 
                        '— En attente de mise à jour'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Information Tab */}
        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations de Suivi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Recommandations pour Femmes Enceintes</h4>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm text-purple-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Les vaccins TD (Tétanos-Diphtérie) sont particulièrement importants pendant la grossesse pour protéger la mère et le nouveau-né contre le tétanos néonatal.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>La vaccination contre la COVID-19 (FCV) est recommandée pendant la grossesse pour réduire les risques de complications.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Les vaccins doivent être administrés entre le 4ème et le 8ème mois de grossesse pour une protection optimale.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>En cas de contre-indication, une alternative doit être discutée avec le médecin traitant.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Calendrier de Vaccination</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-semibold text-purple-600">TD1</div>
                    <div className="text-sm text-gray-600">Début grossesse</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-semibold text-purple-600">TD2-TD5</div>
                    <div className="text-sm text-gray-600">Suivants (à 4 semaines)</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-semibold text-purple-600">FCV</div>
                    <div className="text-sm text-gray-600">N'importe quel mois</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                    <span className="font-medium ml-2">6</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Complétés:</span>
                    <span className="font-medium ml-2">{completedVaccines}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">En attente:</span>
                    <span className="font-medium ml-2">{6 - completedVaccines}</span>
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
            Vaccination #{vaccination.id} • {completedVaccines}/6 vaccins
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
            <Button onClick={() => setEditModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
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