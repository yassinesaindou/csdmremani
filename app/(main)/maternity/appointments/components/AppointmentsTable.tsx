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
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import { MaternityAppointment, getDisplayStatus, getStatusConfig } from "../types";
import { deleteAppointment } from "../actions";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AppointmentsTableProps {
  data: MaternityAppointment[];
  onRowClick: (appointment: MaternityAppointment) => void;
  onEdit: (appointment: MaternityAppointment) => void;
  onRefresh: () => void;
}

export const columns = (
  onEdit: (appointment: MaternityAppointment) => void,
  onRefresh: () => void,
  onPatientClick: (appointment: MaternityAppointment) => void
): ColumnDef<MaternityAppointment>[] => [
  {
    accessorKey: "appointmentId",
    header: "ID",
    cell: ({ row }) => {
      const id = row.getValue("appointmentId") as number;
      return <div className="font-mono text-sm">#{id}</div>;
    },
  },
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => {
      const appointment = row.original;
      const name = row.getValue("patientName") as string;
      return (
        <div 
          className="font-medium cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onPatientClick(appointment);
          }}
        >
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" />
            {name || "Non renseigné"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "patientPhoneNumber",
    header: "Téléphone",
    cell: ({ row }) => {
      const appointment = row.original;
      const phone = row.getValue("patientPhoneNumber") as string;
      return (
        <div 
          className="flex items-center gap-2 text-sm cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onPatientClick(appointment);
          }}
        >
          <Phone className="h-3 w-3" />
          {phone || "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "appointmentReason",
    header: "Motif",
    cell: ({ row }) => {
      const reason = row.getValue("appointmentReason") as string;
      return (
        <div className="max-w-xs truncate text-sm" title={reason || ""}>
          {reason || "—"}
        </div>
      );
    },
  },
 {
  accessorKey: "appointmentDate",
  header: "Date et Heure",
  cell: ({ row }) => {
    const appointment = row.original;
    const dateStr = row.getValue("appointmentDate") as string;
    if (!dateStr) return <span className="text-gray-400">—</span>;

    // Convert UTC to Comoros time
    const utcDate = new Date(dateStr);
    const comorosDate = new Date(utcDate.getTime() + (3 * 60 * 60 * 1000));
    
    const now = new Date();
    const isPast = comorosDate < now;

    return (
      <div
        className={`space-y-1 ${isPast ? "text-gray-500" : "text-gray-900"}`}>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="font-medium">
            {format(comorosDate, "dd/MM/yyyy", { locale: fr })}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          <span>{format(comorosDate, "HH:mm", { locale: fr })}</span>
          <span className="text-gray-400 text-[10px]">(GMT+3)</span>
        </div>
      </div>
    );
  },
},
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const appointment = row.original;
      const displayStatus = getDisplayStatus(appointment);
      const statusConfig = getStatusConfig(displayStatus);

      // Calculate days passed for missed appointments
      const appointmentDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : null;
      const now = new Date();
      let daysInfo = "";
      
      if (displayStatus === 'missed' && appointmentDate) {
        const daysPassed = Math.floor((now.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24));
        daysInfo = ` (${daysPassed} jour${daysPassed > 1 ? 's' : ''})`;
      }

      return (
        <Badge className={`${statusConfig.color} border-0`} title={displayStatus === 'missed' ? 'Rendez-vous manqué' : ''}>
          {statusConfig.label}
          {daysInfo}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;

      const handleDelete = async () => {
        if (
          confirm(
            `Êtes-vous sûr de vouloir supprimer le rendez-vous #${appointment.appointmentId} ?`
          )
        ) {
          try {
            await deleteAppointment(appointment.appointmentId);
            onRefresh();
          } catch (error) {
            console.error("Error deleting appointment:", error);
            alert("Erreur lors de la suppression");
          }
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click
              }}
            >
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(appointment)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // Navigate to detail page in same window
                window.location.href = `/maternity/appointments/${appointment.appointmentId}`;
              }}>
              <Eye className="mr-2 h-4 w-4" />
              Voir détails
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

export function AppointmentsTable({
  data,
  onRowClick,
  onEdit,
  onRefresh,
}: AppointmentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "appointmentDate", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const router = useRouter();

  const handlePatientClick = (appointment: MaternityAppointment) => {
    onRowClick(appointment);
  };

  const table = useReactTable({
    data,
    columns: columns(onEdit, onRefresh, handlePatientClick),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange:setGlobalFilter,
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
                  className="hover:bg-gray-50" // Remove cursor-pointer
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
                  Aucun rendez-vous trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {table.getFilteredRowModel().rows.length} rendez-vous
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