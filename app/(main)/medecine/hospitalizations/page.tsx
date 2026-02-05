"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { HospitalizationsTable } from "./components/HospitalizationsTable";
import { HospitalizationFilters } from "./components/HospitalizationFilters";
import { HospitalizationFormModal } from "./components/HospitalizationFormModal";
import { ExportModal } from "./components/ExportModal";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { MedicineHospitalization } from "./types";

export default function MedicineHospitalizationsPage() {
  const [hospitalizations, setHospitalizations] = useState<
    MedicineHospitalization[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingHospitalization, setEditingHospitalization] =
    useState<MedicineHospitalization | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("all");
  const [sex, setSex] = useState("all");
  const [emergency, setEmergency] = useState("all");
  const [leaveStatus, setLeaveStatus] = useState("all");

  const supabase = createClient();

  async function loadHospitalizations() {
    setLoading(true);

    let query = supabase
      .from("hospitalization_medecine")
      .select("*")
      .order("createdAt", { ascending: false });

    // Apply filters
    if (origin !== "all") query = query.eq("origin", origin);
    if (sex !== "all") query = query.eq("sex", sex);
    if (emergency !== "all")
      query = query.eq("isEmergency", emergency === "true");
    if (search) query = query.ilike("fullName", `%${search}%`);

    // Apply leave status filter
    if (leaveStatus !== "all") {
      if (leaveStatus === "active") {
        // Active = no leave status selected
        query = query
          .eq("leave_authorized", false)
          .eq("leave_evaded", false)
          .eq("leave_transfered", false)
          .eq("leave_diedBefore48h", false)
          .eq("leave_diedAfter48h", false);
      } else if (leaveStatus === "authorized") {
        query = query.eq("leave_authorized", true);
      } else if (leaveStatus === "evaded") {
        query = query.eq("leave_evaded", true);
      } else if (leaveStatus === "transfered") {
        query = query.eq("leave_transfered", true);
      } else if (leaveStatus === "diedBefore48h") {
        query = query.eq("leave_diedBefore48h", true);
      } else if (leaveStatus === "diedAfter48h") {
        query = query.eq("leave_diedAfter48h", true);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading hospitalizations:", error);
    } else {
      setHospitalizations(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadHospitalizations();
  }, []);

  const handleEditClick = (hospitalization: MedicineHospitalization) => {
    setEditingHospitalization(hospitalization);
    setFormModalOpen(true);
  };

  const handleNewHospitalization = () => {
    setEditingHospitalization(null);
    setFormModalOpen(true);
  };

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadHospitalizations();
  };

  const handleResetFilters = () => {
    setSearch("");
    setOrigin("all");
    setSex("all");
    setEmergency("all");
    setLeaveStatus("all");
  };

  const handleRowClick = (hospitalization: MedicineHospitalization) => {
    // Navigation is handled in the table component via router.push
  };

  // Refresh data when filters change
  useEffect(() => {
    loadHospitalizations();
  }, [origin, sex, emergency, leaveStatus, search]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hospitalisations Médecine
          </h1>
          <p className="text-gray-600 mt-1">
            Gérer les hospitalisations du département de médecine
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
            onClick={handleNewHospitalization}
            className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Hospitalisation
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <HospitalizationFilters
          search={search}
          onSearchChange={setSearch}
          origin={origin}
          onOriginChange={setOrigin}
          sex={sex}
          onSexChange={setSex}
          emergency={emergency}
          onEmergencyChange={setEmergency}
          leaveStatus={leaveStatus}
          onLeaveStatusChange={setLeaveStatus}
          onReset={handleResetFilters}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">
              Chargement des hospitalisations...
            </span>
          </div>
        ) : (
          <HospitalizationsTable
            data={hospitalizations}
            onRowClick={handleRowClick}
            onEdit={handleEditClick}
            onRefresh={loadHospitalizations}
          />
        )}
      </div>

      {/* Create/Update Modal */}
      <HospitalizationFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        hospitalization={editingHospitalization}
        onSuccess={handleFormSuccess}
      />

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        data={hospitalizations}
      />
    </div>
  );
}
