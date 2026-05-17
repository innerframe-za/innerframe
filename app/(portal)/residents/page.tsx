'use client'
export const runtime = 'edge'

import { useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/portal/PageHeader'

// TODO: replace with Supabase query:
// supabase.from('patients').select('*').eq('org_id', orgId).order('full_name')
const mockResidents = [
  { id: '1', name: 'Margaret Johnson', idNumber: '***********1234', roomNumber: '12', admissionDate: '3 Jan 2024', status: 'active' as const },
  { id: '2', name: 'Thomas van der Merwe', idNumber: '***********5678', roomNumber: '7', admissionDate: '15 Mar 2024', status: 'active' as const },
  { id: '3', name: 'Edith Nkosi', idNumber: '***********9012', roomNumber: '3', admissionDate: '28 Jun 2023', status: 'active' as const },
  { id: '4', name: 'Samuel Pretorius', idNumber: '***********3456', roomNumber: '15', admissionDate: '12 Feb 2024', status: 'discharged' as const },
  { id: '5', name: 'Hettie Botha', idNumber: '***********7890', roomNumber: '9', admissionDate: '7 Sep 2023', status: 'active' as const },
  { id: '6', name: 'Pieter Erasmus', idNumber: '***********2345', roomNumber: '21', admissionDate: '19 Nov 2023', status: 'active' as const },
]

const statusConfig = {
  active: { dot: '#16a34a', label: 'Active', bg: 'rgba(22,163,74,0.08)', color: '#15803d' },
  discharged: { dot: '#ca8a04', label: 'Discharged', bg: 'rgba(202,138,4,0.1)', color: '#a16207' },
  deceased: { dot: '#5a5a5a', label: 'Deceased', bg: 'rgba(90,90,90,0.1)', color: '#5a5a5a' },
}

/**
 * Residents list page — searchable, filterable table of all facility residents.
 */
export default function ResidentsPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filtered = mockResidents.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.roomNumber.includes(search)
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div>
      <PageHeader
        title="Residents"
        subtitle="All facility residents across all admission statuses"
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}
          >
            <UserPlus size={14} />
            Add Resident
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#5a5a5a' }}
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or room..."
            className="w-full pl-9 pr-3 py-2.5 rounded border text-sm outline-none"
            style={{ borderColor: '#ddd6c8', backgroundColor: '#ffffff', color: '#1a1a1a' }}
            onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
            onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded border text-sm outline-none"
          style={{ borderColor: '#ddd6c8', backgroundColor: '#ffffff', color: '#1a1a1a' }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="discharged">Discharged</option>
          <option value="deceased">Deceased</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-xl border overflow-hidden"
        style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}
      >
        {/* Table header */}
        <div
          className="hidden md:grid grid-cols-[1fr_120px_120px_130px_120px_80px] gap-4 px-5 py-3 border-b"
          style={{ borderColor: '#ddd6c8', backgroundColor: '#F5F0E8' }}
        >
          {['Name', 'ID Number', 'Room', 'Admission Date', 'Status', 'Actions'].map(col => (
            <span
              key={col}
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: '#5a5a5a' }}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Table rows */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#5a5a5a' }}>
              No residents found matching your search.
            </p>
          </div>
        ) : (
          filtered.map((resident, index) => {
            const sc = statusConfig[resident.status]
            return (
              <div
                key={resident.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_130px_120px_80px] gap-2 md:gap-4 px-5 py-3.5 border-b last:border-b-0 items-center"
                style={{
                  borderColor: '#ddd6c8',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafaf9',
                }}
              >
                {/* Name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                    style={{ backgroundColor: '#1E3A2F' }}
                    aria-hidden="true"
                  >
                    {resident.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#1a1a1a' }}>
                    {resident.name}
                  </span>
                </div>

                {/* ID */}
                <span className="text-sm font-mono" style={{ color: '#5a5a5a' }}>
                  {resident.idNumber}
                </span>

                {/* Room */}
                <span className="text-sm" style={{ color: '#1a1a1a' }}>
                  Room {resident.roomNumber}
                </span>

                {/* Admission date */}
                <span className="text-sm" style={{ color: '#5a5a5a' }}>
                  {resident.admissionDate}
                </span>

                {/* Status */}
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: sc.bg, color: sc.color }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: sc.dot }}
                      aria-hidden="true"
                    />
                    {sc.label}
                  </span>
                </div>

                {/* Actions */}
                <a
                  href={`/residents/${resident.id}`}
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#1E3A2F' }}
                  onMouseEnter={e =>
                    ((e.target as HTMLAnchorElement).style.color = '#D4AF37')
                  }
                  onMouseLeave={e =>
                    ((e.target as HTMLAnchorElement).style.color = '#1E3A2F')
                  }
                >
                  View →
                </a>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
