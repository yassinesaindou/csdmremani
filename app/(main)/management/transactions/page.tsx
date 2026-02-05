"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TransactionDetailModal } from "./components/TransactionDetailModal";
import { TransactionFilters } from "./components/TransactionFilters";
import { TransactionFormModal } from "./components/TransactionFormModal";
import { TransactionsTable } from "./components/TransactionsTable";
import { ExportModal } from "./components/ExportModal";
import { StatsCards } from "./components/StatsCards";
import { TransactionWithDepartment, StatsData } from "./types";

export default function ManagementTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithDepartment[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDepartment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithDepartment | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userDepartments, setUserDepartments] = useState<string[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [department, setDepartment] = useState("all");
  const [dateRange, setDateRange] = useState({ from: undefined as Date | undefined, to: undefined as Date | undefined });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadUserInfo() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, userId")
          .eq("userId", session.user.id)
          .single();
        
        setUserRole(profile?.role || null);

        // Load user departments
        const { data: departmentAssignments } = await supabase
          .from("department_users")
          .select(`
            departments (
              departementName
            )
          `)
          .eq("userId", profile?.userId);

        const departmentNames = departmentAssignments?.map(
          (assignment: any) => assignment.departments?.departementName?.toLowerCase()
        ) || [];
        
        setUserDepartments(departmentNames);
      }
    }
    
    loadUserInfo();
  }, []);

  async function loadTransactions() {
    setLoading(true);

    let query = supabase
      .from("transactions")
      .select(`
        *,
        departments!transactions_departmentToSee_fkey (
          departementName
        ),
        profiles!transactions_createdBy_fkey (
          fullName
        )
      `)
      .order("createdAt", { ascending: false });

    // Apply filters
    if (type !== "all") query = query.eq("type", type);
    if (department !== "all") {
      if (department === "general") {
        query = query.is("departmentToSee", null);
      } else {
        query = query.eq("departmentToSee", department);
      }
    }
    if (search) query = query.ilike("reason", `%${search}%`);

    // Apply date range filter
    if (dateRange.from) {
      query = query.gte("createdAt", dateRange.from.toISOString());
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      query = query.lte("createdAt", toDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading transactions:", error);
    } else {
      const formattedData = (data || []).map(transaction => ({
        ...transaction,
        department_name: transaction.departments?.departementName || null,
        created_by_name: transaction.profiles?.fullName || null
      }));
      
      setTransactions(formattedData);
      
      // Calculate stats
      calculateStats(formattedData);
    }

    setLoading(false);
  }

  function calculateStats(transactions: TransactionWithDepartment[]) {
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income' && transaction.amount) {
        totalIncome += transaction.amount;
      } else if (transaction.type === 'expense' && transaction.amount) {
        totalExpenses += transaction.amount;
      }
    });
    
    setStats({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: transactions.length
    });
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  // Refresh data when filters change
  useEffect(() => {
    loadTransactions();
  }, [type, department, dateRange]);

  const handleRowClick = (transaction: TransactionWithDepartment) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  const handleEditClick = (transaction: TransactionWithDepartment) => {
    setEditingTransaction(transaction);
    setFormModalOpen(true);
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setFormModalOpen(true);
  };

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadTransactions();
  };

  const handleResetFilters = () => {
    setSearch("");
    setType("all");
    setDepartment("all");
    setDateRange({ from: undefined, to: undefined });
  };

  // Check if user can see stats and export
  const canSeeStatsAndExport = userRole === "admin" || 
                               (userDepartments.includes("management") && userRole === "manager");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion Financière
          </h1>
          <p className="text-gray-600 mt-1">
            Suivi des recettes et dépenses de l'hôpital
          </p>
        </div>

        <div className="flex gap-3">
          {canSeeStatsAndExport && (
            <Button
              onClick={handleExportClick}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          )}
          <Button
            onClick={handleNewTransaction}
            className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Transaction
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {canSeeStatsAndExport && (
        <div className="mb-6">
          <StatsCards stats={stats} />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <TransactionFilters
          search={search}
          onSearchChange={setSearch}
          type={type}
          onTypeChange={setType}
          department={department}
          onDepartmentChange={setDepartment}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onReset={handleResetFilters}
          onSearchSubmit={() => loadTransactions()}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">
              Chargement des transactions...
            </span>
          </div>
        ) : (
          <TransactionsTable
            data={transactions}
            onRowClick={handleRowClick}
            onEdit={handleEditClick}
            onRefresh={loadTransactions}
            canEdit={userRole === "admin" || userDepartments.includes("management")}
          />
        )}
      </div>

      {/* Modals */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      <TransactionFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        transaction={editingTransaction}
        onSuccess={handleFormSuccess}
      />

      {canSeeStatsAndExport && (
        <ExportModal
          open={exportModalOpen}
          onOpenChange={setExportModalOpen}
          data={transactions}
        />
      )}
    </div>
  );
}