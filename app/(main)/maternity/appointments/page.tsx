/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppointmentsTable } from "./components/AppointmentsTable";
import { AppointmentsFilters } from "./components/AppointmentsFilters";
import { AppointmentDetailModal } from "./components/AppointmentDetailModal";
import { AppointmentFormModal } from "./components/AppointmentFormModal";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Download } from "lucide-react";
import { MaternityAppointment, getDisplayStatus } from "./types";
import { Badge } from "@/components/ui/badge";
import { ExportModal } from "./components/ExportModal";

export default function MaternityAppointmentsPage() {
  const [appointments, setAppointments] = useState<MaternityAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<MaternityAppointment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<MaternityAppointment | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  const supabase = createClient();

 async function loadAppointments() {
  setLoading(true);

  let query = supabase
    .from("maternity_appointments")
    .select("*")
    .order("appointmentDate", { ascending: true });

  // Apply status filter (only for DB statuses)
  if (statusFilter !== "all" && statusFilter !== "missed") {
    query = query.eq("status", statusFilter);
  }

  // Apply date filters - Note: Using Comoros timezone calculations
  const now = new Date();
  
  // Get current time in UTC
  const nowUTC = new Date();
  
  // For Comoros timezone calculations (GMT+3)
  // When filtering for "today", we need to consider Comoros date, not UTC
  const todayStartUTC = new Date();
  todayStartUTC.setUTCHours(21, 0, 0, 0); // 00:00 Comoros = 21:00 UTC previous day
  todayStartUTC.setUTCDate(todayStartUTC.getUTCDate() - 1);
  
  const todayEndUTC = new Date();
  todayEndUTC.setUTCHours(20, 59, 59, 999); // 23:59 Comoros = 20:59 UTC same day

  if (dateFilter === "today") {
    query = query
      .gte("appointmentDate", todayStartUTC.toISOString())
      .lt("appointmentDate", todayEndUTC.toISOString());
  } else if (dateFilter === "upcoming") {
    // For upcoming, use current UTC time
    query = query.gte("appointmentDate", nowUTC.toISOString());
  } else if (dateFilter === "past") {
    query = query.lt("appointmentDate", nowUTC.toISOString());
  }

  // Apply custom date range (dates are in Comoros timezone)
  if (dateRange.start) {
    // Convert Comoros date start to UTC
    const startDateComoros = new Date(dateRange.start);
    startDateComoros.setHours(0, 0, 0, 0); // Start of day Comoros
    
    // Convert to UTC: Comoros 00:00 = UTC 21:00 previous day
    const startDateUTC = new Date(startDateComoros);
    startDateUTC.setUTCHours(startDateUTC.getUTCHours() - 3);
    
    query = query.gte("appointmentDate", startDateUTC.toISOString());
  }
  
  if (dateRange.end) {
    // Convert Comoros date end to UTC
    const endDateComoros = new Date(dateRange.end);
    endDateComoros.setHours(23, 59, 59, 999); // End of day Comoros
    
    // Convert to UTC: Comoros 23:59 = UTC 20:59 same day
    const endDateUTC = new Date(endDateComoros);
    endDateUTC.setUTCHours(endDateUTC.getUTCHours() - 3);
    
    query = query.lte("appointmentDate", endDateUTC.toISOString());
  }

  // Apply search
  if (search) {
    query = query.or(
      `patientName.ilike.%${search}%,patientPhoneNumber.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erreur lors du chargement des rendez-vous:", error);
  } else {
    // Debug logging for timezone verification
    console.log("=== DEBUG: Timezone Conversion Check ===");
    console.log("Total appointments loaded:", data.length);
    
    data.forEach((appointment, index) => {
      if (appointment.appointmentDate) {
        const utcDate = new Date(appointment.appointmentDate);
        const comorosDate = new Date(utcDate.getTime() + (3 * 60 * 60 * 1000));
        
        console.log(`\nRendez-vous ${index + 1} (ID: ${appointment.appointmentId}):`);
        console.log(`  Patient: ${appointment.patientName}`);
        console.log(`  Date UTC (stockée): ${utcDate.toISOString()}`);
        console.log(`  Heure UTC: ${utcDate.getUTCHours().toString().padStart(2, '0')}:${utcDate.getUTCMinutes().toString().padStart(2, '0')}`);
        console.log(`  Date Comoros (affichée): ${comorosDate.toISOString()}`);
        console.log(`  Heure Comoros: ${comorosDate.getHours().toString().padStart(2, '0')}:${comorosDate.getMinutes().toString().padStart(2, '0')}`);
        console.log(`  Statut DB: ${appointment.status}`);
        console.log(`  Statut affiché: ${getDisplayStatus(appointment)}`);
      }
    });
    
    setAppointments(data || []);
  }

  setLoading(false);
}

  useEffect(() => {
    async function loadData() {
      loadAppointments();
    }
    loadData();
  }, []);

  // Calculate statistics including missed appointments
  const statistics = {
    total: appointments.length,
    scheduled: appointments.filter((a) => getDisplayStatus(a) === "scheduled").length,
    completed: appointments.filter((a) => getDisplayStatus(a) === "completed").length,
    cancelled: appointments.filter((a) => getDisplayStatus(a) === "cancelled").length,
    missed: appointments.filter((a) => getDisplayStatus(a) === "missed").length,
    today: appointments.filter((a) => {
      if (!a.appointmentDate) return false;
      const appDate = new Date(a.appointmentDate);
      const today = new Date();
      return appDate.toDateString() === today.toDateString();
    }).length,
  };

  const handleRowClick = (appointment: MaternityAppointment) => {
    setSelectedAppointment(appointment);
    setDetailModalOpen(true);
  };

  const handleEditClick = (appointment: MaternityAppointment) => {
    setEditingAppointment(appointment);
    setFormModalOpen(true);
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setFormModalOpen(true);
  };

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadAppointments();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFilter("all");
    setDateRange({ start: "", end: "" });
  };

  // Filter data for display (apply missed filter client-side)
  const filteredAppointments = appointments.filter((appointment) => {
    const displayStatus = getDisplayStatus(appointment);
    
    if (statusFilter === "all") return true;
    if (statusFilter === "missed") return displayStatus === "missed";
    
    return displayStatus === statusFilter;
  });

  // Refresh data when filters change
  useEffect(() => {
    async function loadData() {
      loadAppointments();
    }
    loadData();
  }, [statusFilter, dateFilter, dateRange, search]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Rendez-vous - Maternité
          </h1>
          <p className="text-gray-600 mt-1">
            Gérer les rendez-vous du département de maternité
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
            onClick={handleNewAppointment}
            className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Rendez-vous
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.total}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Programmés</p>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.scheduled}
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Actif</Badge>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Terminés</p>
              <p className="text-2xl font-bold text-emerald-600">
                {statistics.completed}
              </p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800">Complété</Badge>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Annulés</p>
              <p className="text-2xl font-bold text-rose-600">
                {statistics.cancelled}
              </p>
            </div>
            <Badge className="bg-rose-100 text-rose-800">Annulé</Badge>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Manqués</p>
              <p className="text-2xl font-bold text-amber-600">
                {statistics.missed}
              </p>
            </div>
            <Badge className="bg-amber-100 text-amber-800">Manqué</Badge>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aujourd'hui</p>
              <p className="text-2xl font-bold text-purple-600">
                {statistics.today}
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-800">Today</Badge>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6">
        <AppointmentsFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">
              Chargement des rendez-vous...
            </span>
          </div>
        ) : (
          <AppointmentsTable
            data={filteredAppointments}
            onRowClick={handleRowClick}
            onEdit={handleEditClick}
            onRefresh={loadAppointments}
          />
        )}
      </div>

      {/* Modal de Détails */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      {/* Modal de Création/Modification */}
      <AppointmentFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        appointment={editingAppointment}
        onSuccess={handleFormSuccess}
      />

      {/* Modal d'Export */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        data={filteredAppointments}
      />
    </div>
  );
}