/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function checkManagementAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // Récupérer le profil de l'utilisateur
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, userId")
        .eq("userId", session.user.id)
        .single();

      // Vérifier si l'utilisateur est admin
      if (profile?.role === "admin") {
        setLoading(false);
        return;
      }

      // Vérifier si l'utilisateur est assigné aux départements management ou administration
      const { data: departmentAssignments } = await supabase
        .from("department_users")
        .select(`
          departments (
            departementName
          )
        `)
        .eq("userId", profile?.userId);

      // Vérifier si l'un des départements de l'utilisateur est "management" ou "administration"
      const hasAccess = departmentAssignments?.some(
        (assignment: any) => {
          const deptName = assignment.departments?.departementName?.toLowerCase();
          return deptName === "management" || deptName === "administration";
        }
      );

      if (!hasAccess) {
        router.push("/unauthorized");
      } else {
        setLoading(false);
      }
    }

    checkManagementAccess();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}