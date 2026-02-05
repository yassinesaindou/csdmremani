/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserPDFExportProps {
  user: any;
  userDepartments: any[];
}

export function UserPDFExport({ user, userDepartments }: UserPDFExportProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const generatePDF = async () => {
    try {
      setLoading(true);
      
      // Create a simple PDF using HTML and print dialog
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Fiche Utilisateur - ${user.fullName || user.email}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #4f46e5;
              padding-bottom: 20px;
            }
            .hospital-title {
              font-size: 24px;
              color: #4f46e5;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .document-title {
              font-size: 18px;
              color: #666;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #4f46e5;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 150px 1fr;
              gap: 10px;
              margin-top: 10px;
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            .value {
              color: #333;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 500;
            }
            .active { background: #d1fae5; color: #065f46; }
            .inactive { background: #fee2e2; color: #991b1b; }
            .departments {
              margin-top: 10px;
            }
            .department-item {
              background: #f3f4f6;
              padding: 8px 12px;
              border-radius: 6px;
              margin-bottom: 8px;
              border-left: 4px solid #4f46e5;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hospital-title">CSD M'REMANI</div>
            <div class="document-title">Fiche Utilisateur</div>
            <div>Généré le ${new Date().toLocaleDateString('fr-FR')}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Informations Personnelles</div>
            <div class="info-grid">
              <div class="label">Nom complet:</div>
              <div class="value">${user.fullName || "Non renseigné"}</div>
              
              <div class="label">Email:</div>
              <div class="value">${user.email || "Non renseigné"}</div>
              
              <div class="label">Téléphone:</div>
              <div class="value">${user.phoneNumber || "Non renseigné"}</div>
              
              <div class="label">Rôle:</div>
              <div class="value">${user.role || "Non défini"}</div>
              
              <div class="label">Statut:</div>
              <div class="value">
                <span class="badge ${user.isActive ? 'active' : 'inactive'}">
                  ${user.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
              
              <div class="label">Date création:</div>
              <div class="value">${new Date(user.createdAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Affectations Départementales</div>
            <div class="departments">
              ${userDepartments.length > 0 
                ? userDepartments.map(dept => `
                  <div class="department-item">
                    ${dept.departments?.departementName || 'Département'} 
                    (Assigné le ${new Date(dept.createdAt).toLocaleDateString('fr-FR')})
                  </div>
                `).join('')
                : '<div>Aucun département assigné</div>'
              }
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Informations Techniques</div>
            <div class="info-grid">
              <div class="label">ID Utilisateur:</div>
              <div class="value" style="font-size: 11px; word-break: break-all;">${user.userId}</div>
              
              <div class="label">Département (affichage):</div>
              <div class="value">${user.branch || "Non défini"}</div>
            </div>
          </div>
          
          <div class="footer">
            <div>Document généré automatiquement par le système de gestion du CSD M'Rémani </div>
            <div>© ${new Date().getFullYear()} CSD M'Rémani - Tous droits réservés</div>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="
              background: #4f46e5;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              margin-right: 10px;
            ">
              Imprimer maintenant
            </button>
            <button onclick="window.close()" style="
              background: #6b7280;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            ">
              Fermer
            </button>
          </div>
          
          <script>
            // Auto-print when opened
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `;

      // Open print window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
      }

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setLoading(false);
    }
  };

  const exportUserData = async () => {
    try {
      setLoading(true);
      
      // Prepare data for export
      const userData = {
        "Nom Complet": user.fullName || "",
        "Email": user.email || "",
        "Téléphone": user.phoneNumber || "",
        "Rôle": user.role || "",
        "Statut": user.isActive ? "Actif" : "Inactif",
        "Département": user.branch || "",
        "Date de Création": new Date(user.createdAt).toLocaleDateString('fr-FR'),
        "ID Utilisateur": user.userId,
        "Départements Assignés": userDepartments.map(d => 
          `${d.departments?.departementName} (${new Date(d.createdAt).toLocaleDateString('fr-FR')})`
        ).join(', '),
      };

      // Convert to CSV
      const csvContent = Object.entries(userData)
        .map(([key, value]) => `"${key}","${value}"`)
        .join('\n');
      
      const csvHeader = "Propriété,Valeur\n";
      const csvData = csvHeader + csvContent;
      
      // Create and download CSV file
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `utilisateur_${user.fullName || user.email}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Erreur lors de l'export des données");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={generatePDF}
        disabled={loading}
        className="border-gray-300"
      >
        {loading ? (
          "Génération..."
        ) : (
          <>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer PDF
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        onClick={exportUserData}
        disabled={loading}
        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
      >
        <Download className="mr-2 h-4 w-4" />
        Exporter CSV
      </Button>
    </div>
  );
}