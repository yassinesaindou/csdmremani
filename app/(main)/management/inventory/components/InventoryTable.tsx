/* eslint-disable react/no-unescaped-entities */
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
  MoreHorizontal,
  Package,
  PackageMinus,
  PackagePlus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { InventoryItem } from "../types";
import { deleteInventoryItem } from "../actions";

interface InventoryTableProps {
  data: InventoryItem[];
  onRowClick: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onUseItem: (item: InventoryItem) => void;
  onRestock: (item: InventoryItem) => void;
  onRefresh: () => void;
}

export const columns = (
  onRowClick: (item: InventoryItem) => void,
  onEdit: (item: InventoryItem) => void,
  onUseItem: (item: InventoryItem) => void,
  onRestock: (item: InventoryItem) => void,
  onRefresh: () => void
): ColumnDef<InventoryItem>[] => [
  {
    accessorKey: "itemName",
    header: "Article",
    cell: ({ row }) => {
      const name = row.getValue("itemName") as string;
      const item = row.original;
      return (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <div 
            className="font-medium cursor-pointer hover:text-blue-600 hover:underline"
            onClick={() => onRowClick(item)}
          >
            {name || "Non nommé"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantité en Stock",
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number;
      const usedQuantity = row.original.usedQuantity || 0;
      const total = (quantity || 0) + usedQuantity;
      const item = row.original;
      
      return (
        <div 
          className="space-y-1 cursor-pointer"
          onClick={() => onRowClick(item)}
        >
          <div className="flex items-center gap-2">
            <Badge 
              variant={quantity && quantity < 10 ? "destructive" : "default"}
              className="font-mono cursor-pointer hover:opacity-80"
            >
              {quantity?.toFixed(2) || "0.00"}
            </Badge>
            {quantity !== null && (
              <span className="text-xs text-gray-500">
                {total > 0 ? `${((quantity / total) * 100).toFixed(1)}%` : "100%"}
              </span>
            )}
          </div>
          {quantity !== null && quantity < 10 && (
            <div className="text-xs text-rose-600 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Stock faible
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "usedQuantity",
    header: "Quantité Utilisée",
    cell: ({ row }) => {
      const usedQuantity = row.getValue("usedQuantity") as number;
      const quantity = row.original.quantity || 0;
      const total = (quantity || 0) + (usedQuantity || 0);
      const item = row.original;
      
      return (
        <div 
          className="space-y-1 cursor-pointer"
          onClick={() => onRowClick(item)}
        >
          <Badge 
            variant="outline" 
            className="font-mono cursor-pointer hover:opacity-80"
          >
            {usedQuantity?.toFixed(2) || "0.00"}
          </Badge>
          {total > 0 && (
            <div className="text-xs text-gray-500">
              {total > 0 ? `${((usedQuantity / total) * 100).toFixed(1)}%` : "0%"}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ajouté le",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const item = row.original;
      return (
        <div 
          className="text-sm cursor-pointer"
          onClick={() => onRowClick(item)}
        >
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
      const item = row.original;

      const handleDelete = async () => {
        if (
          confirm(
            `Êtes-vous sûr de vouloir supprimer "${item.itemName}" de l'inventaire ?`
          )
        ) {
          try {
            await deleteInventoryItem(item.itemId);
            onRefresh();
          } catch (error) {
            console.error("Error deleting inventory item:", error);
            alert("Erreur lors de la suppression");
          }
        }
      };

      return (
        <div className="text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUseItem(item)}>
                <PackageMinus className="mr-2 h-4 w-4" />
                Utiliser du stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRestock(item)}>
                <PackagePlus className="mr-2 h-4 w-4" />
                Réapprovisionner
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
        </div>
      );
    },
  },
];

export function InventoryTable({
  data,
  onRowClick,
  onEdit,
  onUseItem,
  onRestock,
  onRefresh,
}: InventoryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "quantity", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns: columns(onRowClick, onEdit, onUseItem, onRestock, onRefresh),
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
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={cell.column.id === 'actions' ? '' : 'cursor-default'}
                    >
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
                  Aucun article dans l'inventaire.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {table.getFilteredRowModel().rows.length} article(s)
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