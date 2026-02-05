"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markReceiptAsExecuted(receiptId: string) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  // Check user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("userId", session.user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'cashier' && profile.role !== 'manager')) {
    return { success: false, error: "Permission refusée" };
  }

  try {
    // Delete the receipt
    const { error } = await supabase
      .from("receipts")
      .delete()
      .eq("receiptId", receiptId);

    if (error) throw error;

    revalidatePath("/receipts");
    revalidatePath("/management/transactions");
    return { success: true };
  } catch (error) {
    console.error("Error marking receipt as executed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

// Get receipt by ID
export async function getReceiptById(receiptId: string) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé", data: null };
  }

  try {
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

    if (error) throw error;

    // Check if user has access to this receipt
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, userId")
      .eq("userId", session.user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Profil non trouvé", data: null };
    }

    // If user is not admin/cashier/manager, check if they belong to the department
    if (profile.role !== 'admin' && profile.role !== 'cashier' && profile.role !== 'manager') {
      const { data: departmentAssignments } = await supabase
        .from("department_users")
        .select("departmentId")
        .eq("userId", profile.userId);

      const userDepartmentIds = departmentAssignments?.map(d => d.departmentId) || [];
      
      if (!userDepartmentIds.includes(data.departmentId)) {
        return { success: false, error: "Accès refusé", data: null };
      }
    }

    return { 
      success: true, 
      data: {
        ...data,
        department_name: data.departments?.departementName || null,
        transaction_amount: data.transactions?.amount || null,
        transaction_type: data.transactions?.type || null,
        transaction_createdAt: data.transactions?.createdAt || null,
        transaction_reason: data.transactions?.reason || null,
        transaction_createdBy: data.transactions?.createdBy || null,
      }
    };
  } catch (error) {
    console.error("Error getting receipt:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue",
      data: null 
    };
  }
}