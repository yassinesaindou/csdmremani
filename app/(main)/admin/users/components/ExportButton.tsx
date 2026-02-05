"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { UserProfile } from "../types/user";
import * as XLSX from "xlsx";

interface ExportButtonProps {
  users: UserProfile[];
}

export function ExportButton({ users }: ExportButtonProps) {
  const handleExport = () => {
    // Prepare data for export
    const data = users.map(user => ({
      "Nom Complet": user.fullName || "",
      "Email": user.email || "",
      "Téléphone": user.phoneNumber || "",
      "Rôle": user.role || "",
      "Département": user.department?.departementName || user.branch || "",
      "Statut": user.isActive ? "Actif" : "Inactif",
      "Date de Création": new Date(user.createdAt).toLocaleDateString("fr-FR"),
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const wscols = [
      { wch: 25 }, // Nom Complet
      { wch: 30 }, // Email
      { wch: 15 }, // Téléphone
      { wch: 20 }, // Rôle
      { wch: 20 }, // Département
      { wch: 10 }, // Statut
      { wch: 15 }, // Date de Création
    ];
    ws["!cols"] = wscols;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Utilisateurs");
    
    // Generate Excel file
    const fileName = `utilisateurs_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport}
      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200"
    >
      <Download className="mr-2 h-4 w-4" />
      Exporter Excel
    </Button>
  );
}