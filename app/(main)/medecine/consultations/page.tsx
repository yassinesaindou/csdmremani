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
import { MedecineConsultation } from "./types";

export default function MedecineConsultationsPage() {
  const [consultations, setConsultations] = useState<MedecineConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<MedecineConsultation | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<MedecineConsultation | null>(null);

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
      .from("consultation_medecine")
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
    const timeoutId = setTimeout(() => {
      loadConsultations();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [origin, sex, newCase, seenByDoctor]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadConsultations();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleRowClick = (consultation: MedecineConsultation) => {
    setSelectedConsultation(consultation);
    setDetailModalOpen(true);
  };

  const handleEditClick = (consultation: MedecineConsultation) => {
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
            Consultations Médecine
          </h1>
          <p className="text-gray-600 mt-1">
            Gérer les consultations du département de médecine
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleExportClick}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button
            onClick={handleNewConsultation}
            className="bg-blue-600 hover:bg-blue-700 text-white">
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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