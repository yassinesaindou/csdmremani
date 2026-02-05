"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConsultationDetailModal } from "./components/ConsultationDetailModal";
import { ConsultationFilters } from "./components/ConsultationFilters";
import { ConsultationFormModal } from "./components/ConsultationFormModal";
import { ConsultationsTable } from "./components/ConsultationsTable";
import { ExportModal } from "./components/ExportModal";
import { MaternityConsultation } from "./types";

export default function MaternityConsultationsPage() {
  const [consultations, setConsultations] = useState<MaternityConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<MaternityConsultation | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<MaternityConsultation | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("all");
  const [sex, setSex] = useState("all");
  const [newCase, setNewCase] = useState("all");
  const [seenByDoctor, setSeenByDoctor] = useState("all");

  const supabase = createClient();
  const router = useRouter();

  async function loadConsultations() {
    setLoading(true);

    let query = supabase
      .from("consultation_maternity")
      .select("*")
      .order("createdAt", { ascending: false });

    // Apply filters
    if (origin !== "all") query = query.eq("origin", origin);
    if (sex !== "all") query = query.eq("sex", sex);
    if (newCase !== "all") query = query.eq("isNewCase", newCase === "true");
    if (seenByDoctor !== "all")
      query = query.eq("seenByDoctor", seenByDoctor === "true");
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;

    if (error) {
      console.error("Error loading consultations:", error);
    } else {
      setConsultations(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function loadData() {
      loadConsultations();
    }

    loadData();
  }, []);

  // Refresh data when filters change
  useEffect(() => {
   async function loadData() {
      loadConsultations();
    }

    loadData();
  }, [origin, sex, newCase, seenByDoctor, search]);

  const handleRowClick = (consultation: MaternityConsultation) => {
    setSelectedConsultation(consultation);
    setDetailModalOpen(true);
  };

  const handleEditClick = (consultation: MaternityConsultation) => {
    setEditingConsultation(consultation);
    setFormModalOpen(true);
  };

  const handleNewConsultation = () => {
    setEditingConsultation(null);
    setFormModalOpen(true);
  };

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadConsultations();
  };

  const handleResetFilters = () => {
    setSearch("");
    setOrigin("all");
    setSex("all");
    setNewCase("all");
    setSeenByDoctor("all");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Consultations Maternité
          </h1>
          <p className="text-gray-600 mt-1">
            Gérer les consultations du département de maternité
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
            onClick={handleNewConsultation}
            className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Consultation
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ConsultationFilters
          search={search}
          onSearchChange={setSearch}
          origin={origin}
          onOriginChange={setOrigin}
          sex={sex}
          onSexChange={setSex}
          newCase={newCase}
          onNewCaseChange={setNewCase}
          seenByDoctor={seenByDoctor}
          onSeenByDoctorChange={setSeenByDoctor}
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
          <ConsultationsTable
            data={consultations}
            onRowClick={handleRowClick}
            onEdit={handleEditClick}
            onRefresh={loadConsultations}
          />
        )}
      </div>

      {/* Modals */}
      <ConsultationDetailModal
        consultation={selectedConsultation}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      <ConsultationFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        consultation={editingConsultation}
        onSuccess={handleFormSuccess}
      />

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        data={consultations}
      />
    </div>
  );
}