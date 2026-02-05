"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, XCircle, AlertTriangle, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { MaternityHospitalization } from "../types";
import { deleteHospitalization } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HospitalizationsTableProps {
  data: MaternityHospitalization[];
  onRowClick: (hospitalization: MaternityHospitalization) => void;
  onEdit: (hospitalization: MaternityHospitalization) => void;
  onRefresh: () => void;
}

export const columns = (onEdit: (hospitalization: MaternityHospitalization) => void, onRefresh: () => void): ColumnDef<MaternityHospitalization>[] => [
  {
    accessorKey: "fullName",
    header: "Patient",
    cell: ({ row }) => {
      const name = row.getValue("fullName") as string;
      return <div className="font-medium">{name || "Non renseigné"}</div>;
    },
  },
  {
    accessorKey: "age",
    header: "Âge",
    cell: ({ row }) => {
      const age = row.getValue("age") as string;
      return <div className="text-sm">{age || "—"}</div>;
    },
  },
  {
    accessorKey: "sex",
    header: "Sexe",
    cell: ({ row }) => {
      const sex = row.getValue("sex") as string;
      return (
        <Badge variant="outline">
          {sex === 'M' ? 'M' : sex === 'F' ? 'F' : '—'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "origin",
    header: "Origine",
    cell: ({ row }) => {
      const origin = row.getValue("origin") as string;
      return <Badge variant="outline">{origin || "—"}</Badge>;
    },
  },
  {
    accessorKey: "isEmergency",
    header: "Urgence",
    cell: ({ row }) => {
      const isEmergency = row.getValue("isEmergency") as boolean;
      return isEmergency ? (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Urgence
        </Badge>
      ) : (
        <Badge variant="outline">Normale</Badge>
      );
    },
  },
  {
    accessorKey: "isPregnant",
    header: "Enceinte",
    cell: ({ row }) => {
      const isPregnant = row.getValue("isPregnant") as boolean;
      return isPregnant ? (
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      ) : (
        <XCircle className="h-5 w-5 text-gray-400" />
      );
    },
  },
  {
    accessorKey: "entryDiagnostic",
    header: "Diag. Entrée",
    cell: ({ row }) => {
      const diagnostic = row.getValue("entryDiagnostic") as string;
      return (
        <div className="max-w-xs">
          {diagnostic ? (
            <span className="text-sm truncate">{diagnostic}</span>
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          )}
        </div>
      );
    },
  },
  {
    id: "leaveStatus",
    header: "Statut Sortie",
    cell: ({ row }) => {
      const hospitalization = row.original;
      
      if (hospitalization.leave_authorized) {
        return <Badge className="bg-emerald-100 text-emerald-800">Autorisée</Badge>;
      }
      if (hospitalization.leave_evaded) {
        return <Badge className="bg-amber-100 text-amber-800">Évasion</Badge>;
      }
      if (hospitalization.leave_transfered) {
        return <Badge className="bg-blue-100 text-blue-800">Transfert</Badge>;
      }
      if (hospitalization.leave_diedBefore48h) {
        return <Badge className="bg-rose-100 text-rose-800">Décès &lt; 48h</Badge>;
      }
      if (hospitalization.leave_diedAfter48h) {
        return <Badge className="bg-rose-100 text-rose-800">Décès &gt; 48h</Badge>;
      }
      return <Badge variant="outline">En cours</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date Admission",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm">
          {date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const hospitalization = row.original;
      
      const handleDelete = async () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'hospitalisation de ${hospitalization.fullName || "ce patient"} ?`)) {
          try {
            const result = await deleteHospitalization(hospitalization.hospitalizationId);
            if (result.success) {
              onRefresh();
            } else {
              alert(result.error || "Erreur lors de la suppression");
            }
          } catch (error) {
            console.error("Error deleting hospitalization:", error);
            alert("Erreur lors de la suppression");
          }
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(hospitalization)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => row.toggleSelected()}>
              <Eye className="mr-2 h-4 w-4" />
              Voir détails
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-rose-600 focus:text-rose-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function HospitalizationsTable({ 
  data, 
  onRowClick, 
  onEdit,
  onRefresh 
}: HospitalizationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const router = useRouter();

  const table = useReactTable({
    data,
    columns: columns(onEdit, onRefresh),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/maternity/hospitalizations/${row.original.hospitalizationId}`)}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucune hospitalisation trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {table.getFilteredRowModel().rows.length} hospitalisation(s)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <span className="text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} sur{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}