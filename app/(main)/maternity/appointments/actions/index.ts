"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Update schema to only accept DB statuses
const appointmentSchema = z.object({
  patientName: z.string().min(1, "Le nom du patient est requis").nullable(),
  patientPhoneNumber: z.string().min(1, "Le téléphone est requis").nullable(),
  patientAddress: z.string().optional().nullable(),
  appointmentReason: z.string().optional().nullable(),
  appointmentDate: z.string().optional().nullable(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled').nullable(),
});

interface AppointmentData {
  patientName: string;
  patientPhoneNumber: string;
  patientAddress: string;
  appointmentReason: string;
  appointmentDate: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export async function createAppointment(data: AppointmentData) {
  console.log("createAppointment appelé avec les données:", data);
  
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.log("Aucune session trouvée");
    return { success: false, error: "Non autorisé" };
  }

  try {
    console.log("Données brutes reçues:", data);

    const validatedData = appointmentSchema.parse(data);

    console.log("Données validées:", validatedData);

    const { data: result, error } = await supabase
      .from("maternity_appointments")
      .insert([{
        ...validatedData,
        createdBy: session.user.id,
      }])
      .select();

    if (error) {
      console.error("Erreur Supabase:", error);
      throw error;
    }

    console.log("Rendez-vous créé avec succès:", result);

    revalidatePath("/maternity/appointments");
    return { success: true, data: result };
  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function updateAppointment(id: number, data: AppointmentData) {
  console.log("updateAppointment appelé pour l'ID:", id);
  
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    console.log("Données brutes pour mise à jour:", data);

    const validatedData = appointmentSchema.parse(data);

    const { data: result, error } = await supabase
      .from("maternity_appointments")
      .update({
        ...validatedData,
        updatedAt: new Date().toISOString(),
        updatedBy: session.user.id,
      })
      .eq("appointmentId", id)
      .select();

    if (error) {
      console.error("Erreur de mise à jour Supabase:", error);
      throw error;
    }

    console.log("Rendez-vous mis à jour avec succès:", result);

    revalidatePath("/maternity/appointments");
    return { success: true, data: result };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}

export async function deleteAppointment(id: number) {
  console.log("deleteAppointment appelé pour l'ID:", id);
  
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const { error } = await supabase
      .from("maternity_appointments")
      .delete()
      .eq("appointmentId", id);

    if (error) {
      console.error("Erreur de suppression Supabase:", error);
      throw error;
    }

    console.log("Rendez-vous supprimé avec succès");

    revalidatePath("/maternity/appointments");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du rendez-vous:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}