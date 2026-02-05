"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non autorisé");

  // Check admin permissions
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("userId", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Admin requis pour modifier le statut");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ isActive: !isActive })
    .eq("userId", userId);

  if (error) throw error;

  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function assignDepartment(userId: string, departmentId: string) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non autorisé");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("userId", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Admin requis pour assigner des départements");
  }

  // Check if assignment exists
  const { data: existing } = await supabase
    .from("department_users")
    .select("*")
    .eq("userId", userId)
    .eq("departmentId", departmentId)
    .single();

  if (existing) {
    throw new Error("L'utilisateur est déjà affecté à ce département");
  }

  const { error } = await supabase
    .from("department_users")
    .insert({
      userId,
      departmentId,
      createdBy: session.user.id,
    });

  if (error) throw error;

  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function removeDepartmentAssignment(assignmentId: string) {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Non autorisé");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, userId")
    .eq("userId", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Admin requis pour retirer des affectations");
  }

  const { error } = await supabase
    .from("department_users")
    .delete()
    .eq("assignmentId", assignmentId);

  if (error) throw error;

  revalidatePath(`/admin/users/${profile.userId}`);
  return { success: true };
}