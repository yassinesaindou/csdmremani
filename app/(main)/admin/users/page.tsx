"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { UserTable, CreateUserModal, UserFilters } from "./components";
import { getDepartments } from "./actions/users";
import { UserProfile, Department } from "./types/user";
import { ExportButton } from "./components/ExportButton";

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkPermissionsAndFetchData();
  }, []);

  async function checkPermissionsAndFetchData() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

    
      setIsAdmin(true);
      await fetchData();
    } catch (err) {
      console.error("Error:", err);
      setError("Erreur lors de la vérification des permissions");
      setLoading(false);
    }
  }

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch departments
      const depts = await getDepartments();
      setDepartments(depts);

      // Fetch users with their department info
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select(
          `
          userId,
          fullName,
          email,
          phoneNumber,
          role,
          branch,
          isActive,
          createdAt
        `,
        )
        .order("createdAt", { ascending: false });

      if (usersError) throw usersError;

      // Fetch department assignments
      const { data: assignments, error: assignmentError } = await supabase.from(
        "department_users",
      ).select(`
          userId,
          departmentId,
          departments (
            departmentId,
            departementName
          )
        `);

      if (assignmentError) throw assignmentError;

      // Combine user data with department info
      const combinedUsers = usersData.map((user) => {
        const assignment = assignments?.find((a) => a.userId === user.userId);
        return {
          ...user,
          department: assignment?.departments?.[0],
        };
      });

      setUsers(combinedUsers);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        user.fullName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phoneNumber?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Role filter
    if (roleFilter !== "all" && user.role !== roleFilter) return false;

    // Department filter
    if (departmentFilter !== "all") {
      const deptName = user.department?.departementName || user.branch;
      if (deptName !== departmentFilter) return false;
    }

    // Status filter
    if (statusFilter !== "all") {
      const isActive = user.isActive;
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600">
            Gérez les utilisateurs et leurs permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton users={filteredUsers} />
          <CreateUserModal departments={departments} />
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-md border border-rose-200 mb-6">
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
            <UserFilters
              onSearchChange={setSearch}
              onRoleChange={setRoleFilter}
              onDepartmentChange={setDepartmentFilter}
              onStatusChange={setStatusFilter}
              searchValue={search}
              roleValue={roleFilter}
              departmentValue={departmentFilter}
              statusValue={statusFilter}
            />
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <UserTable users={filteredUsers} />
          </div>
        </>
      )}
    </div>
  );
}
