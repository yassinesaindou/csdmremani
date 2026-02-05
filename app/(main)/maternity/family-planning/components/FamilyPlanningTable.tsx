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
  UserCheck,
  UserX,
} from "lucide-react";
import { FamilyPlanningRecord } from "../types";
import { deleteFamilyPlanningRecord } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FamilyPlanningTableProps {
  data: FamilyPlanningRecord[];
  onRowClick: (record: FamilyPlanningRecord) => void;
  onEdit: (record: FamilyPlanningRecord) => void;
  onRefresh: () => void;
}

export const columns = (
  onEdit: (record: FamilyPlanningRecord) => void,
  onRefresh: () => void
): ColumnDef<FamilyPlanningRecord>[] => [
  {
    accessorKey: "fileNumber",
    header: "Dossier",
    cell: ({ row }) => {
      const fileNumber = row.getValue("fileNumber") as string;
      return <div className="font-medium">{fileNumber || "—"}</div>;
    },
  },
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
    accessorKey: "origin",
    header: "Origine",
    cell: ({ row }) => {
      const origin = row.getValue("origin") as string;
      return <Badge variant="outline">{origin || "—"}</Badge>;
    },
  },
  {
    accessorKey: "isNew",
    header: "Type",
    cell: ({ row }) => {
      const isNew = row.getValue("isNew") as boolean;
      return isNew ? (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Nouvelle
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Renouvellement
        </Badge>
      );
    },
  },
  {
    accessorKey: "new_microgynon",
    header: "Microgynon",
    cell: ({ row }) => {
      const isNew = row.original.isNew;
      const newCount = row.original.new_microgynon;
      const renewalCount = row.original.renewal_microgynon;
      
      if (isNew && newCount) {
        return <Badge variant="secondary">{newCount}</Badge>;
      } else if (!isNew && renewalCount) {
        return <Badge variant="outline">{renewalCount}</Badge>;
      }
      return <span className="text-gray-400">—</span>;
    },
  },
  {
    accessorKey: "new_maleCondom",
    header: "Préservatifs",
    cell: ({ row }) => {
      const isNew = row.original.isNew;
      const maleCount = isNew ? row.original.new_maleCondom : row.original.renewal_maleCondom;
      const femaleCount = isNew ? row.original.new_femaleCondom : row.original.renewal_femaleCondom;
      
      const total = (maleCount || 0) + (femaleCount || 0);
      return total > 0 ? <Badge variant="secondary">{total}</Badge> : <span className="text-gray-400">—</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
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
      const record = row.original;

      const handleDelete = async () => {
        if (
          confirm(
            `Êtes-vous sûr de vouloir supprimer la consultation de ${
              record.fullName || "ce patient"
            } ?`
          )
        ) {
          try {
            await deleteFamilyPlanningRecord(record.id);
            onRefresh();
          } catch (error) {
            console.error("Error deleting family planning record:", error);
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
            <DropdownMenuItem onClick={() => onEdit(record)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/maternity/family-planning/${record.id}`, '_blank')}>
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

export function FamilyPlanningTable({
  data,
  onRowClick,
  onEdit,
  onRefresh,
}: FamilyPlanningTableProps) {
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
  onClick={() => router.push(`/maternity/family-planning/${row.original.id}`)}
  data-state={row.getIsSelected() && "selected"}
>
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
                  className="h-24 text-center"
                >
                  Aucune consultation de planning familial trouvée.
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