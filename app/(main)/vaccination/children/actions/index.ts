"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const vaccinationSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  address: z.string().optional(),
  age: z.number().min(0).max(18).optional(),
  sex: z.enum(['M', 'F']).optional(),
  origin: z.string().optional(),
  receivedVitamineA: z.boolean().default(false),
  receivedAlBendazole: z.boolean().default(false),
  weight: z.number().min(0).max(50).optional(),
  height: z.number().min(0).max(150).optional(),
  strategy: z.string().optional(),
  BCG: z.string().optional(),
  TD0: z.string().optional(),
  TD1: z.string().optional(),
  TD2: z.string().optional(),
  TD3: z.string().optional(),
  VP1: z.string().optional(),
  Penta1: z.string().optional(),
  Penta2: z.string().optional(),
  Penta3: z.string().optional(),
  RR1: z.string().optional(),
  RR2: z.string().optional(),
  ECV: z.string().optional(),
});

export async function createVaccinationEnfant(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      age: formData.get("age") ? parseInt(formData.get("age") as string) : null,
      sex: formData.get("sex") as 'M' | 'F',
      origin: formData.get("origin") as string,
      receivedVitamineA: formData.get("receivedVitamineA") === "true",
      receivedAlBendazole: formData.get("receivedAlBendazole") === "true",
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
      height: formData.get("height") ? parseFloat(formData.get("height") as string) : null,
      strategy: formData.get("strategy") as string,
      BCG: formData.get("BCG") as string,
      TD0: formData.get("TD0") as string,
      TD1: formData.get("TD1") as string,
      TD2: formData.get("TD2") as string,
      TD3: formData.get("TD3") as string,
      VP1: formData.get("VP1") as string,
      Penta1: formData.get("Penta1") as string,
      Penta2: formData.get("Penta2") as string,
      Penta3: formData.get("Penta3") as string,
      RR1: formData.get("RR1") as string,
      RR2: formData.get("RR2") as string,
      ECV: formData.get("ECV") as string,
    };

    const validatedData = vaccinationSchema.parse(rawData);

    const { error } = await supabase
      .from("vaccination_enfants")
      .insert([{
        ...validatedData,
        createdBy: session.user.id,
      }]);

    if (error) throw error;

    revalidatePath("/vaccination/children");
    return { success: true };
  } catch (error) {
    console.error("Error creating vaccination enfant:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function updateVaccinationEnfant(id: number, formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      age: formData.get("age") ? parseInt(formData.get("age") as string) : null,
      sex: formData.get("sex") as 'M' | 'F',
      origin: formData.get("origin") as string,
      receivedVitamineA: formData.get("receivedVitamineA") === "true",
      receivedAlBendazole: formData.get("receivedAlBendazole") === "true",
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
      height: formData.get("height") ? parseFloat(formData.get("height") as string) : null,
      strategy: formData.get("strategy") as string,
      BCG: formData.get("BCG") as string,
      TD0: formData.get("TD0") as string,
      TD1: formData.get("TD1") as string,
      TD2: formData.get("TD2") as string,
      TD3: formData.get("TD3") as string,
      VP1: formData.get("VP1") as string,
      Penta1: formData.get("Penta1") as string,
      Penta2: formData.get("Penta2") as string,
      Penta3: formData.get("Penta3") as string,
      RR1: formData.get("RR1") as string,
      RR2: formData.get("RR2") as string,
      ECV: formData.get("ECV") as string,
    };

    const validatedData = vaccinationSchema.parse(rawData);

    const { error } = await supabase
      .from("vaccination_enfants")
      .update({
        ...validatedData,
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/vaccination/children");
    return { success: true };
  } catch (error) {
    console.error("Error updating vaccination enfant:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function deleteVaccinationEnfant(id: number) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const { error } = await supabase
      .from("vaccination_enfants")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/vaccination/children");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vaccination enfant:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}