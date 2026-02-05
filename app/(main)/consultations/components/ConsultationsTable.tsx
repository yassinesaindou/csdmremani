// app/consultations/components/ConsultationsTable.tsx
'use client'

import { useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table'
import { Consultation } from '../types/consultation'
import TableFilters from './TableFilters'
import TablePagination from './TablePagination'
import ConsultationDetailsModal from './ConsultationDetailsModal'
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, Download, Stethoscope } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ConsultationsTableProps {
  consultations: Consultation[]
  onSearch: (searchTerm: string) => void
  isLoading: boolean
  userRole: 'admin' | 'doctor' | null
  userId: string | null
}

const columnHelper = createColumnHelper<Consultation>()

export default function ConsultationsTable({
  consultations,
  onSearch,
  isLoading,
  userRole,
  userId
}: ConsultationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const columns = [
    columnHelper.accessor('patientName', {
      header: 'Patient',
      cell: info => (
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            info.row.original.sexe === 'male' 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-pink-100 text-pink-600'
          }`}>
            <span className="text-sm font-semibold">
              {info.getValue()[0]}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-xs text-gray-500">
              {info.row.original.age || 'N/A'} ans
            </div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('sexe', {
      header: 'Sexe',
      cell: info => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          info.getValue() === 'male' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-pink-100 text-pink-800'
        }`}>
          {info.getValue() === 'male' ? 'Homme' : 'Femme'}
        </span>
      ),
    }),
    columnHelper.accessor('diagnostics', {
      header: 'Diagnostic',
      cell: info => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate" title={info.getValue()}>
            {info.getValue() || 'Non spécifié'}
          </div>
          {info.row.original.dominantSigns && (
            <div className="text-xs text-gray-500 truncate" title={info.row.original.dominantSigns}>
              {info.row.original.dominantSigns}
            </div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Date',
      cell: info => {
        const date = new Date(info.getValue())
        return (
          <div>
            <div className="font-medium text-gray-900">
              {date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
            <div className="text-xs text-gray-500">
              {date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )
      },
    }),
    ...(userRole === 'admin' ? [columnHelper.accessor('doctorName', {
      header: 'Médecin',
      cell: info => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-indigo-600">
              {info.getValue()[0]}
            </span>
          </div>
          <span className="text-gray-900">{info.getValue()}</span>
        </div>
      ),
    })] : []),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setSelectedConsultation(row.original)
            setIsModalOpen(true)
          }}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
          title="Voir détails"
        >
          <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
        </button>
      ),
    }),
  ]

  const table = useReactTable({
    data: consultations,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const handleExportExcel = () => {
    const worksheetData = consultations.map(consultation => ({
      Patient: consultation.patientName,
      Âge: consultation.age || '',
      Sexe: consultation.sexe === 'male' ? 'Homme' : 'Femme',
      Diagnostic: consultation.diagnostics || '',
      'Signes dominants': consultation.dominantSigns || '',
      Traitement: consultation.treatment || '',
      Origine: consultation.origin || '',
      'Enceinte': consultation.isPregnant ? 'Oui' : 'Non',
      Médecin: consultation.doctorName,
      Date: new Date(consultation.createdAt).toLocaleDateString('fr-FR'),
      Heure: new Date(consultation.createdAt).toLocaleTimeString('fr-FR')
    }))

    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consultations')
    
    // Auto-size columns
    const maxWidth = worksheetData.reduce((w, r) => Math.max(w, r.Patient.length), 10)
    worksheet['!cols'] = [{ wch: maxWidth }]
    
    // Generate Excel file
    XLSX.writeFile(workbook, `consultations_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleExportCSV = () => {
    const headers = ['Patient', 'Âge', 'Sexe', 'Diagnostic', 'Signes dominants', 'Traitement', 'Origine', 'Enceinte', 'Médecin', 'Date', 'Heure']
    const csvData = consultations.map(consultation => [
      consultation.patientName,
      consultation.age || '',
      consultation.sexe === 'male' ? 'Homme' : 'Femme',
      consultation.diagnostics || '',
      consultation.dominantSigns || '',
      consultation.treatment || '',
      consultation.origin || '',
      consultation.isPregnant ? 'Oui' : 'Non',
      consultation.doctorName,
      new Date(consultation.createdAt).toLocaleDateString('fr-FR'),
      new Date(consultation.createdAt).toLocaleTimeString('fr-FR')
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `consultations_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <TableFilters
        onSearch={onSearch}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        userRole={userRole}
      />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUp className="h-4 w-4" />,
                        desc: <ChevronDown className="h-4 w-4" />,
                      }[header.column.getIsSorted() as string] ?? (
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setSelectedConsultation(row.original)
                    setIsModalOpen(true)
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Stethoscope className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-2">Aucune consultation trouvée</p>
                    <p className="text-sm">
                      {isLoading ? 'Chargement des données...' : 'Commencez par ajouter une nouvelle consultation'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination table={table} />

      {selectedConsultation && (
        <ConsultationDetailsModal
          consultation={selectedConsultation}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedConsultation(null)
          }}
          userRole={userRole}
          userId={userId}
        />
      )}
    </>
  )
}