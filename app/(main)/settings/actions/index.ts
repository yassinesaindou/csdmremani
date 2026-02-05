/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";

// Validation schema for profile updates
const profileSchema = z.object({
  fullName: z.string().min(1, "Le nom est requis").max(100, "Nom trop long"),
  phoneNumber: z.string().max(20, "Numéro de téléphone trop long").optional().or(z.literal("")),
});

// Validation schema for password change
const passwordSchema = z.object({
  newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string().min(6, "La confirmation doit contenir au moins 6 caractères"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export async function updateProfile(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      fullName: formData.get("fullName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
    };

    const validatedData = profileSchema.parse(rawData);

    const { error } = await supabase
      .from("profiles")
      .update({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .eq("userId", session.user.id);

    if (error) throw error;

    revalidatePath("/settings");
    return { 
      success: true, 
      message: "Profil mis à jour avec succès" 
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue lors de la mise à jour du profil" 
    };
  }
}

export async function changePassword(formData: FormData) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const rawData = {
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validatedData = passwordSchema.parse(rawData);

    // Update password using Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: validatedData.newPassword
    });

    if (error) throw error;

    return { 
      success: true, 
      message: "Mot de passe changé avec succès" 
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue lors du changement de mot de passe" 
    };
  }
}

export async function getCurrentUser() {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé", data: null };
  }

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("userId, fullName, email, phoneNumber, role, isActive")
      .eq("userId", session.user.id)
      .single();

    if (profileError) throw profileError;

    // Get user departments if not admin
    let departments: any[] = [];
    if (profile.role !== 'admin') {
      const { data: departmentAssignments, error: deptError } = await supabase
        .from("department_users")
        .select(`
          departments (
            departmentId,
            departementName
          )
        `)
        .eq("userId", session.user.id);

      if (deptError) throw deptError;

      departments = departmentAssignments
        .map((assignment: any) => assignment.departments)
        .filter(Boolean);
    }

    return { 
      success: true, 
      data: {
        profile,
        departments
      }
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue",
      data: null 
    };
  }
}