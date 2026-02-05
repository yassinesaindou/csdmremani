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
  Eye,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { ReceiptWithDetails } from "../types";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ReceiptsTableProps {
  data: ReceiptWithDetails[];
  onRowClick: (receipt: ReceiptWithDetails) => void;
  onMarkAsExecuted: (receipt: ReceiptWithDetails) => void;
  onRefresh: () => void;
  canMarkAsExecuted: (receipt: ReceiptWithDetails) => boolean;
  userPermissionLevel: string;
}

export const columns = (
  onMarkAsExecuted: (receipt: ReceiptWithDetails) => void,
  canMarkAsExecuted: (receipt: ReceiptWithDetails) => boolean,
  userPermissionLevel: string
): ColumnDef<ReceiptWithDetails>[] => [
  {
    accessorKey: "reason",
    header: "Motif",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string;
      return <div className="font-medium">{reason || "Non spécifié"}</div>;
    },
  },
  {
    accessorKey: "department_name",
    header: "Département",
    cell: ({ row }) => {
      const departmentName = row.getValue("department_name") as string;
      return (
        <Badge variant="secondary">
          {departmentName || "Non spécifié"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "transaction_amount",
    header: "Montant",
    cell: ({ row }) => {
      const amount = row.getValue("transaction_amount") as number;
      const type = row.original.transaction_type;
      return (
        <div className={`font-bold ${type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {amount?.toLocaleString('fr-FR') || "0"} KMF
          <div className="text-xs text-gray-500">
            {type === 'income' ? (
              <span className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Recette
              </span>
            ) : (
              <span className="flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                Dépense
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date création",
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
      const receipt = row.original;
      const canExecute = canMarkAsExecuted(receipt);

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
            <DropdownMenuItem asChild>
              <Link href={`/receipts/${receipt.receiptId}`}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            {canExecute && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onMarkAsExecuted(receipt)}
                  className="text-emerald-600 focus:text-emerald-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marquer comme exécuté
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ReceiptsTable({
  data,
  onRowClick,
  onMarkAsExecuted,
  onRefresh,
  canMarkAsExecuted,
  userPermissionLevel,
}: ReceiptsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const router = useRouter();

  const table = useReactTable({
    data,
    columns: columns(onMarkAsExecuted, canMarkAsExecuted, userPermissionLevel),
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
                      `/receipts/${row.original.receiptId}`
                    )
                  }
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
                  {userPermissionLevel === 'admin' || userPermissionLevel === 'management'
                    ? "Aucun reçu trouvé."
                    : "Aucun reçu trouvé pour vos départements."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {table.getFilteredRowModel().rows.length} reçu(s)
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