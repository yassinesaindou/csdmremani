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
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { VaccinationFemmeEnceinte } from "../types";
import { deleteVaccinationFemmeEnceinte } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface VaccinationsTableProps {
  data: VaccinationFemmeEnceinte[];
  onRowClick: (vaccination: VaccinationFemmeEnceinte) => void;
  onEdit: (vaccination: VaccinationFemmeEnceinte) => void;
  onRefresh: () => void;
}

export const columns = (
  onEdit: (vaccination: VaccinationFemmeEnceinte) => void,
  onRefresh: () => void
): ColumnDef<VaccinationFemmeEnceinte>[] => [
  {
    accessorKey: "name",
    header: "Patient",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name || "Non renseigné"}</div>;
    },
  },
  {
    accessorKey: "month",
    header: "Mois de grossesse",
    cell: ({ row }) => {
      const month = row.getValue("month") as number;
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          {month ? `${month}ème mois` : "—"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "origin",
    header: "Origine",
    cell: ({ row }) => {
      const origin = row.getValue("origin") as string;
      return <div className="text-sm">{origin || "—"}</div>;
    },
  },
  {
    accessorKey: "strategy",
    header: "Stratégie",
    cell: ({ row }) => {
      const strategy = row.getValue("strategy") as string;
      return (
        <Badge variant="outline" className="capitalize">
          {strategy ? strategy.replace('_', ' ') : "—"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "vaccinesCompleted",
    header: "Vaccins Complets",
    cell: ({ row }) => {
      const vaccination = row.original;
      const vaccines = [
        vaccination.TD1, vaccination.TD2, vaccination.TD3,
        vaccination.TD4, vaccination.TD5, vaccination.FCV
      ];
      
      const completedCount = vaccines.filter(v => v === 'fait').length;
      const totalCount = vaccines.filter(v => v).length;
      
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{completedCount}/6</span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div 
              className="bg-purple-600 h-1.5 rounded-full" 
              style={{ width: `${(completedCount / 6) * 100}%` }}
            />
          </div>
        </div>
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
      const vaccination = row.original;

      const handleDelete = async () => {
        if (
          confirm(
            `Êtes-vous sûr de vouloir supprimer la vaccination de ${
              vaccination.name || "cette patiente"
            } ?`
          )
        ) {
          try {
            await deleteVaccinationFemmeEnceinte(vaccination.id);
            onRefresh();
          } catch (error) {
            console.error("Error deleting vaccination:", error);
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
            <DropdownMenuItem onClick={() => onEdit(vaccination)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/vaccination/pregnant/${vaccination.id}`}>
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

export function VaccinationsTable({
  data,
  onRowClick,
  onEdit,
  onRefresh,
}: VaccinationsTableProps) {
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
                      `/vaccination/pregnant/${row.original.id}`
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
                  Aucune vaccination trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {table.getFilteredRowModel().rows.length} vaccination(s)
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