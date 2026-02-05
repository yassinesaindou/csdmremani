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
import { Baby, Heart, Scale, MoreHorizontal, Pencil, Trash2, Eye, AlertTriangle } from "lucide-react";
import { MaternityDelivery } from "../types";
import { deleteDelivery } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DeliveriesTableProps {
  data: MaternityDelivery[];
  onRowClick: (delivery: MaternityDelivery) => void;
  onEdit: (delivery: MaternityDelivery) => void;
  onRefresh: () => void;
}

export const columns = (onEdit: (delivery: MaternityDelivery) => void, onRefresh: () => void): ColumnDef<MaternityDelivery>[] => [
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
    header: "Mère",
    cell: ({ row }) => {
      const name = row.getValue("fullName") as string;
      return <div className="font-medium">{name || "Non renseigné"}</div>;
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
    id: "deliveryType",
    header: "Type",
    cell: ({ row }) => {
      const delivery = row.original;
      
      if (delivery.delivery_eutocic) {
        return <Badge className="bg-emerald-100 text-emerald-800">Eutocique</Badge>;
      }
      if (delivery.delivery_dystocic) {
        return <Badge className="bg-amber-100 text-amber-800">Dystocique</Badge>;
      }
      if (delivery.delivery_transfert) {
        return <Badge className="bg-blue-100 text-blue-800">Transfert</Badge>;
      }
      return <Badge variant="outline">—</Badge>;
    },
  },
  {
    id: "newbornInfo",
    header: "Nouveau-né",
    cell: ({ row }) => {
      const delivery = row.original;
      
      return (
        <div className="flex items-center gap-2">
          {delivery.newBorn_living ? (
            <>
              <Baby className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">{delivery.newBorn_living} vivant(s)</span>
            </>
          ) : null}
          
          {delivery.numberOfDeaths ? (
            <>
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="text-sm">{delivery.numberOfDeaths} décès</span>
            </>
          ) : null}
        </div>
      );
    },
  },
  {
    id: "weight",
    header: "Poids",
    cell: ({ row }) => {
      const weight = row.original.weight;
      return weight ? (
        <div className="flex items-center gap-1">
          <Scale className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{weight} kg</span>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">—</span>
      );
    },
  },
  {
    id: "motherStatus",
    header: "Mère",
    cell: ({ row }) => {
      const isMotherDead = row.original.isMotherDead;
      return isMotherDead ? (
        <Badge className="bg-rose-100 text-rose-800">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Décédée
        </Badge>
      ) : (
        <Badge variant="outline">Vivante</Badge>
      );
    },
  },
  {
    accessorKey: "delivery_dateTime",
    header: "Date Accouchement",
    cell: ({ row }) => {
      const date = row.original.delivery_dateTime;
      return date ? (
        <div className="text-sm">
          {format(new Date(date), "dd/MM/yyyy", { locale: fr })}
          <div className="text-xs text-gray-500">
            {format(new Date(date), "HH:mm", { locale: fr })}
          </div>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">—</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const delivery = row.original;
      
      const handleDelete = async () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'accouchement de ${delivery.fullName || "cette mère"} ?`)) {
          try {
            const result = await deleteDelivery(delivery.deliveryId);
            if (result.success) {
              onRefresh();
            } else {
              alert(result.error || "Erreur lors de la suppression");
            }
          } catch (error) {
            console.error("Error deleting delivery:", error);
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
            <DropdownMenuItem onClick={() => onEdit(delivery)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/maternity/deliveries/${delivery.deliveryId}`}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </Link>
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

export function DeliveriesTable({ 
  data, 
  onRowClick, 
  onEdit,
  onRefresh 
}: DeliveriesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "delivery_dateTime", desc: true }
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
                  onClick={() => router.push(`/maternity/deliveries/${row.original.deliveryId}`)}
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
                  Aucun accouchement trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {table.getFilteredRowModel().rows.length} accouchement(s)
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