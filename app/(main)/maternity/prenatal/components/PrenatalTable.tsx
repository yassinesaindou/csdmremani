"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    Calendar,
    CheckCircle,
    Eye,
    MoreHorizontal,
    Pencil,
    Trash2,
    XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePrenatalRecord } from "../actions";
import { PrenatalRecord } from "../types";

interface PrenatalTableProps {
  data: PrenatalRecord[];
  onRowClick: (record: PrenatalRecord) => void;
  onEdit: (record: PrenatalRecord) => void;
  onRefresh: () => void;
}

export const columns = (
  onEdit: (record: PrenatalRecord) => void,
  onRefresh: () => void
): ColumnDef<PrenatalRecord>[] => [
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
    accessorKey: "patientAge",
    header: "Âge",
    cell: ({ row }) => {
      const age = row.getValue("patientAge") as string;
      return <div className="text-sm">{age || "—"}</div>;
    },
  },
  {
    accessorKey: "pregnancyAge",
    header: "Âge grossesse",
    cell: ({ row }) => {
      const pregnancyAge = row.getValue("pregnancyAge") as string;
      return (
        <div className="text-sm">
          {pregnancyAge ? `${pregnancyAge} sem` : "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "visitCPN1",
    header: "CPN1",
    cell: ({ row }) => {
      const visit = row.getValue("visitCPN1") as string;
      return visit ? (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Calendar className="mr-1 h-3 w-3" />
          Oui
        </Badge>
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
  },
  {
    accessorKey: "visitCPN4",
    header: "CPN4",
    cell: ({ row }) => {
      const visit = row.getValue("visitCPN4") as string;
      return visit ? (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          <Calendar className="mr-1 h-3 w-3" />
          Oui
        </Badge>
      ) : (
        <span className="text-gray-400">—</span>
      );
    },
  },
  {
    accessorKey: "anemy",
    header: "Anémie",
    cell: ({ row }) => {
      const anemy = row.getValue("anemy") as string;
      if (!anemy || anemy === "none") return <span className="text-gray-400">—</span>;
      
      const severityColor = {
        mild: "bg-yellow-100 text-yellow-800",
        moderate: "bg-orange-100 text-orange-800",
        severe: "bg-red-100 text-red-800",
      }[anemy] || "bg-gray-100 text-gray-800";
      
      const severityLabel = {
        mild: "Légère",
        moderate: "Modérée",
        severe: "Sévère",
      }[anemy] || anemy;
      
      return (
        <Badge className={severityColor}>
          {severityLabel}
        </Badge>
      );
    },
  },
  {
    accessorKey: "iron_folicAcidDose3",
    header: "Fer Dose 3",
    cell: ({ row }) => {
      const dose3 = row.getValue("iron_folicAcidDose3") as boolean;
      return dose3 ? (
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      ) : (
        <XCircle className="h-5 w-5 text-gray-300" />
      );
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
            `Êtes-vous sûr de vouloir supprimer la consultation prénatale de ${
              record.fullName || "cette patiente"
            } ?`
          )
        ) {
          try {
            await deletePrenatalRecord(record.id);
            onRefresh();
          } catch (error) {
            console.error("Error deleting prenatal record:", error);
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
            <DropdownMenuItem onClick={() => window.open(`/maternity/prenatal/${record.id}`, '_blank')}>
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

export function PrenatalTable({
  data,
  onRowClick,
  onEdit,
  onRefresh,
}: PrenatalTableProps) {
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
  onClick={() => router.push(`/maternity/prenatal/${row.original.id}`)}
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
                  Aucune consultation prénatale trouvée.
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