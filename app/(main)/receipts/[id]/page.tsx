/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { pdf } from '@react-pdf/renderer';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    FileText,
    Building,
    TrendingDown,
    TrendingUp,
    User,
    AlertTriangle,
    CheckCircle,
    Printer
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { markReceiptAsExecuted } from "../actions";
import { MarkAsExecutedModal } from "../components/MarkAsExecutedModal";
import { ReceiptPDF } from "../components/ReceiptPDF";
import { ReceiptWithDetails } from "../types";

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<ReceiptWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executedModalOpen, setExecutedModalOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [canMarkAsExecuted, setCanMarkAsExecuted] = useState(false);
  const [userPermissionLevel, setUserPermissionLevel] = useState<string>('none');
  const [userDepartments, setUserDepartments] = useState<string[]>([]);
  const [allDepartments, setAllDepartments] = useState<Array<{departmentId: string, departementName: string}>>([]);
  
  const receiptId = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    loadUserInfo();
    loadAllDepartments();
  }, []);

  useEffect(() => {
    if (receiptId && userDepartments.length > 0) {
      loadReceipt();
    }
  }, [receiptId, userDepartments]);

  async function loadUserInfo() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, userId")
        .eq("userId", session.user.id)
        .single();
      
      // Load user departments
      const { data: departmentAssignments } = await supabase
        .from("department_users")
        .select(`
          departments (
            departmentId,
            departementName
          )
        `)
        .eq("userId", profile?.userId);

      const departmentIds = departmentAssignments?.map(
        (assignment: any) => assignment.departments?.departmentId
      ).filter(Boolean) || [];
      
      setUserDepartments(departmentIds);
      
      // Determine permission level
      if (profile?.role === 'admin') {
        setUserPermissionLevel('admin');
      } else {
        // Check if user is in management department
        const managementDept = allDepartments.find(d => d.departementName.toLowerCase() === 'management');
        if (managementDept && departmentIds.includes(managementDept.departmentId)) {
          setUserPermissionLevel('management');
        } else {
          setUserPermissionLevel('regular');
        }
      }
    }
  }

  async function loadAllDepartments() {
    const { data } = await supabase
      .from("departments")
      .select("departmentId, departementName")
      .order("departementName");
    
    if (data) {
      setAllDepartments(data);
    }
  }

  async function loadReceipt() {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from("receipts")
      .select(`
        *,
        departments!receipts_departmentId_fkey (
          departmentId,
          departementName
        ),
        transactions!receipts_transactionId_fkey (
          amount,
          type,
          createdAt,
          reason,
          createdBy
        )
      `)
      .eq("receiptId", receiptId)
      .single();

    if (error) {
      console.error("Error loading receipt:", error);
      setError("Reçu non trouvé ou accès refusé");
      setLoading(false);
      return;
    }

    const formattedData = {
      ...data,
      department_name: data.departments?.departementName || null,
      transaction_amount: data.transactions?.amount || null,
      transaction_type: data.transactions?.type || null,
      transaction_createdAt: data.transactions?.createdAt || null,
      transaction_reason: data.transactions?.reason || null,
      transaction_createdBy: data.transactions?.createdBy || null,
    };
    
    setReceipt(formattedData);
    
    // Check if user can mark this receipt as executed
    const receiptDeptId = formattedData.departmentId;
    const canExecute = checkIfUserCanMarkAsExecuted(receiptDeptId);
    setCanMarkAsExecuted(canExecute);
    
    setLoading(false);
  }

  const checkIfUserCanMarkAsExecuted = (receiptDepartmentId: string | null) => {
    if (!receiptDepartmentId) return false;
    
    // Admin can mark any receipt
    if (userPermissionLevel === 'admin') return true;
    
    // Management department users can mark any receipt
    if (userPermissionLevel === 'management') return true;
    
    // Regular users can only mark receipts from their departments
    return userDepartments.includes(receiptDepartmentId);
  };

  const handleMarkAsExecuted = () => {
    setExecutedModalOpen(true);
  };

  const handleMarkSuccess = () => {
    router.push("/receipts");
  };

  const handlePrint = async () => {
    if (!receipt) return;
    
    setPrintLoading(true);
    try {
      const blob = await pdf(
        <ReceiptPDF 
          receipt={receipt}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${receipt.receiptId.substring(0, 8)}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Chargement du reçu...</span>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || "Reçu non trouvé"}</AlertDescription>
          </Alert>
          <Link href="/receipts">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux reçus
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check access permissions again when displaying
  const receiptDeptId = receipt.departmentId;
  const userCanAccess = userPermissionLevel === 'admin' || 
                        userPermissionLevel === 'management' || 
                        (receiptDeptId && userDepartments.includes(receiptDeptId));

  if (!userCanAccess) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Accès refusé : Vous n'avez pas accès à ce reçu
            </AlertDescription>
          </Alert>
          <Link href="/receipts">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux reçus
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isIncome = receipt.transaction_type === 'income';

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href="/receipts">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux reçus
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Reçu #{receipt.receiptId.substring(0, 8)}...
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
              Créé le {format(new Date(receipt.createdAt), "PP", { locale: fr })}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Niveau d'accès: {userPermissionLevel === 'admin' ? 'Administrateur' : 
                             userPermissionLevel === 'management' ? 'Gestionnaire' : 
                             'Utilisateur régulier'}
              {canMarkAsExecuted ? " • Peut marquer comme exécuté" : " • Vue seule"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              disabled={printLoading || !receipt}
            >
              <Printer className="mr-2 h-4 w-4" />
              {printLoading ? "Génération..." : "Télécharger PDF"}
            </Button>
            {canMarkAsExecuted && (
              <Button 
                onClick={handleMarkAsExecuted}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer comme exécuté
              </Button>
            )}
          </div>
        </div>

        {/* Amount Summary */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Montant du reçu</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-4xl font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {receipt.transaction_amount?.toLocaleString('fr-FR') || "0"} KMF
                  </span>
                  <Badge variant="outline">
                    {isIncome ? 'À encaisser' : 'À décaisser'}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Département</p>
                <Badge className="mt-2">
                  <Building className="mr-1 h-3 w-3" />
                  {receipt.department_name || "Non spécifié"}
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
          <TabsTrigger value="transaction">
            <DollarSign className="mr-2 h-4 w-4" />
            Transaction
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informations du Reçu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Motif</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md">
                    <p className="font-medium whitespace-pre-wrap">
                      {receipt.reason || "Non spécifié"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Département</p>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {receipt.department_name || "Non spécifié"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date création</p>
                    <p className="font-medium">
                      {format(new Date(receipt.createdAt), "PPpp", { locale: fr })}
                    </p>
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
                    {receipt.department_name || "Non spécifié"}
                  </p>
                  <p className="text-gray-500 mt-2">
                    Ce reçu concerne le département {receipt.department_name || "Non spécifié"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transaction Tab */}
        <TabsContent value="transaction">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Information Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">
                      {isIncome ? 'Recette (Entrée)' : 'Dépense (Sortie)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Montant</p>
                    <p className={`font-bold text-lg ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {receipt.transaction_amount?.toLocaleString('fr-FR') || "0"} KMF
                    </p>
                  </div>
                </div>

                <Separator />

                {receipt.transaction_reason && (
                  <div>
                    <p className="text-sm text-gray-500">Motif transaction</p>
                    <div className="mt-2 p-4 bg-gray-50 rounded-md">
                      <p className="font-medium">
                        {receipt.transaction_reason}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-sm text-gray-500">Date transaction</p>
                  <p className="font-medium">
                    {receipt.transaction_createdAt 
                      ? format(new Date(receipt.transaction_createdAt), "PPPP", { locale: fr })
                      : "Non disponible"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dates et Horaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Date création reçu</p>
                  <div className="font-medium">
                    {format(new Date(receipt.createdAt), "PPPP", { locale: fr })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Heure: {format(new Date(receipt.createdAt), "HH:mm", { locale: fr })}
                  </p>
                </div>

                {receipt.transaction_createdAt && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Date transaction</p>
                      <div className="font-medium">
                        {format(new Date(receipt.transaction_createdAt), "PPPP", { locale: fr })}
                      </div>
                      <p className="text-xs text-gray-500">
                        Heure: {format(new Date(receipt.transaction_createdAt), "HH:mm", { locale: fr })}
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
            Reçu #{receipt.receiptId.substring(0, 8)}...
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              disabled={printLoading || !receipt}
            >
              <Printer className="mr-2 h-4 w-4" />
              {printLoading ? "Génération..." : "Télécharger PDF"}
            </Button>
            {canMarkAsExecuted && (
              <Button 
                onClick={handleMarkAsExecuted}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer comme exécuté
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mark as Executed Modal */}
      <MarkAsExecutedModal
        receipt={receipt}
        open={executedModalOpen}
        onOpenChange={setExecutedModalOpen}
        onSuccess={handleMarkSuccess}
        canExecute={canMarkAsExecuted}
      />
    </div>
  );
}

export function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-3 text-gray-600">Chargement du reçu...</span>
      </div>
    </div>
  );
}