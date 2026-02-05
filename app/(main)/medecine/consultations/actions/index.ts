"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const consultationSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  age: z.string().optional(),
  sex: z.enum(['M', 'F']).optional(),
  origin: z.enum(['HD', 'DS']).optional(),
  address: z.string().optional(),
  isNewCase: z.boolean().default(true),
  seenByDoctor: z.boolean().default(false),
  dominantSign: z.string().optional(),
  diagnostic: z.string().optional(),
  isPregnant: z.boolean().optional(),
  treatment: z.string().optional(),
  reference: z.string().optional(),
  mitualist: z.string().default('undefined'),
});

export async function createConsultation(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      name: formData.get("name") as string,
      age: formData.get("age") as string,
      sex: formData.get("sex") as 'M' | 'F',
      origin: formData.get("origin") as 'HD' | 'DS',
      address: formData.get("address") as string,
      isNewCase: formData.get("isNewCase") === "true",
      seenByDoctor: formData.get("seenByDoctor") === "true",
      dominantSign: formData.get("dominantSign") as string,
      diagnostic: formData.get("diagnostic") as string,
      isPregnant: formData.get("isPregnant") === "true",
      treatment: formData.get("treatment") as string,
      reference: formData.get("reference") as string,
      mitualist: formData.get("mitualist") as string,
    };

    const validatedData = consultationSchema.parse(rawData);

    const { error } = await supabase
      .from("consultation_medecine")
      .insert([{
        ...validatedData,
        createdBy: session.user.id,
      }]);

    if (error) throw error;

    revalidatePath("/medecine/consultations");
    return { success: true };
  } catch (error) {
    console.error("Error creating consultation:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function updateConsultation(consultationId: number, formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      name: formData.get("name") as string,
      age: formData.get("age") as string,
      sex: formData.get("sex") as 'M' | 'F',
      origin: formData.get("origin") as 'HD' | 'DS',
      address: formData.get("address") as string,
      isNewCase: formData.get("isNewCase") === "true",
      seenByDoctor: formData.get("seenByDoctor") === "true",
      dominantSign: formData.get("dominantSign") as string,
      diagnostic: formData.get("diagnostic") as string,
      isPregnant: formData.get("isPregnant") === "true",
      treatment: formData.get("treatment") as string,
      reference: formData.get("reference") as string,
      mitualist: formData.get("mitualist") as string,
    };

    const validatedData = consultationSchema.parse(rawData);

    const { error } = await supabase
      .from("consultation_medecine")
      .update({
        ...validatedData,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.id,
      })
      .eq("consultationid", consultationId);

    if (error) throw error;

    revalidatePath("/medecine/consultations");
    return { success: true };
  } catch (error) {
    console.error("Error updating consultation:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function deleteConsultation(consultationId: number) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const { error } = await supabase
      .from("consultation_medecine")
      .delete()
      .eq("consultationid", consultationId);

    if (error) throw error;

    revalidatePath("/medecine/consultations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting consultation:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}