"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const familyPlanningSchema = z.object({
  fileNumber: z.string().optional(),
  fullName: z.string().min(1, "Le nom est requis"),
  age: z.string().optional(),
  origin: z.enum(['HD', 'DS']).optional(),
  address: z.string().optional(),
  isNew: z.boolean().default(true),
  // New methods
  new_noristerat: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  new_microlut: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  new_microgynon: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  new_emergencyPill: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  new_maleCondom: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  new_femaleCondom: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  new_IUD: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  new_implano_explano: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  // Renewal methods
  renewal_noristerat: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  renewal_microgynon: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  renewal_lofemanal: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  renewal_maleCondom: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  renewal_femaleCondom: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  renewal_IUD: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
  renewal_implants: z.string().optional().transform(val => val === "" ? null : parseInt(val || "0")),
});

export async function createFamilyPlanningRecord(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      fileNumber: formData.get("fileNumber") as string,
      fullName: formData.get("fullName") as string,
      age: formData.get("age") as string,
      origin: formData.get("origin") as 'HD' | 'DS',
      address: formData.get("address") as string,
      isNew: formData.get("isNew") === "true",
      // New methods
      new_noristerat: formData.get("new_noristerat") as string,
      new_microlut: formData.get("new_microlut") as string,
      new_microgynon: formData.get("new_microgynon") as string,
      new_emergencyPill: formData.get("new_emergencyPill") as string,
      new_maleCondom: formData.get("new_maleCondom") as string,
      new_femaleCondom: formData.get("new_femaleCondom") as string,
      new_IUD: formData.get("new_IUD") as string,
      new_implano_explano: formData.get("new_implano_explano") as string,
      // Renewal methods
      renewal_noristerat: formData.get("renewal_noristerat") as string,
      renewal_microgynon: formData.get("renewal_microgynon") as string,
      renewal_lofemanal: formData.get("renewal_lofemanal") as string,
      renewal_maleCondom: formData.get("renewal_maleCondom") as string,
      renewal_femaleCondom: formData.get("renewal_femaleCondom") as string,
      renewal_IUD: formData.get("renewal_IUD") as string,
      renewal_implants: formData.get("renewal_implants") as string,
    };

    const validatedData = familyPlanningSchema.parse(rawData);

    const { error } = await supabase
      .from("panning_familial_maternity")
      .insert([{
        ...validatedData,
        createdBy: session.user.id,
      }]);

    if (error) throw error;

    revalidatePath("/maternity/family-planning");
    return { success: true };
  } catch (error) {
    console.error("Error creating family planning record:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function updateFamilyPlanningRecord(id: string, formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      fileNumber: formData.get("fileNumber") as string,
      fullName: formData.get("fullName") as string,
      age: formData.get("age") as string,
      origin: formData.get("origin") as 'HD' | 'DS',
      address: formData.get("address") as string,
      isNew: formData.get("isNew") === "true",
      // New methods
      new_noristerat: formData.get("new_noristerat") as string,
      new_microlut: formData.get("new_microlut") as string,
      new_microgynon: formData.get("new_microgynon") as string,
      new_emergencyPill: formData.get("new_emergencyPill") as string,
      new_maleCondom: formData.get("new_maleCondom") as string,
      new_femaleCondom: formData.get("new_femaleCondom") as string,
      new_IUD: formData.get("new_IUD") as string,
      new_implano_explano: formData.get("new_implano_explano") as string,
      // Renewal methods
      renewal_noristerat: formData.get("renewal_noristerat") as string,
      renewal_microgynon: formData.get("renewal_microgynon") as string,
      renewal_lofemanal: formData.get("renewal_lofemanal") as string,
      renewal_maleCondom: formData.get("renewal_maleCondom") as string,
      renewal_femaleCondom: formData.get("renewal_femaleCondom") as string,
      renewal_IUD: formData.get("renewal_IUD") as string,
      renewal_implants: formData.get("renewal_implants") as string,
    };

    const validatedData = familyPlanningSchema.parse(rawData);

    const { error } = await supabase
      .from("panning_familial_maternity")
      .update({
        ...validatedData,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.id,
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/maternity/family-planning");
    return { success: true };
  } catch (error) {
    console.error("Error updating family planning record:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function deleteFamilyPlanningRecord(id: string) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const { error } = await supabase
      .from("panning_familial_maternity")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/maternity/family-planning");
    return { success: true };
  } catch (error) {
    console.error("Error deleting family planning record:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}