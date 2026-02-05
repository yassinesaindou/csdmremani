"use server";

 
import { signOut } from "@/app/(auth)/actions/auth";
import { createServerClient } from "@/lib/supabase/server";
 

 
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  fullName: z.string().min(2, "Le nom complet est requis"),
  phoneNumber: z.string().min(10, "Numéro de téléphone invalide"),
  role: z.string(),
  departmentId: z.string().uuid("ID du département invalide"),
});

export async function createUser(formData: FormData) {
  const supabase = await  createServerClient();
  
  // Check if user is admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Non autorisé");
  }

  // Check if user has admin permissions
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("userId", session.user.id)
    .single();

  if (currentUserProfile?.role !== "admin") {
    throw new Error("Permission refusée. Admin requis.");
  }

  // Parse and validate data
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    fullName: formData.get("fullName") as string,
    phoneNumber: formData.get("phoneNumber") as string,
    role: formData.get("role") as string,
    departmentId: formData.get("departmentId") as string,
  };

  const validatedData = createUserSchema.parse(rawData);

  try {
    // 1. Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (signUpError) throw signUpError;

    // 2. Get department name for branch field
    const { data: department, error: deptError } = await supabase
      .from("departments")
      .select("departementName")
      .eq("departmentId", validatedData.departmentId)
      .single();

    if (deptError) throw deptError;

    // 3. Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        userId: authData.user?.id,
        fullName: validatedData.fullName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        role: validatedData.role,
        branch: department.departementName,
        isActive: true,
      });

    if (profileError) throw profileError;

    // 4. Assign user to department in department_users table
    const { error: assignmentError } = await supabase
      .from("department_users")
      .insert({
        userId: authData.user?.id,
        departmentId: validatedData.departmentId,
        createdBy: session.user.id,
      });

    if (assignmentError) throw assignmentError;

    revalidatePath("/admin/users");
    signOut(); // Sign out the current admin to refresh session
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
 const supabase = await  createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non autorisé");

  // Check admin permissions
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("userId", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Admin requis pour modifier le statut des utilisateurs");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ isActive: !isActive })
    .eq("userId", userId);

  if (error) throw error;

  revalidatePath("/admin/users");
  return { success: true };
}

export async function getDepartments() {
  const supabase = await  createServerClient();
  
  const { data, error } = await supabase
    .from("departments")
    .select("departmentId, departementName")
    .order("departementName");

  if (error) throw error;
  return data;
}