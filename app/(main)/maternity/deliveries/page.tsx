"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DeliveriesTable } from "./components/DeliveriesTable";
import { DeliveryFilters } from "./components/DeliveryFilters";
import { DeliveryFormModal } from "./components/DeliveryFormModal";
import { ExportModal } from "./components/ExportModal";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { MaternityDelivery } from "./types";

export default function MaternityDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<MaternityDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<MaternityDelivery | null>(null);
  
  // Filter states
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("all");
  const [deliveryType, setDeliveryType] = useState("all");
  const [motherStatus, setMotherStatus] = useState("all");

  const supabase = createClient();

 

  async function loadDeliveries() {
    setLoading(true);
    
    let query = supabase
      .from("deliveries_maternity")
      .select("*")
      .order("delivery_dateTime", { ascending: false })
      .order("createdAt", { ascending: false });

    // Apply filters
    if (origin !== "all") query = query.eq("origin", origin);
    if (search) {
      query = query.or(`fullName.ilike.%${search}%,fileNumber.ilike.%${search}%`);
    }
    
    // Apply delivery type filter
    if (deliveryType !== "all") {
      if (deliveryType === "eutocic") {
        query = query.not("delivery_eutocic", "is", null);
      } else if (deliveryType === "dystocic") {
        query = query.not("delivery_dystocic", "is", null);
      } else if (deliveryType === "transfert") {
        query = query.not("delivery_transfert", "is", null);
      }
    }
    
    // Apply mother status filter
    if (motherStatus !== "all") {
      query = query.eq("isMotherDead", motherStatus === "dead");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading deliveries:", error);
    } else {
      setDeliveries(data || []);
    }

    setLoading(false);
  }

   useEffect(() => {
    async function loadData() {
      await loadDeliveries();
    }
    loadData();
  }, []);
  const handleEditClick = (delivery: MaternityDelivery) => {
    setEditingDelivery(delivery);
    setFormModalOpen(true);
  };

  const handleNewDelivery = () => {
    setEditingDelivery(null);
    setFormModalOpen(true);
  };

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadDeliveries();
  };

  const handleResetFilters = () => {
    setSearch("");
    setOrigin("all");
    setDeliveryType("all");
    setMotherStatus("all");
  };

  const handleRowClick = (delivery: MaternityDelivery) => {
    // Navigation is handled in the table component
  };

  // Refresh data when filters change
  useEffect(() => {
    async function loadData() {
      loadDeliveries();
    }
    loadData();
  }, [origin, deliveryType, motherStatus, search]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accouchements Maternité</h1>
          <p className="text-gray-600 mt-1">
            Gérer les accouchements du département de maternité
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
            onClick={handleNewDelivery}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvel Accouchement
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <DeliveryFilters
          search={search}
          onSearchChange={setSearch}
          origin={origin}
          onOriginChange={setOrigin}
          deliveryType={deliveryType}
          onDeliveryTypeChange={setDeliveryType}
          motherStatus={motherStatus}
          onMotherStatusChange={setMotherStatus}
          onReset={handleResetFilters}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-3 text-gray-600">Chargement des accouchements...</span>
          </div>
        ) : (
          <DeliveriesTable 
            data={deliveries} 
            onRowClick={handleRowClick}
            onEdit={handleEditClick}
            onRefresh={loadDeliveries}
          />
        )}
      </div>

      {/* Create/Update Modal */}
      <DeliveryFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        delivery={editingDelivery}
        onSuccess={handleFormSuccess}
      />

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        data={deliveries}
      />
    </div>
  );
}