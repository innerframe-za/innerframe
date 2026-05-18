import { useState } from 'react'
import { PageHeader } from '@/components/portal/PageHeader'
import { Plus, Trash2, UserMinus } from 'lucide-react'

const mockOrg = {
  name: 'Sunrise Old Age Home',
  address: '14 Garden Road, Pretoria, 0001',
  contactEmail: 'admin@sunrisecare.co.za',
  contactPhone: '012 345 6789',
}

const mockStaff = [
  { id: '1', name: 'Admin User', email: 'admin@sunrisecare.co.za', role: 'home_admin', active: true },
  { id: '2', name: 'Jane Nurse', email: 'jane@sunrisecare.co.za', role: 'staff', active: true },
  { id: '3', name: 'Peter Kitchen', email: 'peter@sunrisecare.co.za', role: 'staff', active: false },
]

const mockCategories = ['Care Plans', 'Medication', 'Policies', 'Reports', 'Templates', 'Compliance']

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-medium" style={{ color: '#1E3A2F' }}>{title}</h2>
      <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
    </div>
  )
}

export default function SettingsPage() {
  const [orgForm, setOrgForm] = useState(mockOrg)
  const [staff] = useState(mockStaff)
  const [categories, setCategories] = useState(mockCategories)
  const [newCategory, setNewCategory] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveStatus('saving')
    await new Promise(resolve => setTimeout(resolve, 800))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  const handleAddCategory = () => {
    const val = newCategory.trim()
    if (!val || categories.includes(val)) return
    setCategories(prev => [...prev, val])
    setNewCategory('')
  }

  const handleRemoveCategory = (cat: string) => {
    setCategories(prev => prev.filter(c => c !== cat))
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" subtitle="Facility profile, staff management, and document categories" />

      <section className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <SectionHeading title="Facility Profile" />
        <form onSubmit={handleSaveOrg} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'name', label: 'Facility Name', key: 'name' as const, type: 'text' },
              { id: 'phone', label: 'Phone Number', key: 'contactPhone' as const, type: 'tel' },
              { id: 'email', label: 'Contact Email', key: 'contactEmail' as const, type: 'email' },
            ].map(field => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>{field.label}</label>
                <input id={field.id} type={field.type} value={orgForm[field.key]}
                  onChange={e => setOrgForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
                  style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                  onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                  onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-xs font-medium mb-1.5" style={{ color: '#1a1a1a' }}>Address</label>
              <input id="address" type="text" value={orgForm.address}
                onChange={e => setOrgForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
                style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
                onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
                onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
              />
            </div>
          </div>
          <button type="submit" disabled={saveStatus === 'saving'} className="px-4 py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-60" style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-medium" style={{ color: '#1E3A2F' }}>Staff Management</h2>
            <div style={{ width: '36px', height: '2px', backgroundColor: '#D4AF37', marginTop: '4px' }} aria-hidden="true" />
          </div>
          <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium" style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}>
            <Plus size={12} />Invite Staff
          </button>
        </div>
        <div className="space-y-2">
          {staff.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ backgroundColor: member.active ? '#1E3A2F' : '#8AAF8E' }} aria-hidden="true">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{member.name}</p>
                  <p className="text-xs" style={{ color: '#5a5a5a' }}>
                    {member.email} · <span style={{ color: member.role === 'home_admin' ? '#D4AF37' : '#5a5a5a' }}>{member.role === 'home_admin' ? 'Home Admin' : 'Staff'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: member.active ? 'rgba(22,163,74,0.08)' : 'rgba(90,90,90,0.08)', color: member.active ? '#15803d' : '#5a5a5a' }}>
                  {member.active ? 'Active' : 'Inactive'}
                </span>
                <button type="button" className="w-7 h-7 flex items-center justify-center rounded transition-colors" style={{ color: '#5a5a5a' }} aria-label={`Deactivate ${member.name}`}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#dc2626')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#5a5a5a')}>
                  <UserMinus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border p-6" style={{ borderColor: '#ddd6c8', borderWidth: '0.5px' }}>
        <SectionHeading title="Document Categories" />
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(cat => (
            <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium" style={{ borderColor: '#ddd6c8', color: '#1a1a1a', backgroundColor: '#F5F0E8' }}>
              {cat}
              <button type="button" onClick={() => handleRemoveCategory(cat)} aria-label={`Remove ${cat}`} style={{ color: '#5a5a5a' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#dc2626')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = '#5a5a5a')}>
                <Trash2 size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCategory()} placeholder="New category name..."
            className="flex-1 px-3 py-2 rounded border text-sm outline-none transition-colors"
            style={{ borderColor: '#ddd6c8', color: '#1a1a1a' }}
            onFocus={e => (e.target.style.borderColor = '#1E3A2F')}
            onBlur={e => (e.target.style.borderColor = '#ddd6c8')}
          />
          <button type="button" onClick={handleAddCategory} className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium" style={{ backgroundColor: '#1E3A2F', color: '#ffffff' }}>
            <Plus size={14} />Add
          </button>
        </div>
      </section>
    </div>
  )
}
