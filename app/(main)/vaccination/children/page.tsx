"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VaccinationDetailModal } from "./components/VaccinationDetailModal";
import { VaccinationFilters } from "./components/VaccinationFilters";
import { VaccinationFormModal } from "./components/VaccinationFormModal";
import { VaccinationsTable } from "./components/VaccinationsTable";
import { ExportModal } from "./components/ExportModal";
import { VaccinationEnfant } from "./types";

export default function VaccinationChildrenPage() {
  const [vaccinations, setVaccinations] = useState<VaccinationEnfant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVaccination, setSelectedVaccination] =
    useState<VaccinationEnfant | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingVaccination, setEditingVaccination] =
    useState<VaccinationEnfant | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [sex, setSex] = useState("all");
  const [strategy, setStrategy] = useState("all");

  const supabase = createClient();
  const router = useRouter();

  async function loadVaccinations() {
    setLoading(true);

    let query = supabase
      .from("vaccination_enfants")
      .select("*")
      .order("createdAt", { ascending: false });

    // Apply filters
    if (sex !== "all") query = query.eq("sex", sex);
    if (strategy !== "all") query = query.eq("strategy", strategy);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;

    if (error) {
      console.error("Error loading vaccinations:", error);
    } else {
      setVaccinations(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function loadData() {
      loadVaccinations();
    }

    loadData();
  }, []);

  // Refresh data when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadVaccinations();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [sex, strategy]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadVaccinations();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleRowClick = (vaccination: VaccinationEnfant) => {
    setSelectedVaccination(vaccination);
    setDetailModalOpen(true);
  };

  const handleEditClick = (vaccination: VaccinationEnfant) => {
    setEditingVaccination(vaccination);
    setFormModalOpen(true);
  };

  const handleNewVaccination = () => {
    setEditingVaccination(null);
    setFormModalOpen(true);
  };

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadVaccinations();
  };

  const handleResetFilters = () => {
    setSearch("");
    setSex("all");
    setStrategy("all");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Vaccination des Enfants
          </h1>
          <p className="text-gray-600 mt-1">
            Gérer les vaccinations du département vaccination
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleExportClick}
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button
            onClick={handleNewVaccination}
            className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Vaccination
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <VaccinationFilters
          search={search}
          onSearchChange={setSearch}
          sex={sex}
          onSexChange={setSex}
          strategy={strategy}
          onStrategyChange={setStrategy}
          onReset={handleResetFilters}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">
              Chargement des vaccinations...
            </span>
          </div>
        ) : (
          <VaccinationsTable
            data={vaccinations}
            onRowClick={handleRowClick}
            onEdit={handleEditClick}
            onRefresh={loadVaccinations}
          />
        )}
      </div>

      {/* Modals */}
      <VaccinationDetailModal
        vaccination={selectedVaccination}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      <VaccinationFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        vaccination={editingVaccination}
        onSuccess={handleFormSuccess}
      />

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        data={vaccinations}
      />
    </div>
  );
}
