'use client'
import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


const EMPTY_CLASS = {
  title: '', category: 'Sports', price: '', level: 'Beginner',
  date: '', time: '', spots: '',
  rating: '4.9', image: '', instructor: '', room: '', room_maps_url: '', recurring: false,
}

const inputStyle = { width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' as const }

function LocationInput({ initialValue, mapsUrl, onSelect }: { initialValue: string, mapsUrl: string, onSelect: (room: string, url: string) => void }) {
  const [value, setValue] = useState(initialValue || '')
  const [suggestions, setSuggestions] = useState<{ description: string, place_id: string }[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (v.length < 2) { setSuggestions([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/places?input=${encodeURIComponent(v)}`)
      const data = await res.json()
      setSuggestions(data.suggestions || [])
      setOpen(true)
    }, 300)
  }

  const handleSelect = (s: { description: string, place_id: string }) => {
    setValue(s.description)
    setSuggestions([])
    setOpen(false)
    onSelect(s.description, `https://www.google.com/maps/place/?q=place_id:${s.place_id}`)
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search for a location..."
        style={inputStyle}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#1A2332', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', marginTop: '4px', zIndex: 100, overflow: 'hidden' }}>
          {suggestions.map(s => (
            <div key={s.place_id} onMouseDown={() => handleSelect(s)}
              style={{ padding: '12px 16px', cursor: 'pointer', color: 'white', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(249,115,22,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              📍 {s.description}
            </div>
          ))}
        </div>
      )}
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: '#60A5FA', fontSize: '13px', textDecoration: 'none' }}>
          View on Google Maps →
        </a>
      )}
    </div>
  )
}

function ClassForm({ data, setData, onSave, saving, saveLabel }: any) {
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const json = await res.json()
    setUploading(false)
    if (res.ok) setData((d: any) => ({ ...d, image: json.url }))
    else alert(json.error || 'Upload failed')
  }

  return (
    <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[
        { label: 'Class Title', key: 'title' },
        { label: 'Instructor', key: 'instructor' },
        { label: 'Price ($)', key: 'price', type: 'number' },
        { label: 'Total Spots', key: 'spots', type: 'number' },
        { label: 'Date (e.g. Mon, Feb 23)', key: 'date' },
        { label: 'Time (e.g. 6:00 PM)', key: 'time' },
      ].map(field => (
        <div key={field.key}>
          <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>{field.label}</label>
          <input type={field.type || 'text'} value={data[field.key]} onChange={e => setData((d: any) => ({ ...d, [field.key]: e.target.value }))} style={inputStyle} />
        </div>
      ))}
      <div>
        <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Location</label>
        <LocationInput
          key={data.id || 'new'}
          initialValue={data.room || ''}
          mapsUrl={data.room_maps_url || ''}
          onSelect={(room, url) => setData((d: any) => ({ ...d, room, room_maps_url: url }))}
        />
      </div>
      <div>
        <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Class Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ ...inputStyle, padding: '10px 16px', cursor: 'pointer' }} />
        {uploading && <p style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '6px' }}>Uploading...</p>}
        {data.image && !uploading && <img src={data.image} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Category</label>
          <select value={data.category} onChange={e => setData((d: any) => ({ ...d, category: e.target.value }))} style={inputStyle}>
            {['Sports', 'Music', 'Dance'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Level</label>
          <select value={data.level} onChange={e => setData((d: any) => ({ ...d, level: e.target.value }))} style={inputStyle}>
            {['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Kids'].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '10px' }}>Recurring Class?</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[{ label: 'Yes — repeats weekly at the same day & time', value: true }, { label: 'No — one-time class', value: false }].map(opt => (
            <button key={String(opt.value)} type="button" onClick={() => setData((d: any) => ({ ...d, recurring: opt.value }))}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: data.recurring === opt.value ? '2px solid #F97316' : '1px solid rgba(255,255,255,0.15)', backgroundColor: data.recurring === opt.value ? 'rgba(249,115,22,0.15)' : 'transparent', color: data.recurring === opt.value ? '#F97316' : '#9CA3AF' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onSave} disabled={saving} style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: '8px' }}>
        {saving ? 'Saving...' : saveLabel}
      </button>
    </div>
  )
}

export default function StudioDashboard() {
  const router = useRouter()
  const [classes, setClasses] = useState<any[]>([])
  const [earnings, setEarnings] = useState<any>(null)
  const [stripeStatus, setStripeStatus] = useState<any>(null)
  const [stripeDismissed, setStripeDismissed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'classes' | 'add' | 'edit' | 'earnings' | 'import'>('classes')
  const [newClass, setNewClass] = useState({ ...EMPTY_CLASS })
  const [editingClass, setEditingClass] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [importRows, setImportRows] = useState<any[]>([])
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    loadClasses()
    fetch('/api/studio/connect').then(r => r.json()).then(setStripeStatus)
  }, [])

  const loadClasses = async () => {
    setLoading(true)
    const res = await fetch('/api/studio/classes')
    if (res.status === 401) { router.push('/studio/login'); return }
    const data = await res.json()
    setClasses(data)
    setLoading(false)
  }

  const loadEarnings = async () => {
    const res = await fetch('/api/studio/earnings')
    if (res.ok) setEarnings(await res.json())
  }

  const handleTabChange = (t: typeof tab) => {
    setTab(t)
    if (t === 'earnings' && !earnings) loadEarnings()
  }

  const handleStripeConnect = async () => {
    const res = await fetch('/api/studio/connect', { method: 'POST' })
    const data = await res.json()
    if (!res.ok || !data.url) {
      alert('Stripe Connect error: ' + (data.error || 'Unknown error. Make sure Stripe Connect is enabled in your Stripe dashboard.'))
      return
    }
    window.location.href = data.url
  }

  const handleLogout = async () => {
    await fetch('/api/studio/logout', { method: 'POST' })
    router.push('/studio/login')
  }

  const handleAdd = async () => {
    setSaving(true)
    const res = await fetch('/api/studio/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass),
    })
    setSaving(false)
    if (res.ok) { setNewClass({ ...EMPTY_CLASS }); setTab('classes'); loadClasses() }
    else { const err = await res.json().catch(() => ({})); alert('Failed to add class: ' + (err.error || res.status)) }
  }

  const handleEdit = async () => {
    setSaving(true)
    const res = await fetch(`/api/studio/classes/${editingClass.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingClass),
    })
    setSaving(false)
    if (res.ok) { setTab('classes'); setEditingClass(null); loadClasses() }
    else alert('Failed to update class')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class?')) return
    await fetch(`/api/studio/classes/${id}`, { method: 'DELETE' })
    loadClasses()
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })
      const mapped = rows.map(r => ({
        title: r['Class Title'] || r['title'] || '',
        instructor: r['Instructor'] || r['instructor'] || '',
        room: r['Location'] || r['room'] || '',
        price: String(r['Price'] || r['price'] || ''),
        spots: String(r['Spots'] || r['spots'] || ''),
        date: r['Date'] || r['date'] || '',
        time: r['Time'] || r['time'] || '',
        category: r['Category'] || r['category'] || 'Sports',
        level: r['Level'] || r['level'] || 'Beginner',
        recurring: (r['Recurring'] || r['recurring'] || '').toString().toLowerCase() === 'yes',
        image: '', room_maps_url: '', rating: '4.9',
      }))
      setImportRows(mapped)
    }
    reader.readAsArrayBuffer(file)
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Class Title', 'Instructor', 'Location', 'Price', 'Spots', 'Date', 'Time', 'Category', 'Level', 'Recurring'],
      ['Yoga Flow', 'Jane Smith', '123 Main St', '25', '15', 'Mon, Mar 24', '9:00 AM', 'Sports', 'Beginner', 'Yes'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Classes')
    XLSX.writeFile(wb, 'frolic-classes-template.xlsx')
  }

  const handleBulkImport = async () => {
    setImporting(true)
    let success = 0
    for (const row of importRows) {
      const res = await fetch('/api/studio/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
      })
      if (res.ok) success++
    }
    setImporting(false)
    setImportRows([])
    setTab('classes')
    loadClasses()
    alert(`Imported ${success} of ${importRows.length} classes successfully.`)
  }

  const tabBtn = (t: typeof tab, label: string) => (
    <button onClick={() => handleTabChange(t)} style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', backgroundColor: tab === t ? '#F97316' : 'transparent', color: 'white' }}>
      {label}
    </button>
  )


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F1624' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#1A2332', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', textDecoration: 'none' }}>Frolic</Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          {tabBtn('classes', 'My Classes')}
          {tabBtn('earnings', '💰 Earnings')}
          {tabBtn('add', '+ Add Class')}
          {tabBtn('import', '📥 Import')}
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#9CA3AF', padding: '8px 16px', borderRadius: '999px', fontSize: '14px', cursor: 'pointer' }}>Log Out</button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Stripe Connect Banner */}
        {stripeStatus && !stripeStatus.connected && !stripeDismissed && (
          <div style={{ backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ color: 'white', fontWeight: '700', marginBottom: '2px' }}>Connect your Stripe account to receive payouts</p>
              <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Frolic retains 25% of each booking. The remaining 75% is paid out to you directly.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => setStripeDismissed(true)} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                I'll do this later
              </button>
              <button onClick={handleStripeConnect} style={{ backgroundColor: '#F97316', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Connect with Stripe →
              </button>
            </div>
          </div>
        )}
        {stripeStatus?.connected && (
          <div style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#4ADE80', fontSize: '18px' }}>✓</span>
            <p style={{ color: '#4ADE80', fontWeight: '600', margin: 0 }}>Stripe account connected — payouts are active</p>
          </div>
        )}

        {tab === 'classes' && (
          <div>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>My Classes ({classes.length})</h2>
            {loading ? <p style={{ color: '#9CA3AF' }}>Loading...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {classes.map(c => (
                  <div key={c.id} style={{ backgroundColor: '#1A2332', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {c.image && <img src={c.image} alt={c.title} style={{ width: '100%', height: '128px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />}
                    <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}>{c.title}</h3>
                    <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>{c.category} • {c.level}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#F97316', fontWeight: 'bold' }}>${c.price}</span>
                      <span style={{ color: '#9CA3AF', fontSize: '14px' }}>{c.spots_left} spots left</span>
                    </div>
                    <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '12px' }}>{c.date} • {c.time}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setEditingClass({ ...c }); setTab('edit') }} style={{ flex: 1, backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', padding: '8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(c.id)} style={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                ))}
                {classes.length === 0 && <p style={{ color: '#6B7280' }}>No classes yet. Add your first one!</p>}
              </div>
            )}
          </div>
        )}

        {tab === 'earnings' && (
          <div>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>Earnings</h2>
            {!earnings ? <p style={{ color: '#9CA3AF' }}>Loading...</p> : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>Total Revenue</p>
                    <p style={{ color: '#4ADE80', fontSize: '36px', fontWeight: '900' }}>${earnings.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>Total Bookings</p>
                    <p style={{ color: 'white', fontSize: '36px', fontWeight: '900' }}>{earnings.totalBookings}</p>
                  </div>
                </div>

                <h3 style={{ color: 'white', fontWeight: '800', fontSize: '18px', marginBottom: '16px' }}>Transaction History</h3>
                {earnings.bookings.length === 0 ? (
                  <p style={{ color: '#6B7280' }}>No bookings yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {earnings.bookings.map((b: any) => (
                      <div key={b.id} style={{ backgroundColor: '#1A2332', borderRadius: '12px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <p style={{ color: 'white', fontWeight: '600', marginBottom: '2px' }}>{b.class_name}</p>
                          <p style={{ color: '#6B7280', fontSize: '13px' }}>{b.first_name} {b.last_name} · {new Date(b.created_at).toLocaleDateString()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#F97316', fontWeight: '700', fontSize: '16px' }}>${parseFloat(b.amount).toFixed(2)}</p>
                          <span style={{ fontSize: '12px', fontWeight: '600', padding: '2px 8px', borderRadius: '999px', backgroundColor: b.payment_status === 'paid' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)', color: b.payment_status === 'paid' ? '#4ADE80' : '#FBBF24' }}>
                            {b.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'add' && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>Add New Class</h2>
            <ClassForm data={newClass} setData={setNewClass} onSave={handleAdd} saving={saving} saveLabel="Add Class" />
          </div>
        )}

        {tab === 'edit' && editingClass && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>Edit Class</h2>
            <ClassForm data={editingClass} setData={setEditingClass} onSave={handleEdit} saving={saving} saveLabel="Save Changes" />
          </div>
        )}

        {tab === 'import' && (
          <div>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '8px' }}>Import Classes from Excel</h2>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>Upload an .xlsx or .csv file to bulk add classes. Download the template to get started.</p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <button onClick={downloadTemplate} style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                Download Template
              </button>
              <label style={{ backgroundColor: '#F97316', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                Upload Excel / CSV
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportFile} style={{ display: 'none' }} />
              </label>
            </div>

            {importRows.length > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{importRows.length} class{importRows.length !== 1 ? 'es' : ''} ready to import — review and edit below</p>
                  <button onClick={() => setImportRows([])} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '13px', cursor: 'pointer' }}>Clear</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {importRows.map((row, i) => (
                    <div key={i} style={{ backgroundColor: '#1A2332', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                      {[
                        { label: 'Class Title', key: 'title' },
                        { label: 'Instructor', key: 'instructor' },
                        { label: 'Location', key: 'room' },
                        { label: 'Price ($)', key: 'price' },
                        { label: 'Spots', key: 'spots' },
                        { label: 'Date', key: 'date' },
                        { label: 'Time', key: 'time' },
                        { label: 'Category', key: 'category' },
                        { label: 'Level', key: 'level' },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ color: '#6B7280', fontSize: '11px', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                          <input
                            value={row[f.key]}
                            onChange={e => setImportRows(rows => rows.map((r, j) => j === i ? { ...r, [f.key]: e.target.value } : r))}
                            style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none', fontSize: '13px', boxSizing: 'border-box' as const }}
                          />
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button onClick={() => setImportRows(rows => rows.filter((_, j) => j !== i))} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handleBulkImport} disabled={importing} style={{ backgroundColor: '#F97316', border: 'none', color: 'white', padding: '16px 32px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: importing ? 'not-allowed' : 'pointer', opacity: importing ? 0.7 : 1 }}>
                  {importing ? 'Importing...' : `Import ${importRows.length} Class${importRows.length !== 1 ? 'es' : ''}`}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
