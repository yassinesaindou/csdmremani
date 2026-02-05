"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PrenatalTable } from "./components/PrenatalTable";
import { PrenatalFilters } from "./components/PrenatalFilters";
import { PrenatalDetailModal } from "./components/PrenatalDetailModal";
import { PrenatalFormModal } from "./components/PrenatalFormModal";
import { ExportModal } from "./components/ExportModal";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { PrenatalRecord } from "./types";

export default function PrenatalPage() {
  const [records, setRecords] = useState<PrenatalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<PrenatalRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PrenatalRecord | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [fileNumber, setFileNumber] = useState("");
  const [hasCPN1, setHasCPN1] = useState("all");
  const [hasCPN4, setHasCPN4] = useState("all");
  const [hasAnemia, setHasAnemia] = useState("all");

  const supabase = createClient();

  async function loadRecords() {
    setLoading(true);

    let query = supabase
      .from("prenatal_maternity")
      .select("*")
      .order("createdAt", { ascending: false });

    // Apply filters
    if (search) query = query.ilike("fullName", `%${search}%`);
    if (fileNumber) query = query.ilike("fileNumber", `%${fileNumber}%`);
    if (hasCPN1 !== "all") query = query.not("visitCPN1", "is", null);
    if (hasCPN4 !== "all") query = query.not("visitCPN4", "is", null);
    if (hasAnemia !== "all") {
      if (hasAnemia === "yes") {
        query = query.not("anemy", "is", null).not("anemy", "eq", "none");
      } else {
        query = query.or(`anemy.is.null,anemy.eq.none`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading prenatal records:", error);
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

  const handleRowClick = (record: PrenatalRecord) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleEditClick = (record: PrenatalRecord) => {
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
    setFileNumber("");
    setHasCPN1("all");
    setHasCPN4("all");
    setHasAnemia("all");
  };

  // Refresh data when filters change
  useEffect(() => {
    async function fetchRecords() {
      await loadRecords();
    }
    fetchRecords();
  }, [search, fileNumber, hasCPN1, hasCPN4, hasAnemia]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Consultations Prénatales - Maternité
          </h1>
          <p className="text-gray-600 mt-1">
            Gérer les consultations prénatales (CPN)
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
        <PrenatalFilters
          search={search}
          onSearchChange={setSearch}
          fileNumber={fileNumber}
          onFileNumberChange={setFileNumber}
          hasCPN1={hasCPN1}
          onHasCPN1Change={setHasCPN1}
          hasCPN4={hasCPN4}
          onHasCPN4Change={setHasCPN4}
          hasAnemia={hasAnemia}
          onHasAnemiaChange={setHasAnemia}
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
          <PrenatalTable
            data={records}
            onRowClick={handleRowClick}
            onEdit={handleEditClick}
            onRefresh={loadRecords}
          />
        )}
      </div>

      {/* Detail Modal */}
      <PrenatalDetailModal
        record={selectedRecord}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      {/* Create/Update Modal */}
      <PrenatalFormModal
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