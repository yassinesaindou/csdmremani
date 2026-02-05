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
    Calendar,
    DollarSign,
    Edit,
    FileText,
    Printer,
    Trash2,
    TrendingDown,
    TrendingUp,
    User,
    Building
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteTransaction } from "../actions";
import { TransactionFormModal } from "../components/TransactionFormModal";
import { TransactionPDF } from "../components/TransactionPDF";
import { TransactionWithDepartment } from "../types";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<TransactionWithDepartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [createdByName, setCreatedByName] = useState<string>("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  
  const transactionId = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  async function loadTransaction() {
    setLoading(true);
    
    // First check user permissions
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, userId")
        .eq("userId", session.user.id)
        .single();
      
      // Check departments
      const { data: departmentAssignments } = await supabase
        .from("department_users")
        .select(`
          departments (
            departementName
          )
        `)
        .eq("userId", profile?.userId);

      const departmentNames = departmentAssignments?.map(
        (assignment: any) => assignment.departments?.departementName?.toLowerCase()
      ) || [];
      
      setCanEdit(profile?.role === "admin" || departmentNames.includes("management"));
    }

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        departments!transactions_departmentToSee_fkey (
          departementName
        ),
        profiles!transactions_createdBy_fkey (
          fullName
        )
      `)
      .eq("transactionId", transactionId)
      .single();

    if (error) {
      console.error("Error loading transaction:", error);
      router.push("/management/transactions");
      return;
    }

    const formattedData = {
      ...data,
      department_name: data.departments?.departementName || null,
      created_by_name: data.profiles?.fullName || null
    };
    
    setTransaction(formattedData);
    setCreatedByName(data.profiles?.fullName || "Inconnu");

    setLoading(false);
  }

  const handleDelete = async () => {
    if (!transaction) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette transaction ?\nMotif: ${transaction.reason || "Sans motif"}\nMontant: ${transaction.amount || "0"} KMF`)) {
      try {
        const result = await deleteTransaction(transaction.transactionId);
        if (result.success) {
          router.push("/management/transactions");
        } else {
          alert(result.error || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handlePrint = async () => {
    if (!transaction) return;
    
    setPrintLoading(true);
    try {
      const blob = await pdf(
        <TransactionPDF 
          transaction={transaction}
          createdByName={createdByName}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transaction_${transaction.transactionId.substring(0, 8)}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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
    loadTransaction();
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Chargement de la transaction...</span>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction non trouvée</h2>
          <p className="text-gray-600 mb-6">La transaction que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link href="/management/transactions">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux transactions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isIncome = transaction.type === 'income';

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href="/management/transactions">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux transactions
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Transaction #{transaction.transactionId.substring(0, 8)}...
              </h1>
              <Badge 
                className={isIncome ? 
                  "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : 
                  "bg-rose-100 text-rose-800 hover:bg-rose-100"
                }
              >
                {isIncome ? (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Recette
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3" />
                    Dépense
                  </>
                )}
              </Badge>
            </div>
            <p className="text-gray-600 mt-2">
              Créée le {format(new Date(transaction.createdAt), "PP", { locale: fr })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              disabled={printLoading}
            >
              <Printer className="mr-2 h-4 w-4" />
              {printLoading ? "Génération..." : "Télécharger PDF"}
            </Button>
            {canEdit && (
              <>
                <Button 
                  variant="outline" 
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
                <Button onClick={() => setEditModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Amount Summary */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Montant de la transaction</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-4xl font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {transaction.amount?.toLocaleString('fr-FR') || "0"} KMF
                  </span>
                  <Badge variant="outline">
                    {isIncome ? 'Entrée' : 'Sortie'} d'argent
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Département</p>
                <Badge className="mt-2">
                  <Building className="mr-1 h-3 w-3" />
                  {transaction.department_name || "Général"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">
            <FileText className="mr-2 h-4 w-4" />
            Détails
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <Calendar className="mr-2 h-4 w-4" />
            Métadonnées
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Informations de la Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Motif</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md">
                    <p className="font-medium whitespace-pre-wrap">
                      {transaction.reason || "Non spécifié"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium mt-1">
                      {isIncome ? 'Recette (Entrée)' : 'Dépense (Sortie)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Département</p>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {transaction.department_name || "Général"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Département Concerné
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">
                    {transaction.department_name || "Général"}
                  </p>
                  <p className="text-gray-500 mt-2">
                    {transaction.department_name 
                      ? `Cette transaction concerne le département ${transaction.department_name}`
                      : "Cette transaction concerne tous les départements de l'hôpital"
                    }
                  </p>
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
                    {format(new Date(transaction.createdAt), "PPPP", { locale: fr })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Heure: {format(new Date(transaction.createdAt), "HH:mm", { locale: fr })}
                  </p>
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
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Créé par</p>
                  <p className="font-medium">{createdByName || "Inconnu"}</p>
                  <p className="text-xs text-gray-500">
                    ID: {transaction.createdBy || "Non disponible"}
                  </p>
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
            Transaction #{transaction.transactionId.substring(0, 8)}...
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              disabled={printLoading}
            >
              <Printer className="mr-2 h-4 w-4" />
              {printLoading ? "Génération..." : "Télécharger PDF"}
            </Button>
            {canEdit && (
              <>
                <Button 
                  variant="outline" 
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
                <Button onClick={() => setEditModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <TransactionFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        transaction={transaction}
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
        <span className="ml-3 text-gray-600">Chargement de la transaction...</span>
      </div>
    </div>
  );
}