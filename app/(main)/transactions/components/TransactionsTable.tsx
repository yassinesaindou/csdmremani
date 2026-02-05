// app/transactions/components/TransactionsTable.tsx
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
import { Transaction } from '../types/transaction'
import TableFilters from './TableFilters'
import TablePagination from './TablePagination'
import TransactionDetailsModal from './TransactionDetailsModal'
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import * as XLSX from 'xlsx'

interface TransactionsTableProps {
  transactions: Transaction[]
  onSearch: (searchTerm: string) => void
  isLoading: boolean
  userRole: 'admin' | 'doctor' | null
  userId: string | null
}

const columnHelper = createColumnHelper<Transaction>()

export default function TransactionsTable({
  transactions,
  onSearch,
  isLoading,
  userRole,
  userId
}: TransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const columns = [
    columnHelper.accessor('type', {
      header: 'Type',
      cell: info => (
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            info.getValue() === 'income' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            {info.getValue() === 'income' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
          <span className={`font-medium ${
            info.getValue() === 'income' ? 'text-green-700' : 'text-red-700'
          }`}>
            {info.getValue() === 'income' ? 'Revenu' : 'Dépense'}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('reason', {
      header: 'Raison',
      cell: info => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('amount', {
      header: 'Montant',
      cell: info => {
        const amount = info.getValue()
        const type = info.row.original.type
        return (
          <div className={`font-bold ${
            type === 'income' ? 'text-green-700' : 'text-red-700'
          }`}>
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0
            }).format(amount)}
          </div>
        )
      },
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
      header: 'Responsable',
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
            setSelectedTransaction(row.original)
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
    data: transactions,
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
    const worksheetData = transactions.map(transaction => ({
      Type: transaction.type === 'income' ? 'Revenu' : 'Dépense',
      Raison: transaction.reason,
      Montant: transaction.amount,
      'Montant (€)': new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(transaction.amount),
      Responsable: transaction.doctorName,
      Date: new Date(transaction.createdAt).toLocaleDateString('fr-FR'),
      Heure: new Date(transaction.createdAt).toLocaleTimeString('fr-FR'),
      'Date complète': new Date(transaction.createdAt).toLocaleString('fr-FR')
    }))

    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')
    
    // Auto-size columns
    const maxWidth = worksheetData.reduce((w, r) => Math.max(w, r.Raison.length), 10)
    worksheet['!cols'] = [{ wch: maxWidth }]
    
    // Generate Excel file
    XLSX.writeFile(workbook, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleExportCSV = () => {
    const headers = ['Type', 'Raison', 'Montant (€)', 'Responsable', 'Date', 'Heure']
    const csvData = transactions.map(transaction => [
      transaction.type === 'income' ? 'Revenu' : 'Dépense',
      transaction.reason,
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(transaction.amount),
      transaction.doctorName,
      new Date(transaction.createdAt).toLocaleDateString('fr-FR'),
      new Date(transaction.createdAt).toLocaleTimeString('fr-FR')
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
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
                  className="hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-teal-50/30 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setSelectedTransaction(row.original)
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
                    <Wallet className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium mb-2">Aucune transaction trouvée</p>
                    <p className="text-sm">
                      {isLoading ? 'Chargement des données...' : 'Commencez par ajouter une nouvelle transaction'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination table={table} />

      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedTransaction(null)
          }}
          userRole={userRole}
          userId={userId}
        />
      )}
    </>
  )
}