/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ActivityCard } from "./components/ActivityCard";
import { UserInfoCard } from "./components/UserInfoCard";
import { DepartmentCard } from "./components/DepartmentCard";
import { UserPDFExport } from "./components/UserPDFExport";
import { EditProfileModal } from "./components/EditProfileModal";
 

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params?.userId as string;
  
  const [user, setUser] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userDepartments, setUserDepartments] = useState<any[]>([]);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!userId) {
      setError("ID utilisateur manquant");
      setLoading(false);
      return;
    }

    loadUserDetails();
  }, [userId]);

  async function loadUserDetails() {
    try {
      setLoading(true);
      setError(null);

      // Check if current user is admin
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("userId", session.user.id)
        .single();

      if (currentUserProfile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select(`
          userId,
          fullName,
          email,
          phoneNumber,
          role,
          branch,
          isActive,
          createdAt
        `)
        .eq("userId", userId)
        .single();

      if (userError) {
        setError("Utilisateur non trouvé");
        return;
      }

      if (!userData) {
        setError("Utilisateur non trouvé");
        return;
      }

      // Get department assignments
      const { data: assignments } = await supabase
        .from("department_users")
        .select(`
          assignmentId,
          departmentId,
          createdAt,
          departments (
            departmentId,
            departementName
          )
        `)
        .eq("userId", userId)
        .order("createdAt", { ascending: false });

      // Get all departments
      const { data: allDepartments } = await supabase
        .from("departments")
        .select("departmentId, departementName")
        .order("departementName");

      setUser(userData);
      setDepartments(allDepartments || []);
      setUserDepartments(assignments || []);

    } catch (err) {
      console.error("Error:", err);
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  const handleToggleStatus = async () => {
    if (!user) return;
    
    if (confirm(`Voulez-vous vraiment ${user.isActive ? "désactiver" : "activer"} cet utilisateur ?`)) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ isActive: !user.isActive })
          .eq("userId", userId);

        if (error) throw error;

        setUser((prev: any) => ({
          ...prev,
          isActive: !prev.isActive
        }));
        
        alert("Statut mis à jour avec succès");
        
      } catch (error) {
        console.error("Error:", error);
        alert("Erreur lors de la modification");
      }
    }
  };

  const handleAssignDepartment = async (departmentId: string) => {
    if (!departmentId) return;

    if (confirm("Assigner cet utilisateur à ce département ?")) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Non autorisé");

        // Check existing assignment
        const { data: existing } = await supabase
          .from("department_users")
          .select("*")
          .eq("userId", userId)
          .eq("departmentId", departmentId)
          .single();

        if (existing) {
          alert("L'utilisateur est déjà affecté à ce département");
          return;
        }

        const { error } = await supabase
          .from("department_users")
          .insert({
            userId,
            departmentId,
            createdBy: session.user.id,
          });

        if (error) throw error;

        // Refresh data
        await loadUserDetails();
        alert("Département assigné avec succès");
        
      } catch (error) {
        console.error("Error:", error);
        alert("Erreur lors de l'assignation");
      }
    }
  };

  const handleRemoveAssignment = async (assignmentId: string, departmentName: string) => {
    if (confirm(`Retirer cet utilisateur du département ${departmentName} ?`)) {
      try {
        const { error } = await supabase
          .from("department_users")
          .delete()
          .eq("assignmentId", assignmentId);

        if (error) throw error;

        // Refresh data
        await loadUserDetails();
        alert("Affectation retirée avec succès");
        
      } catch (error) {
        console.error("Error:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des détails...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-4">
            <span className="text-2xl text-rose-600">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || "Utilisateur non trouvé"}</h2>
          <p className="text-gray-600 mb-6">L'utilisateur demandé n'existe pas.</p>
          <Link href="/admin/users">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/users">
          <Button variant="ghost" className="mb-6 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.fullName || "Utilisateur sans nom"}
            </h1>
            <p className="text-gray-600 mt-2">
              Détails complets de l'utilisateur
            </p>
          </div>
          
          <div className="flex gap-3">
  <UserPDFExport user={user} userDepartments={userDepartments} />
  <EditProfileModal 
    user={user} 
    onSuccess={loadUserDetails} 
  />
</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <UserInfoCard 
            user={user} 
            isAdmin={isAdmin}
            onToggleStatus={handleToggleStatus}
          />
          <ActivityCard user={user} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <DepartmentCard 
            user={user}
            userDepartments={userDepartments}
            departments={departments}
            isAdmin={isAdmin}
            onAssignDepartment={handleAssignDepartment}
            onRemoveAssignment={handleRemoveAssignment}
          />
          
          {/* Additional Info Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border-2 border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Informations supplémentaires</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Compte créé:</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Départements:</span>
                <span className="font-medium">
                  {userDepartments.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Téléphone:</span>
                <span className="font-medium">
                  {user.phoneNumber || "Non renseigné"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Résumé</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {userDepartments.length}
                </div>
                <div className="text-sm text-blue-600">Départements</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-700">
                  {user.isActive ? "✓" : "✗"}
                </div>
                <div className="text-sm text-emerald-600">Statut</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">
                  {user.phoneNumber ? "✓" : "—"}
                </div>
                <div className="text-sm text-amber-600">Téléphone</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {user.email ? "✓" : "—"}
                </div>
                <div className="text-sm text-purple-600">Email</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          ID utilisateur: <span className="font-mono">{userId}</span>
        </div>
      </div>
    </div>
  );
}