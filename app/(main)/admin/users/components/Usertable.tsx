"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile, ROLES, STATUS_COLORS } from "../types/user";
import { MoreHorizontal, Eye, UserX, UserCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toggleUserStatus } from "../actions/users";

interface UserTableProps {
  users: UserProfile[];
}

export const columns: ColumnDef<UserProfile>[] = [
  {
    accessorKey: "fullName",
    header: "Nom Complet",
    cell: ({ row }) => {
      const name = row.getValue("fullName") as string;
      return <div className="font-medium">{name || "Non renseigné"}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return <div className="text-sm text-gray-600">{email}</div>;
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Téléphone",
    cell: ({ row }) => {
      const phone = row.getValue("phoneNumber") as string;
      return <div className="text-sm">{phone || "—"}</div>;
    },
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleConfig = ROLES.find(r => r.value === role);
      return (
        <Badge 
          className={`${roleConfig?.color || "bg-gray-100 text-gray-800"} text-white border-0`}
        >
          {roleConfig?.label || role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "department",
    header: "Département",
    cell: ({ row }) => {
      const department = row.original.department;
      const deptName = department?.departementName || row.original.branch;
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {deptName || "—"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Statut",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge className={`${STATUS_COLORS[isActive.toString() as keyof typeof STATUS_COLORS]} text-white border-0`}>
          {isActive ? "Actif" : "Inactif"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date de Création",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm text-gray-500">
          {date.toLocaleDateString("fr-FR")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      const handleToggleStatus = async () => {
        if (confirm(`Voulez-vous vraiment ${user.isActive ? "désactiver" : "activer"} cet utilisateur ?`)) {
          try {
            await toggleUserStatus(user.userId, user.isActive || false);
            window.location.reload();
          } catch (error) {
            console.error("Error toggling user status:", error);
            alert("Erreur lors de la modification du statut");
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
              <Link href={`/admin/users/${user.userId}`} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggleStatus} className="cursor-pointer">
              {user.isActive ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  <span className="text-rose-600">Désactiver</span>
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  <span className="text-emerald-600">Activer</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UserTable({ users }: UserTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: users,
    columns,
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {table.getFilteredRowModel().rows.length} utilisateur(s)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-gray-200"
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
            className="border-gray-200"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}