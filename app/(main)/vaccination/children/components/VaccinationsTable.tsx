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
import { VaccinationEnfant } from "../types";
import { deleteVaccinationEnfant } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface VaccinationsTableProps {
  data: VaccinationEnfant[];
  onRowClick: (vaccination: VaccinationEnfant) => void;
  onEdit: (vaccination: VaccinationEnfant) => void;
  onRefresh: () => void;
}

export const columns = (
  onEdit: (vaccination: VaccinationEnfant) => void,
  onRefresh: () => void
): ColumnDef<VaccinationEnfant>[] => [
  {
    accessorKey: "name",
    header: "Enfant",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name || "Non renseigné"}</div>;
    },
  },
  {
    accessorKey: "age",
    header: "Âge (mois)",
    cell: ({ row }) => {
      const age = row.getValue("age") as number;
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
    accessorKey: "strategy",
    header: "Stratégie",
    cell: ({ row }) => {
      const strategy = row.getValue("strategy") as string;
      return (
        <Badge variant="outline" className="capitalize">
          {strategy ? strategy.replace("_", " ") : "—"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "receivedVitamineA",
    header: "Vitamine A",
    cell: ({ row }) => {
      const received = row.getValue("receivedVitamineA") as boolean;
      return received ? (
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      ) : (
        <XCircle className="h-5 w-5 text-gray-300" />
      );
    },
  },
  {
    accessorKey: "receivedAlBendazole",
    header: "AlBendazole",
    cell: ({ row }) => {
      const received = row.getValue("receivedAlBendazole") as boolean;
      return received ? (
        <CheckCircle className="h-5 w-5 text-emerald-500" />
      ) : (
        <XCircle className="h-5 w-5 text-gray-300" />
      );
    },
  },
  {
    accessorKey: "vaccinesCompleted",
    header: "Vaccins Complets",
    cell: ({ row }) => {
      const vaccination = row.original;
      const vaccines = [
        vaccination.BCG,
        vaccination.TD0,
        vaccination.TD1,
        vaccination.TD2,
        vaccination.TD3,
        vaccination.VP1,
        vaccination.Penta1,
        vaccination.Penta2,
        vaccination.Penta3,
        vaccination.RR1,
        vaccination.RR2,
        vaccination.ECV,
      ];

      const completedCount = vaccines.filter((v) => v === "fait").length;
      const totalCount = vaccines.filter((v) => v).length;

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {completedCount}/{totalCount}
          </span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${(completedCount / 12) * 100}%` }}
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
              vaccination.name || "cet enfant"
            } ?`
          )
        ) {
          try {
            await deleteVaccinationEnfant(vaccination.id);
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
              <Link href={`/vaccination/children/${vaccination.id}`}>
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
                    router.push(`/vaccination/children/${row.original.id}`)
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
