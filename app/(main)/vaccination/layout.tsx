/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function VaccinationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function checkVaccinationAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // Get user's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, userId")
        .eq("userId", session.user.id)
        .single();

      // Check if user is admin
      if (profile?.role === "admin") {
        setLoading(false);
        return;
      }

      // Check if user is assigned to vaccination department
      const { data: departmentAssignments } = await supabase
        .from("department_users")
        .select(`
          departments (
            departementName
          )
        `)
        .eq("userId", profile?.userId);

      // Check if any of the user's departments is "vaccination"
      const hasVaccinationAccess = departmentAssignments?.some(
        (assignment: any) => 
          assignment.departments?.departementName?.toLowerCase() === "vaccination"
      );

      if (!hasVaccinationAccess) {
        router.push("/unauthorized");
      } else {
        setLoading(false);
      }
    }

    checkVaccinationAccess();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}