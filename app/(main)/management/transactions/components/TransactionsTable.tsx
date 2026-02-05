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
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { TransactionWithDepartment } from "../types";
import { deleteTransaction } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TransactionsTableProps {
  data: TransactionWithDepartment[];
  onRowClick: (transaction: TransactionWithDepartment) => void;
  onEdit: (transaction: TransactionWithDepartment) => void;
  onRefresh: () => void;
  canEdit: boolean;
}

export const columns = (
  onEdit: (transaction: TransactionWithDepartment) => void,
  onRefresh: () => void,
  canEdit: boolean
): ColumnDef<TransactionWithDepartment>[] => [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge 
          variant="outline" 
          className={type === 'income' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}
        >
          {type === 'income' ? (
            <>
              <TrendingUp className="mr-1 h-3 w-3" />
              Recette
            </>
          ) : (
            <>
              <TrendingDown className="mr-1 h-3 w-3" />
              Dépense
            </>
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Motif",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string;
      return <div className="font-medium">{reason || "Non spécifié"}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Montant",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const type = row.getValue("type") as string;
      return (
        <div className={`font-bold ${type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {amount?.toLocaleString('fr-FR') || "0"} KMF
        </div>
      );
    },
  },
  {
    accessorKey: "department_name",
    header: "Département",
    cell: ({ row }) => {
      const departmentName = row.getValue("department_name") as string;
      return (
        <Badge variant="secondary">
          {departmentName || "Général"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_by_name",
    header: "Créé par",
    cell: ({ row }) => {
      const createdByName = row.getValue("created_by_name") as string;
      return <div className="text-sm">{createdByName || "Inconnu"}</div>;
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
      const transaction = row.original;

      const handleDelete = async () => {
        if (
          confirm(
            `Êtes-vous sûr de vouloir supprimer cette transaction ?\nMotif: ${transaction.reason || "Sans motif"}\nMontant: ${transaction.amount || "0"} KMF`
          )
        ) {
          try {
            await deleteTransaction(transaction.transactionId);
            onRefresh();
          } catch (error) {
            console.error("Error deleting transaction:", error);
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
            <DropdownMenuItem asChild>
              <Link href={`/management/transactions/${transaction.transactionId}`}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            {canEdit && (
              <>
                <DropdownMenuItem onClick={() => onEdit(transaction)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-rose-600 focus:text-rose-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function TransactionsTable({
  data,
  onRowClick,
  onEdit,
  onRefresh,
  canEdit,
}: TransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const router = useRouter();

  const table = useReactTable({
    data,
    columns: columns(onEdit, onRefresh, canEdit),
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
                      `/management/transactions/${row.original.transactionId}`
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
                  Aucune transaction trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {table.getFilteredRowModel().rows.length} transaction(s)
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