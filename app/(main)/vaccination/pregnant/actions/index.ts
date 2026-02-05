"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const vaccinationSchema = z.object({
  month: z.number().min(1).max(9).optional(),
  name: z.string().min(1, "Le nom est requis"),
  address: z.string().optional(),
  origin: z.string().optional(),
  strategy: z.string().optional(),
  TD1: z.string().optional(),
  TD2: z.string().optional(),
  TD3: z.string().optional(),
  TD4: z.string().optional(),
  TD5: z.string().optional(),
  FCV: z.string().optional(),
});

export async function createVaccinationFemmeEnceinte(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      month: formData.get("month") ? parseInt(formData.get("month") as string) : null,
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      origin: formData.get("origin") as string,
      strategy: formData.get("strategy") as string,
      TD1: formData.get("TD1") as string,
      TD2: formData.get("TD2") as string,
      TD3: formData.get("TD3") as string,
      TD4: formData.get("TD4") as string,
      TD5: formData.get("TD5") as string,
      FCV: formData.get("FCV") as string,
    };

    const validatedData = vaccinationSchema.parse(rawData);

    const { error } = await supabase
      .from("vaccination_femme_enceinte")
      .insert([{
        ...validatedData,
        createdBy: session.user.id,
      }]);

    if (error) throw error;

    revalidatePath("/vaccination/pregnant");
    return { success: true };
  } catch (error) {
    console.error("Error creating vaccination femme enceinte:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function updateVaccinationFemmeEnceinte(id: number, formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      month: formData.get("month") ? parseInt(formData.get("month") as string) : null,
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      origin: formData.get("origin") as string,
      strategy: formData.get("strategy") as string,
      TD1: formData.get("TD1") as string,
      TD2: formData.get("TD2") as string,
      TD3: formData.get("TD3") as string,
      TD4: formData.get("TD4") as string,
      TD5: formData.get("TD5") as string,
      FCV: formData.get("FCV") as string,
    };

    const validatedData = vaccinationSchema.parse(rawData);

    const { error } = await supabase
      .from("vaccination_femme_enceinte")
      .update({
        ...validatedData,
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/vaccination/pregnant");
    return { success: true };
  } catch (error) {
    console.error("Error updating vaccination femme enceinte:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function deleteVaccinationFemmeEnceinte(id: number) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const { error } = await supabase
      .from("vaccination_femme_enceinte")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/vaccination/pregnant");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vaccination femme enceinte:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}