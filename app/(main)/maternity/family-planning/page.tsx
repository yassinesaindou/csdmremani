"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FamilyPlanningTable } from "./components/FamilyPlanningTable";
import { FamilyPlanningFilters } from "./components/FamilyPlanningFilters";
import { FamilyPlanningDetailModal } from "./components/FamilyPlanningDetailModal";
import { FamilyPlanningFormModal } from "./components/FamilyPlanningFormModal";
import { ExportModal } from "./components/ExportModal";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { FamilyPlanningRecord } from "./types";

export default function FamilyPlanningPage() {
  const [records, setRecords] = useState<FamilyPlanningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<FamilyPlanningRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FamilyPlanningRecord | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("all");
  const [isNew, setIsNew] = useState("all");
  const [fileNumber, setFileNumber] = useState("");

  const supabase = createClient();

  async function loadRecords() {
    setLoading(true);

    let query = supabase
      .from("panning_familial_maternity")
      .select("*")
      .order("createdAt", { ascending: false });

    // Apply filters
    if (origin !== "all") query = query.eq("origin", origin);
    if (isNew !== "all") query = query.eq("isNew", isNew === "true");
    if (search) query = query.ilike("fullName", `%${search}%`);
    if (fileNumber) query = query.ilike("fileNumber", `%${fileNumber}%`);

    const { data, error } = await query;

    if (error) {
      console.error("Error loading family planning records:", error);
    } else {
      setRecords(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function fetchRecords() {
      await loadRecords();
    }
    fetchRecords();
  }, []);

  const handleRowClick = (record: FamilyPlanningRecord) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleEditClick = (record: FamilyPlanningRecord) => {
    setEditingRecord(record);
    setFormModalOpen(true);
  };

  const handleNewRecord = () => {
    setEditingRecord(null);
    setFormModalOpen(true);
  };

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadRecords();
  };

  const handleResetFilters = () => {
    setSearch("");
    setOrigin("all");
    setIsNew("all");
    setFileNumber("");
  };

  // Refresh data when filters change
  useEffect(() => {
     async function fetchRecords() {
      await loadRecords();
    }
    fetchRecords();
  }, [origin, isNew, search, fileNumber]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Planning Familial - Maternité
          </h1>
          <p className="text-gray-600 mt-1">
            Gérer les consultations de planning familial
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
            onClick={handleNewRecord}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Consultation
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FamilyPlanningFilters
          search={search}
          onSearchChange={setSearch}
          origin={origin}
          onOriginChange={setOrigin}
          isNew={isNew}
          onIsNewChange={setIsNew}
          fileNumber={fileNumber}
          onFileNumberChange={setFileNumber}
          onReset={handleResetFilters}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">
              Chargement des consultations...
            </span>
          </div>
        ) : (
          <FamilyPlanningTable
            data={records}
            onRowClick={handleRowClick}
            onEdit={handleEditClick}
            onRefresh={loadRecords}
          />
        )}
      </div>

      {/* Detail Modal */}
      <FamilyPlanningDetailModal
        record={selectedRecord}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      {/* Create/Update Modal */}
      <FamilyPlanningFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        record={editingRecord}
        onSuccess={handleFormSuccess}
      />

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        data={records}
      />
    </div>
  );
}