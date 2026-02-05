/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Download, Package, PackagePlus, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { InventoryItem } from "./types";
import { ItemDetailModal } from "./components/ItemDetailModal";
import { ItemFormModal } from "./components/ItemFormModal";
import { InventoryFilters } from "./components/InventoryFilters";
import { InventoryTable } from "./components/InventoryTable";
import { UseItemModal } from "./components/UseItemModal";
import { RestockModal } from "./components/RestockModal";
import { ExportModal } from "./components/ExportModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [useItemModalOpen, setUseItemModalOpen] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState("all");
  const [sortBy, setSortBy] = useState("quantity-asc");

  const supabase = createClient();

  async function loadInventory() {
    setLoading(true);

    let query = supabase
      .from("inventory")
      .select("*")
      .order("createdAt", { ascending: false });

    // Apply search filter
    if (search) {
      query = query.ilike("itemName", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading inventory:", error);
    } else {
      let filteredData = data || [];

      // Apply stock status filter
      if (stockStatus === "low") {
        filteredData = filteredData.filter(item => (item.quantity || 0) < 10 && (item.quantity || 0) > 0);
      } else if (stockStatus === "out") {
        filteredData = filteredData.filter(item => (item.quantity || 0) === 0);
      } else if (stockStatus === "available") {
        filteredData = filteredData.filter(item => (item.quantity || 0) >= 10);
      }

      // Apply sorting
      filteredData.sort((a, b) => {
        switch (sortBy) {
          case "quantity-asc":
            return (a.quantity || 0) - (b.quantity || 0);
          case "quantity-desc":
            return (b.quantity || 0) - (a.quantity || 0);
          case "name-asc":
            return (a.itemName || "").localeCompare(b.itemName || "");
          case "name-desc":
            return (b.itemName || "").localeCompare(a.itemName || "");
          case "recent":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          default:
            return 0;
        }
      });

      setInventory(filteredData);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function loadData() {
      loadInventory();
    }

    loadData();
  }, []);

  // Refresh data when filters change
  useEffect(() => {
    async function loadData() {
      loadInventory();
    }

    loadData();
  }, [stockStatus, sortBy, search]);

  const handleRowClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setFormModalOpen(true);
  };

  const handleUseItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setUseItemModalOpen(true);
  };

  const handleRestockClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setRestockModalOpen(true);
  };

  const handleNewItem = () => {
    setEditingItem(null);
    setFormModalOpen(true);
  };

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

  const handleFormSuccess = () => {
    loadInventory();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStockStatus("all");
    setSortBy("quantity-asc");
  };

  // Calculate statistics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => (item.quantity || 0) < 10 && (item.quantity || 0) > 0).length;
  const outOfStockItems = inventory.filter(item => (item.quantity || 0) === 0).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion d'Inventaire
          </h1>
          <p className="text-gray-600 mt-1">
            Gérer les articles et le stock de l'hôpital
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
            onClick={handleNewItem}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            <PackagePlus className="mr-2 h-4 w-4" />
            Nouvel Article
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Articles Totaux
            </CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-gray-500">
              Enregistrés dans l'inventaire
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stock Faible
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockItems}</div>
            <p className="text-xs text-gray-500">
              Articles avec moins de 10 unités
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En Rupture
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{outOfStockItems}</div>
            <p className="text-xs text-gray-500">
              Articles épuisés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quantité Totale
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">
              Unités disponibles au total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <InventoryFilters
          search={search}
          onSearchChange={setSearch}
          stockStatus={stockStatus}
          onStockStatusChange={setStockStatus}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onReset={handleResetFilters}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Chargement de l'inventaire...
            </span>
          </div>
        ) : (
         <InventoryTable
  data={inventory}
  onRowClick={handleRowClick}  // This was already there
  onEdit={handleEditClick}
  onUseItem={handleUseItemClick}
  onRestock={handleRestockClick}
  onRefresh={loadInventory}
/>
        )}
      </div>

      {/* Modals */}
      <ItemDetailModal
        item={selectedItem}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onEdit={() => {
          setDetailModalOpen(false);
          handleEditClick(selectedItem!);
        }}
        onUseItem={() => {
          setDetailModalOpen(false);
          handleUseItemClick(selectedItem!);
        }}
        onRestock={() => {
          setDetailModalOpen(false);
          handleRestockClick(selectedItem!);
        }}
      />

      <ItemFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        item={editingItem}
        onSuccess={handleFormSuccess}
      />

      <UseItemModal
        item={selectedItem}
        open={useItemModalOpen}
        onOpenChange={setUseItemModalOpen}
        onSuccess={handleFormSuccess}
      />

      <RestockModal
        item={selectedItem}
        open={restockModalOpen}
        onOpenChange={setRestockModalOpen}
        onSuccess={handleFormSuccess}
      />

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        data={inventory}
      />
    </div>
  );
}