"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const prenatalSchema = z.object({
  fileNumber: z.string().optional().nullable(),
  fullName: z.string().min(1, "Le nom est requis").nullable(),
  patientAge: z.string().optional().nullable(),
  pregnancyAge: z.string().optional().nullable(),
  visitCPN1: z.string().optional().nullable(),
  visitCPN2: z.string().optional().nullable(),
  visitCPN3: z.string().optional().nullable(),
  visitCPN4: z.string().optional().nullable(),
  iron_folicAcidDose1: z.boolean().default(false).nullable(),
  iron_folicAcidDose2: z.boolean().default(false).nullable(),
  iron_folicAcidDose3: z.boolean().default(false).nullable(),
  sulfoxadin_pyrinDose1: z.boolean().default(false).nullable(),
  sulfoxadin_pyrinDose2: z.boolean().default(false).nullable(),
  sulfoxadin_pyrinDose3: z.boolean().default(false).nullable(),
  anemy: z.string().optional().nullable(),
  iron_folicAcid: z.string().optional().nullable(),
  obeservations: z.string().optional().nullable(),
});

export async function createPrenatalRecord(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    // Parse all form data
    const rawData = {
      fileNumber: formData.get("fileNumber") as string,
      fullName: formData.get("fullName") as string,
      patientAge: formData.get("patientAge") as string,
      pregnancyAge: formData.get("pregnancyAge") as string,
      visitCPN1: formData.get("visitCPN1") as string,
      visitCPN2: formData.get("visitCPN2") as string,
      visitCPN3: formData.get("visitCPN3") as string,
      visitCPN4: formData.get("visitCPN4") as string,
      iron_folicAcidDose1: formData.get("iron_folicAcidDose1") === "true",
      iron_folicAcidDose2: formData.get("iron_folicAcidDose2") === "true",
      iron_folicAcidDose3: formData.get("iron_folicAcidDose3") === "true",
      sulfoxadin_pyrinDose1: formData.get("sulfoxadin_pyrinDose1") === "true",
      sulfoxadin_pyrinDose2: formData.get("sulfoxadin_pyrinDose2") === "true",
      sulfoxadin_pyrinDose3: formData.get("sulfoxadin_pyrinDose3") === "true",
      anemy: formData.get("anemy") as string,
      iron_folicAcid: formData.get("iron_folicAcid") as string,
      obeservations: formData.get("obeservations") as string,
    };

    const validatedData = prenatalSchema.parse(rawData);

    const { error } = await supabase
      .from("prenatal_maternity")
      .insert([{
        ...validatedData,
        createdBy: session.user.id,
      }]);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    revalidatePath("/maternity/prenatal");
    return { success: true };
  } catch (error) {
    console.error("Error creating prenatal record:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function updatePrenatalRecord(id: string, formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      fileNumber: formData.get("fileNumber") as string,
      fullName: formData.get("fullName") as string,
      patientAge: formData.get("patientAge") as string,
      pregnancyAge: formData.get("pregnancyAge") as string,
      visitCPN1: formData.get("visitCPN1") as string,
      visitCPN2: formData.get("visitCPN2") as string,
      visitCPN3: formData.get("visitCPN3") as string,
      visitCPN4: formData.get("visitCPN4") as string,
      iron_folicAcidDose1: formData.get("iron_folicAcidDose1") === "true",
      iron_folicAcidDose2: formData.get("iron_folicAcidDose2") === "true",
      iron_folicAcidDose3: formData.get("iron_folicAcidDose3") === "true",
      sulfoxadin_pyrinDose1: formData.get("sulfoxadin_pyrinDose1") === "true",
      sulfoxadin_pyrinDose2: formData.get("sulfoxadin_pyrinDose2") === "true",
      sulfoxadin_pyrinDose3: formData.get("sulfoxadin_pyrinDose3") === "true",
      anemy: formData.get("anemy") as string,
      iron_folicAcid: formData.get("iron_folicAcid") as string,
      obeservations: formData.get("obeservations") as string,
    };

    const validatedData = prenatalSchema.parse(rawData);

    const { error } = await supabase
      .from("prenatal_maternity")
      .update({
        ...validatedData,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.id,
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/maternity/prenatal");
    return { success: true };
  } catch (error) {
    console.error("Error updating prenatal record:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function deletePrenatalRecord(id: string) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const { error } = await supabase
      .from("prenatal_maternity")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/maternity/prenatal");
    return { success: true };
  } catch (error) {
    console.error("Error deleting prenatal record:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}