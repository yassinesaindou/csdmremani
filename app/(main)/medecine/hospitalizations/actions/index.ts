"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const hospitalizationSchema = z.object({
  fullName: z.string().min(1, "Le nom complet est requis"),
  age: z.string().optional(),
  sex: z.enum(['M', 'F']).optional(),
  origin: z.enum(['HD', 'DS']).optional(),
  isEmergency: z.boolean().default(false),
  entryDiagnostic: z.string().optional(),
  leavingDiagnostic: z.string().optional(),
  isPregnant: z.boolean().optional(),
  leave_authorized: z.boolean().optional(),
  leave_evaded: z.boolean().optional(),
  leave_transfered: z.boolean().optional(),
  leave_diedBefore48h: z.boolean().optional(),
  leave_diedAfter48h: z.boolean().optional(),
  leavingDate: z.string().optional(),
});

export async function createHospitalization(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      fullName: formData.get("fullName") as string,
      age: formData.get("age") as string,
      sex: formData.get("sex") as 'M' | 'F',
      origin: formData.get("origin") as 'HD' | 'DS',
      isEmergency: formData.get("isEmergency") === "true",
      entryDiagnostic: formData.get("entryDiagnostic") as string,
      leavingDiagnostic: formData.get("leavingDiagnostic") as string,
      isPregnant: formData.get("isPregnant") === "true",
      leave_authorized: formData.get("leave_authorized") === "true",
      leave_evaded: formData.get("leave_evaded") === "true",
      leave_transfered: formData.get("leave_transfered") === "true",
      leave_diedBefore48h: formData.get("leave_diedBefore48h") === "true",
      leave_diedAfter48h: formData.get("leave_diedAfter48h") === "true",
      leavingDate: formData.get("leavingDate") as string,
    };

    const validatedData = hospitalizationSchema.parse(rawData);

    const { error } = await supabase
      .from("hospitalization_medecine")
      .insert([{
        ...validatedData,
        createdBy: session.user.id,
      }]);

    if (error) throw error;

    revalidatePath("/medecine/hospitalizations");
    return { success: true };
  } catch (error) {
    console.error("Error creating hospitalization:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function updateHospitalization(hospitalizationId: string, formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      fullName: formData.get("fullName") as string,
      age: formData.get("age") as string,
      sex: formData.get("sex") as 'M' | 'F',
      origin: formData.get("origin") as 'HD' | 'DS',
      isEmergency: formData.get("isEmergency") === "true",
      entryDiagnostic: formData.get("entryDiagnostic") as string,
      leavingDiagnostic: formData.get("leavingDiagnostic") as string,
      isPregnant: formData.get("isPregnant") === "true",
      leave_authorized: formData.get("leave_authorized") === "true",
      leave_evaded: formData.get("leave_evaded") === "true",
      leave_transfered: formData.get("leave_transfered") === "true",
      leave_diedBefore48h: formData.get("leave_diedBefore48h") === "true",
      leave_diedAfter48h: formData.get("leave_diedAfter48h") === "true",
      leavingDate: formData.get("leavingDate") as string,
    };

    const validatedData = hospitalizationSchema.parse(rawData);

    const { error } = await supabase
      .from("hospitalization_medecine")
      .update({
        ...validatedData,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.id,
      })
      .eq("hospitalizationId", hospitalizationId);

    if (error) throw error;

    revalidatePath("/medecine/hospitalizations");
    return { success: true };
  } catch (error) {
    console.error("Error updating hospitalization:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function deleteHospitalization(hospitalizationId: string) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const { error } = await supabase
      .from("hospitalization_medecine")
      .delete()
      .eq("hospitalizationId", hospitalizationId);

    if (error) throw error;

    revalidatePath("/medecine/hospitalizations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting hospitalization:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}