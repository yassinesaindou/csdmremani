"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

 

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  reason: z.string().min(1, "Le motif est requis"),
  amount: z.string().transform((val) => parseFloat(val)).refine((val) => val > 0, "Le montant doit être supérieur à 0"),
  departmentToSee: z.string().optional().transform((val) => val === "" ? null : val),
});

export async function createTransaction(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      type: formData.get("type") as 'income' | 'expense',
      reason: formData.get("reason") as string,
      amount: formData.get("amount") as string,
      departmentToSee: formData.get("departmentToSee") as string,
    };

    const validatedData = transactionSchema.parse(rawData);

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert([{
        ...validatedData,
        createdBy: session.user.id,
      }])
      .select()
      .single();

    if (transactionError) throw transactionError;

    // If transaction has a department, create a receipt
    if (validatedData.departmentToSee) {
      const { error: receiptError } = await supabase
        .from("receipts")
        .insert([{
          reason: validatedData.reason,
          departmentId: validatedData.departmentToSee,
          transactionId: transaction.transactionId,
        }]);

      if (receiptError) throw receiptError;
    }

    revalidatePath("/management/transactions");
    revalidatePath("/receipts"); // Also revalidate receipts page
    return { success: true };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

// Note: Also update updateTransaction if you want receipts updated when transaction is edited

export async function updateTransaction(transactionId: string, formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      type: formData.get("type") as 'income' | 'expense',
      reason: formData.get("reason") as string,
      amount: formData.get("amount") as string,
      departmentToSee: formData.get("departmentToSee") as string,
    };

    const validatedData = transactionSchema.parse(rawData);

    // Start a transaction to ensure data consistency
    const { data: currentTransaction, error: fetchError } = await supabase
      .from("transactions")
      .select("departmentToSee")
      .eq("transactionId", transactionId)
      .single();

    if (fetchError) throw fetchError;

    // Update the transaction
    const { error: transactionError } = await supabase
      .from("transactions")
      .update({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .eq("transactionId", transactionId);

    if (transactionError) throw transactionError;

    // Handle receipts based on department changes
    const currentDept = currentTransaction.departmentToSee;
    const newDept = validatedData.departmentToSee;

    // Check if we need to update receipts
    if (currentDept !== newDept) {
      // Check if a receipt exists for this transaction
      const { data: existingReceipt } = await supabase
        .from("receipts")
        .select("receiptId")
        .eq("transactionId", transactionId)
        .maybeSingle();

      if (currentDept && !newDept) {
        // Department removed - delete receipt if exists
        if (existingReceipt) {
          const { error: deleteError } = await supabase
            .from("receipts")
            .delete()
            .eq("transactionId", transactionId);

          if (deleteError) throw deleteError;
        }
      } else if (!currentDept && newDept) {
        // Department added - create receipt
        const { error: receiptError } = await supabase
          .from("receipts")
          .insert([{
            reason: validatedData.reason,
            departmentId: newDept,
            transactionId: transactionId,
          }]);

        if (receiptError) throw receiptError;
      } else if (currentDept && newDept) {
        // Department changed - update or create receipt
        if (existingReceipt) {
          // Update existing receipt
          const { error: updateError } = await supabase
            .from("receipts")
            .update({
              reason: validatedData.reason,
              departmentId: newDept,
            })
            .eq("transactionId", transactionId);

          if (updateError) throw updateError;
        } else {
          // Create new receipt
          const { error: receiptError } = await supabase
            .from("receipts")
            .insert([{
              reason: validatedData.reason,
              departmentId: newDept,
              transactionId: transactionId,
            }]);

          if (receiptError) throw receiptError;
        }
      }
    } else if (currentDept && newDept && currentDept === newDept) {
      // Same department - just update reason if needed
      const { error: updateError } = await supabase
        .from("receipts")
        .update({
          reason: validatedData.reason,
        })
        .eq("transactionId", transactionId);

      // It's okay if no receipt exists yet or update fails (non-critical)
      if (updateError && updateError.code !== 'PGRST116') {
        console.warn("Could not update receipt reason:", updateError);
      }
    }

    revalidatePath("/management/transactions");
    revalidatePath("/receipts");
    return { success: true };
  } catch (error) {
    console.error("Error updating transaction:", error);
    
    // Rollback strategy: Show error but don't revert automatically
    // In production, you might want to implement proper transaction rollback
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue lors de la mise à jour" 
    };
  }
}

export async function deleteTransaction(transactionId: string) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("transactionId", transactionId);

    if (error) throw error;

    revalidatePath("/management/transactions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}