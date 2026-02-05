"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deliverySchema = z.object({
  fileNumber: z.string().optional(),
  fullName: z.string().min(1, "Le nom complet est requis"),
  address: z.string().optional(),
  origin: z.enum(['HD', 'DS']).optional(),
  workTime: z.string().optional(),
  delivery_dateTime: z.string().optional(),
  delivery_eutocic: z.string().optional(),
  delivery_dystocic: z.string().optional(),
  delivery_transfert: z.string().optional(),
  weight: z.number().nullable().optional(),
  newBorn_living: z.number().min(0).nullable().optional(),
  newBorn_lessThan2point5kg: z.number().min(0).nullable().optional(),
  numberOfDeaths: z.number().min(0).nullable().optional(),
  numberOfDeaths_before24hours: z.number().min(0).nullable().optional(),
  numberOfDeaths_before7Days: z.number().min(0).nullable().optional(),
  isMotherDead: z.boolean().default(false),
  transfer: z.string().optional(),
  leavingDate: z.string().optional(),
  observations: z.string().optional(),
});

export async function createDelivery(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      fileNumber: formData.get("fileNumber") as string,
      fullName: formData.get("fullName") as string,
      address: formData.get("address") as string,
      origin: formData.get("origin") as 'HD' | 'DS',
      workTime: formData.get("workTime") as string,
      delivery_dateTime: formData.get("delivery_dateTime") as string,
      delivery_eutocic: formData.get("delivery_eutocic") as string,
      delivery_dystocic: formData.get("delivery_dystocic") as string,
      delivery_transfert: formData.get("delivery_transfert") as string,
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
      newBorn_living: formData.get("newBorn_living") ? parseInt(formData.get("newBorn_living") as string) : null,
      newBorn_lessThan2point5kg: formData.get("newBorn_lessThan2point5kg") ? parseInt(formData.get("newBorn_lessThan2point5kg") as string) : null,
      numberOfDeaths: formData.get("numberOfDeaths") ? parseInt(formData.get("numberOfDeaths") as string) : null,
      numberOfDeaths_before24hours: formData.get("numberOfDeaths_before24hours") ? parseInt(formData.get("numberOfDeaths_before24hours") as string) : null,
      numberOfDeaths_before7Days: formData.get("numberOfDeaths_before7Days") ? parseInt(formData.get("numberOfDeaths_before7Days") as string) : null,
      isMotherDead: formData.get("isMotherDead") === "true",
      transfer: formData.get("transfer") as string,
      leavingDate: formData.get("leavingDate") as string,
      observations: formData.get("observations") as string,
    };

    const validatedData = deliverySchema.parse(rawData);

    const { error } = await supabase
      .from("deliveries_maternity")
      .insert([{
        ...validatedData,
        createdBy: session.user.id,
      }]);

    if (error) throw error;

    revalidatePath("/maternity/deliveries");
    return { success: true };
  } catch (error) {
    console.error("Error creating delivery:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function updateDelivery(deliveryId: string, formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      fileNumber: formData.get("fileNumber") as string,
      fullName: formData.get("fullName") as string,
      address: formData.get("address") as string,
      origin: formData.get("origin") as 'HD' | 'DS',
      workTime: formData.get("workTime") as string,
      delivery_dateTime: formData.get("delivery_dateTime") as string,
      delivery_eutocic: formData.get("delivery_eutocic") as string,
      delivery_dystocic: formData.get("delivery_dystocic") as string,
      delivery_transfert: formData.get("delivery_transfert") as string,
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
      newBorn_living: formData.get("newBorn_living") ? parseInt(formData.get("newBorn_living") as string) : null,
      newBorn_lessThan2point5kg: formData.get("newBorn_lessThan2point5kg") ? parseInt(formData.get("newBorn_lessThan2point5kg") as string) : null,
      numberOfDeaths: formData.get("numberOfDeaths") ? parseInt(formData.get("numberOfDeaths") as string) : null,
      numberOfDeaths_before24hours: formData.get("numberOfDeaths_before24hours") ? parseInt(formData.get("numberOfDeaths_before24hours") as string) : null,
      numberOfDeaths_before7Days: formData.get("numberOfDeaths_before7Days") ? parseInt(formData.get("numberOfDeaths_before7Days") as string) : null,
      isMotherDead: formData.get("isMotherDead") === "true",
      transfer: formData.get("transfer") as string,
      leavingDate: formData.get("leavingDate") as string,
      observations: formData.get("observations") as string,
    };

    const validatedData = deliverySchema.parse(rawData);

    const { error } = await supabase
      .from("deliveries_maternity")
      .update({
        ...validatedData,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.id,
      })
      .eq("deliveryId", deliveryId);

    if (error) throw error;

    revalidatePath("/maternity/deliveries");
    return { success: true };
  } catch (error) {
    console.error("Error updating delivery:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function deleteDelivery(deliveryId: string) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const { error } = await supabase
      .from("deliveries_maternity")
      .delete()
      .eq("deliveryId", deliveryId);

    if (error) throw error;

    revalidatePath("/maternity/deliveries");
    return { success: true };
  } catch (error) {
    console.error("Error deleting delivery:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}