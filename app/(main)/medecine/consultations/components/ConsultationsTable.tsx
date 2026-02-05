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
import {
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { MedecineConsultation } from "../types";
import { deleteConsultation } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ConsultationsTableProps {
  data: MedecineConsultation[];
  onRowClick: (consultation: MedecineConsultation) => void;
  onEdit: (consultation: MedecineConsultation) => void;
  onRefresh: () => void;
}

export const columns = (
  onEdit: (consultation: MedecineConsultation) => void,
  onRefresh: () => void
): ColumnDef<MedecineConsultation>[] => [
  {
    accessorKey: "name",
    header: "Patient",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
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
          {sex === "M" ? "M" : sex === "F" ? "F" : "—"}
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
    accessorKey: "isNewCase",
    header: "Nouveau Cas",
    cell: ({ row }) => {
      const isNewCase = row.getValue("isNewCase") as boolean;
      return isNewCase ? (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Nouveau
        </Badge>
      ) : (
        <Badge variant="outline">Suivi</Badge>
      );
    },
  },
  {
    accessorKey: "seenByDoctor",
    header: "Vu par Docteur",
    cell: ({ row }) => {
      const seen = row.getValue("seenByDoctor") as boolean;
      return seen ? (
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      ) : (
        <XCircle className="h-5 w-5 text-rose-500" />
      );
    },
  },
  {
    accessorKey: "diagnostic",
    header: "Diagnostics",
    cell: ({ row }) => {
      const diagnostic = row.getValue("diagnostic") as string;
      const diagnostics = diagnostic
        ? diagnostic.split(",").map((d) => d.trim())
        : [];

      return (
        <div className="max-w-xs">
          {diagnostics.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {diagnostics.slice(0, 2).map((diag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {diag}
                </Badge>
              ))}
              {diagnostics.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{diagnostics.length - 2}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date Consultation",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm">
          {date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
          <div className="text-xs text-gray-500">
            {date.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const consultation = row.original;

      const handleDelete = async () => {
        if (
          confirm(
            `Êtes-vous sûr de vouloir supprimer la consultation de ${
              consultation.name || "ce patient"
            } ?`
          )
        ) {
          try {
            await deleteConsultation(consultation.consultationid);
            onRefresh();
          } catch (error) {
            console.error("Error deleting consultation:", error);
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
            <DropdownMenuItem onClick={() => onEdit(consultation)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/medecine/consultations/${consultation.consultationid}`}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-rose-600 focus:text-rose-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ConsultationsTable({
  data,
  onRowClick,
  onEdit,
  onRefresh,
}: ConsultationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
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
                  onClick={() =>
                    router.push(
                      `/medecine/consultations/${row.original.consultationid}`
                    )
                  }
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  Aucune consultation trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {table.getFilteredRowModel().rows.length} consultation(s)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
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
            disabled={!table.getCanNextPage()}>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}