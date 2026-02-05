// app/consultations/components/TableFilters.tsx
'use client'

import { Search, Download, FileText, FileSpreadsheet, Filter, SlidersHorizontal } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TableFiltersProps {
  onSearch: (searchTerm: string) => void
  onExportExcel: () => void
  onExportCSV: () => void
  userRole: 'admin' | 'doctor' | null
}

export default function TableFilters({ 
  onSearch, 
  onExportExcel, 
  onExportCSV,
  userRole 
}: TableFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(debouncedSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [debouncedSearch, onSearch])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setDebouncedSearch(value)
  }

  return (
    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par patient, diagnostic, médecin..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              onClick={() => alert('Filtres avancés à implémenter')}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtres</span>
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onExportCSV}
                className="gap-2 border-gray-300 hover:border-green-500 hover:bg-green-50"
              >
                <FileText className="h-4 w-4" />
                <span>CSV</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onExportExcel}
                className="gap-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel</span>
              </Button>

              <Button
                onClick={() => {
                  onExportCSV()
                  onExportExcel()
                }}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
              >
                <Download className="h-4 w-4" />
                <span>Exporter</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}