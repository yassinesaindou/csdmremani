/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inventorySchema = z.object({
  itemName: z.string().min(1, "Le nom de l'article est requis"),
  quantity: z.number().min(0, "La quantité doit être positive"),
});

const useInventorySchema = z.object({
  quantityToUse: z.number().min(1, "La quantité à utiliser doit être au moins 1"),
});

export async function createInventoryItem(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      itemName: formData.get("itemName") as string,
      quantity: parseFloat(formData.get("quantity") as string),
    };

    const validatedData = inventorySchema.parse(rawData);

    const { error } = await supabase
      .from("inventory")
      .insert([{
        ...validatedData,
        usedQuantity: 0,
        createdBy: session.user.id,
      }]);

    if (error) throw error;

    revalidatePath("/management/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function updateInventoryItem(itemId: number, formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const updates: any = {};
    
    const itemName = formData.get("itemName") as string;
    const quantity = formData.get("quantity") as string;
    
    if (itemName) updates.itemName = itemName;
    if (quantity) updates.quantity = parseFloat(quantity);
    
    if (Object.keys(updates).length === 0) {
      return { success: false, error: "Aucune modification à apporter" };
    }

    updates.updatedAt = new Date().toISOString();
    updates.updatedBy = session.user.id;

    const { error } = await supabase
      .from("inventory")
      .update(updates)
      .eq("itemId", itemId);

    if (error) throw error;

    revalidatePath("/management/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function useInventoryItem(itemId: number, formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      quantityToUse: parseFloat(formData.get("quantityToUse") as string),
    };

    const validatedData = useInventorySchema.parse(rawData);

    // First, get current item
    const { data: item, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("itemId", itemId)
      .single();

    if (fetchError) throw fetchError;

    if (!item) {
      return { success: false, error: "Article non trouvé" };
    }

    const currentQuantity = item.quantity || 0;
    const currentUsedQuantity = item.usedQuantity || 0;

    if (validatedData.quantityToUse > currentQuantity) {
      return { success: false, error: "Quantité insuffisante en stock" };
    }

    const newQuantity = currentQuantity - validatedData.quantityToUse;
    const newUsedQuantity = currentUsedQuantity + validatedData.quantityToUse;

    const { error } = await supabase
      .from("inventory")
      .update({
        quantity: newQuantity,
        usedQuantity: newUsedQuantity,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.id,
      })
      .eq("itemId", itemId);

    if (error) throw error;

    revalidatePath("/management/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error using inventory item:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function deleteInventoryItem(itemId: number) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("itemId", itemId);

    if (error) throw error;

    revalidatePath("/management/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function restockInventoryItem(itemId: number, formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const quantityToAdd = parseFloat(formData.get("quantityToAdd") as string);
    
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      return { success: false, error: "Veuillez entrer une quantité valide" };
    }

    // First, get current item
    const { data: item, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .eq("itemId", itemId)
      .single();

    if (fetchError) throw fetchError;

    if (!item) {
      return { success: false, error: "Article non trouvé" };
    }

    const currentQuantity = item.quantity || 0;
    const newQuantity = currentQuantity + quantityToAdd;

    const { error } = await supabase
      .from("inventory")
      .update({
        quantity: newQuantity,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.id,
      })
      .eq("itemId", itemId);

    if (error) throw error;

    revalidatePath("/management/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error restocking inventory item:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}