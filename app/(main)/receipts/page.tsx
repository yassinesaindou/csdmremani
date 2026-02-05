/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReceiptDetailModal } from "./components/ReceiptDetailModal";
import { ReceiptFilters } from "./components/ReceiptFilters";
import { ReceiptsTable } from "./components/ReceiptsTable";
import { MarkAsExecutedModal } from "./components/MarkAsExecutedModal";
 
import { ReceiptWithDetails, UserProfile } from "./types";
import { pdf } from '@react-pdf/renderer';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptWithDetails | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [executedModalOpen, setExecutedModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userDepartments, setUserDepartments] = useState<string[]>([]);
  const [pdfExportLoading, setPdfExportLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadUserInfo() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("userId, role, fullName, email")
          .eq("userId", session.user.id)
          .single();
        
        setUserProfile(profile);

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
      }
    }
    
    loadUserInfo();
  }, []);

  async function loadReceipts() {
    setLoading(true);

    let query = supabase
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
          reason
        )
      `)
      .order("createdAt", { ascending: false });

    // Apply department filter based on user permissions
    const canSeeAllReceipts = canUserSeeAllReceipts();
    
    if (!canSeeAllReceipts) {
      // User can only see receipts from their departments
      if (userDepartments.length > 0) {
        query = query.in("departmentId", userDepartments);
      } else {
        // If user has no departments, show empty list
        setReceipts([]);
        setLoading(false);
        return;
      }
    } else if (department !== "all") {
      // User with full access can filter by department
      query = query.eq("departmentId", department);
    }

    // Apply search filter
    if (search) {
      query = query.ilike("reason", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading receipts:", error);
    } else {
      const formattedData = (data || []).map(receipt => ({
        ...receipt,
        department_name: receipt.departments?.departementName || null,
        transaction_amount: receipt.transactions?.amount || null,
        transaction_type: receipt.transactions?.type || null,
        transaction_createdAt: receipt.transactions?.createdAt || null,
        transaction_reason: receipt.transactions?.reason || null,
      }));
      
      setReceipts(formattedData);
    }

    setLoading(false);
  }

  // Function to check if user can see all receipts
  const canUserSeeAllReceipts = () => {
    if (!userProfile) return false;
    
    // Admin can see everything
    if (userProfile.role === 'admin') return true;
    
    // Users in management department can see everything
    if (userDepartments.some(deptId => {
      // This would need a separate query to get department names
      // For now, we'll assume management department has a specific ID
      // We'll implement this properly below
      return false;
    })) {
      return true;
    }
    
    return false;
  };

  // Function to check if user can mark receipts as executed
  const canUserMarkAsExecuted = (receiptDepartmentId: string | null) => {
    if (!userProfile || !receiptDepartmentId) return false;
    
    // Admin can mark any receipt as executed
    if (userProfile.role === 'admin') return true;
    
    // Users in management department can mark any receipt as executed
    if (userDepartments.some(deptId => {
      // This would need a separate query to get department names
      // We'll implement this properly below
      return false;
    })) {
      return true;
    }
    
    // User can mark receipts from their own departments
    return userDepartments.includes(receiptDepartmentId);
  };

  // Load departments for department name checking
  const [allDepartments, setAllDepartments] = useState<Array<{departmentId: string, departementName: string}>>([]);

  useEffect(() => {
    async function loadAllDepartments() {
      const { data } = await supabase
        .from("departments")
        .select("departmentId, departementName")
        .order("departementName");
      
      if (data) {
        setAllDepartments(data);
      }
    }
    
    loadAllDepartments();
  }, []);

  // Now implement the proper permission checks
  const getUserPermissionLevel = () => {
    if (!userProfile) return 'none';
    
    // Check if user is admin
    if (userProfile.role === 'admin') return 'admin';
    
    // Check if user is in management department
    const managementDept = allDepartments.find(d => d.departementName.toLowerCase() === 'management');
    if (managementDept && userDepartments.includes(managementDept.departmentId)) {
      return 'management';
    }
    
    // Regular user
    return 'regular';
  };

  const canSeeAll = () => {
    const permission = getUserPermissionLevel();
    return permission === 'admin' || permission === 'management';
  };

  const canMarkReceiptAsExecuted = (receiptDepartmentId: string | null) => {
    if (!receiptDepartmentId) return false;
    
    const permission = getUserPermissionLevel();
    
    // Admin and management can mark any receipt
    if (permission === 'admin' || permission === 'management') return true;
    
    // Regular users can only mark receipts from their departments
    return userDepartments.includes(receiptDepartmentId);
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  // Refresh data when filters change
  useEffect(() => {
    loadReceipts();
  }, [department]);

  const handleRowClick = (receipt: ReceiptWithDetails) => {
    setSelectedReceipt(receipt);
    setDetailModalOpen(true);
  };

  const handleMarkAsExecuted = (receipt: ReceiptWithDetails) => {
    setSelectedReceipt(receipt);
    setExecutedModalOpen(true);
  };

  const handleSearchSubmit = () => {
    loadReceipts();
  };

  const handleResetFilters = () => {
    setSearch("");
    setDepartment("all");
    loadReceipts();
  };

  const handleMarkSuccess = () => {
    loadReceipts();
    setExecutedModalOpen(false);
  };

  

  const permissionLevel = getUserPermissionLevel();
  const canSeeAllReceipts = canSeeAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reçus à Exécuter
          </h1>
          <p className="text-gray-600 mt-1">
            Liste des transactions nécessitant un reçu
          </p>
          {userProfile?.role && (
            <p className="text-sm text-gray-500 mt-1">
              Rôle: {userProfile.role} • 
              Niveau d'accès: {permissionLevel === 'admin' ? 'Administrateur' : 
                             permissionLevel === 'management' ? 'Gestionnaire' : 
                             'Utilisateur régulier'}
            </p>
          )}
        </div>
        
        
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ReceiptFilters
          search={search}
          onSearchChange={setSearch}
          department={department}
          onDepartmentChange={setDepartment}
          onReset={handleResetFilters}
          onSearchSubmit={handleSearchSubmit}
          userDepartments={userDepartments}
          canSeeAllDepartments={canSeeAllReceipts}
          allDepartments={allDepartments}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">
              Chargement des reçus...
            </span>
          </div>
        ) : (
          <ReceiptsTable
            data={receipts}
            onRowClick={handleRowClick}
            onMarkAsExecuted={handleMarkAsExecuted}
            onRefresh={loadReceipts}
            canMarkAsExecuted={(receipt) => canMarkReceiptAsExecuted(receipt.departmentId)}
            userPermissionLevel={permissionLevel}
          />
        )}
      </div>

      {/* Modals */}
      <ReceiptDetailModal
        receipt={selectedReceipt}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      {selectedReceipt && (
        <MarkAsExecutedModal
          receipt={selectedReceipt}
          open={executedModalOpen}
          onOpenChange={setExecutedModalOpen}
          onSuccess={handleMarkSuccess}
          canExecute={canMarkReceiptAsExecuted(selectedReceipt.departmentId)}
        />
      )}
    </div>
  );
}