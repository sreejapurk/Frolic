'use client'
import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


const EMPTY_SLOT = { date: '', time: '', duration: '60 min', spots: '10' }

const EMPTY_CLASS = {
  title: '', category: 'Sports', subcategory: '', price: '', level: 'Beginner',
  slots: [{ ...EMPTY_SLOT }] as { date: string; time: string; duration: string; spots: string }[],
  rating: '4.9', image: '', instructor: '', room: '', room_maps_url: '', recurring: false, description: '', location_type: 'location', location_types: [] as string[],
  price_location: '', price_online: '', price_residence: '',
}

const SUBCATEGORIES: Record<string, string[]> = {
  Music: ['Piano', 'Guitar', 'Vocals', 'Drums', 'Violin', 'Flute', 'Ukulele', 'Bass', 'Saxophone', 'Trumpet', 'Keyboard', 'Harp'],
  Sports: ['Basketball', 'Soccer', 'Tennis', 'Swimming', 'Yoga', 'Pilates', 'Boxing', 'Martial Arts', 'Golf', 'Running', 'Cycling', 'CrossFit', 'Gymnastics', 'Skating'],
  Dance: ['Ballet', 'Hip Hop', 'Salsa', 'Contemporary', 'Ballroom', 'Jazz', 'Tap', 'K-Pop', 'Zumba', 'Swing', 'Belly Dance', 'Flamenco'],
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
      ].map(field => (
        <div key={field.key}>
          <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>{field.label}</label>
          <input type="text" value={data[field.key]} onChange={e => setData((d: any) => ({ ...d, [field.key]: e.target.value }))} style={inputStyle} />
        </div>
      ))}

      {/* Slots */}
      <div>
        <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Time Slots</label>
        <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '10px' }}>Add multiple dates and times for the same class</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(data.slots || []).map((slot: any, i: number) => (
            <div key={i} style={{ backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#F97316', fontSize: '13px', fontWeight: '700' }}>Slot {i + 1}</span>
                {(data.slots || []).length > 1 && (
                  <button type="button" onClick={() => setData((d: any) => ({ ...d, slots: d.slots.filter((_: any, j: number) => j !== i) }))}
                    style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>×</button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Date (e.g. Mon, Feb 23)</label>
                  <input value={slot.date} onChange={e => setData((d: any) => ({ ...d, slots: d.slots.map((s: any, j: number) => j === i ? { ...s, date: e.target.value } : s) }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Time (e.g. 6:00 PM)</label>
                  <input value={slot.time} onChange={e => setData((d: any) => ({ ...d, slots: d.slots.map((s: any, j: number) => j === i ? { ...s, time: e.target.value } : s) }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Duration (e.g. 60 min)</label>
                  <input value={slot.duration} onChange={e => setData((d: any) => ({ ...d, slots: d.slots.map((s: any, j: number) => j === i ? { ...s, duration: e.target.value } : s) }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Spots</label>
                  <input type="number" value={slot.spots} onChange={e => setData((d: any) => ({ ...d, slots: d.slots.map((s: any, j: number) => j === i ? { ...s, spots: e.target.value } : s) }))} style={inputStyle} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button"
          onClick={() => setData((d: any) => ({ ...d, slots: [...(d.slots || []), { ...EMPTY_SLOT }] }))}
          style={{ marginTop: '10px', width: '100%', background: 'rgba(249,115,22,0.08)', border: '1px dashed rgba(249,115,22,0.4)', color: '#F97316', padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          + Add Another Time Slot
        </button>
      </div>
      <div>
        <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Description</label>
        <textarea value={data.description || ''} onChange={e => setData((d: any) => ({ ...d, description: e.target.value }))} placeholder="Describe what students can expect..." rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
      </div>
      <div>
        <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Where does the class take place?</label>
        <p style={{ color: '#6B7280', fontSize: '12px', marginBottom: '10px' }}>Select all that apply</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { value: 'location', label: 'One Location', sub: 'Class is held at a fixed address', priceKey: 'price_location' },
            { value: 'online', label: 'Online', sub: 'Virtual class — link shared after booking', priceKey: 'price_online' },
            { value: 'residence', label: 'Can Come to Your Residence', sub: 'Instructor travels to the student', priceKey: 'price_residence' },
          ].map(opt => {
            const types: string[] = data.location_types || []
            const selected = types.includes(opt.value)
            const toggle = () => {
              const next = selected ? types.filter((t: string) => t !== opt.value) : [...types, opt.value]
              setData((d: any) => ({ ...d, location_types: next, location_type: next[0] || 'location' }))
            }
            return (
              <div key={opt.value}>
                <button type="button" onClick={toggle}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', border: selected ? '2px solid #F97316' : '1px solid rgba(255,255,255,0.1)', backgroundColor: selected ? 'rgba(249,115,22,0.08)' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: selected ? '2px solid #F97316' : '2px solid rgba(255,255,255,0.2)', backgroundColor: selected ? '#F97316' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selected && <span style={{ color: 'white', fontSize: '11px', fontWeight: '900' }}>✓</span>}
                  </div>
                  <div>
                    <span style={{ color: selected ? '#F97316' : 'white', fontWeight: '600', fontSize: '14px', display: 'block' }}>{opt.label}</span>
                    <span style={{ color: '#6B7280', fontSize: '12px' }}>{opt.sub}</span>
                  </div>
                </button>
                {selected && (
                  <div style={{ marginTop: '8px', paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ color: '#9CA3AF', fontSize: '13px', whiteSpace: 'nowrap' }}>Price ($)</label>
                    <input
                      type="number"
                      value={data[opt.priceKey] || ''}
                      onChange={e => setData((d: any) => ({ ...d, [opt.priceKey]: e.target.value, price: e.target.value }))}
                      placeholder="0"
                      style={{ ...inputStyle, width: '120px' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {(data.location_types || []).includes('location') && (
          <div style={{ marginTop: '12px' }}>
            <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Address</label>
            <LocationInput
              key={data.id || 'new'}
              initialValue={data.room || ''}
              mapsUrl={data.room_maps_url || ''}
              onSelect={(room, url) => setData((d: any) => ({ ...d, room, room_maps_url: url }))}
            />
          </div>
        )}
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
          <select value={data.category} onChange={e => setData((d: any) => ({ ...d, category: e.target.value, subcategory: '' }))} style={inputStyle}>
            {['Sports', 'Music', 'Dance'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Subcategory</label>
          <select
            value={(SUBCATEGORIES[data.category] || []).includes(data.subcategory) ? data.subcategory : data.subcategory ? '__other__' : ''}
            onChange={e => {
              if (e.target.value === '__other__') setData((d: any) => ({ ...d, subcategory: '__other__' }))
              else setData((d: any) => ({ ...d, subcategory: e.target.value }))
            }}
            style={inputStyle}
          >
            <option value="">— Select —</option>
            {(SUBCATEGORIES[data.category] || []).map((s: string) => <option key={s}>{s}</option>)}
            <option value="__other__">Other (specify below)</option>
          </select>
          {(data.subcategory === '__other__' || (data.subcategory && !(SUBCATEGORIES[data.category] || []).includes(data.subcategory))) && (
            <input
              type="text"
              value={data.subcategory === '__other__' ? '' : data.subcategory || ''}
              onChange={e => setData((d: any) => ({ ...d, subcategory: e.target.value }))}
              placeholder="e.g. Cello, Badminton, Breakdance..."
              style={{ ...inputStyle, marginTop: '8px' }}
            />
          )}
        </div>
      </div>
      <div>
        <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Level</label>
        <select value={data.level} onChange={e => setData((d: any) => ({ ...d, level: e.target.value }))} style={inputStyle}>
          {['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Kids'].map(l => <option key={l}>{l}</option>)}
        </select>
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
  const [tab, setTab] = useState<'classes' | 'add' | 'edit' | 'earnings'>('classes')
  const [newClass, setNewClass] = useState({ ...EMPTY_CLASS })
  const [editingClass, setEditingClass] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [importRows, setImportRows] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [rawColumns, setRawColumns] = useState<string[]>([])
  const [columnMap, setColumnMap] = useState<Record<string, string>>({})
  const [rawRows, setRawRows] = useState<any[]>([])
  const [importStep, setImportStep] = useState<'upload' | 'map' | 'preview'>('upload')

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
    if (t !== 'add') { setImportStep('upload'); setImportRows([]); setRawRows([]); setRawColumns([]) }
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

  const handleDuplicate = (c: any) => {
    const { id, spots_left, created_at, studio_user_id, ...rest } = c
    const slots = (c.slots || []).map((s: any) => ({ date: s.date || '', time: '', duration: s.duration || '60 min', spots: String(s.spots || 10) }))
    setNewClass({ ...EMPTY_CLASS, ...rest, slots: slots.length > 0 ? slots : [{ ...EMPTY_SLOT }] })
    setTab('add')
  }

  const FROLIC_FIELDS = [
    { key: 'title', label: 'Class Title', hints: ['title', 'class', 'name', 'class name', 'class title', 'course'] },
    { key: 'instructor', label: 'Instructor', hints: ['instructor', 'teacher', 'coach', 'trainer', 'staff', 'facilitator'] },
    { key: 'room', label: 'Location', hints: ['location', 'room', 'venue', 'address', 'place', 'studio', 'where'] },
    { key: 'price', label: 'Price ($)', hints: ['price', 'cost', 'fee', 'amount', 'rate', 'charge'] },
    { key: 'spots', label: 'Total Spots', hints: ['spots', 'capacity', 'seats', 'max', 'size', 'limit', 'students', 'participants'] },
    { key: 'date', label: 'Date', hints: ['date', 'day', 'when', 'start date', 'class date'] },
    { key: 'time', label: 'Time', hints: ['time', 'start time', 'start', 'hour', 'schedule'] },
    { key: 'category', label: 'Category', hints: ['category', 'type', 'class type', 'genre', 'subject'] },
    { key: 'level', label: 'Level', hints: ['level', 'difficulty', 'skill', 'skill level', 'experience'] },
  ]

  const autoDetectMapping = (columns: string[]) => {
    const map: Record<string, string> = {}
    for (const field of FROLIC_FIELDS) {
      const match = columns.find(col =>
        field.hints.some(hint => col.toLowerCase().trim().includes(hint))
      )
      if (match) map[field.key] = match
    }
    return map
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
      if (rows.length === 0) return
      const cols = Object.keys(rows[0])
      setRawColumns(cols)
      setRawRows(rows)
      setColumnMap(autoDetectMapping(cols))
      setImportStep('map')
    }
    reader.readAsArrayBuffer(file)
  }

  const applyMapping = () => {
    const mapped = rawRows.map(r => ({
      title: String(r[columnMap['title']] || ''),
      instructor: String(r[columnMap['instructor']] || ''),
      room: String(r[columnMap['room']] || ''),
      price: String(r[columnMap['price']] || ''),
      spots: String(r[columnMap['spots']] || ''),
      date: String(r[columnMap['date']] || ''),
      time: String(r[columnMap['time']] || ''),
      category: String(r[columnMap['category']] || 'Sports'),
      level: String(r[columnMap['level']] || 'Beginner'),
      recurring: false, image: '', room_maps_url: '', rating: '4.9',
    }))
    setImportRows(mapped)
    setImportStep('preview')
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
                      <button onClick={() => { setEditingClass({ ...c, slots: (c.slots || []).length > 0 ? c.slots.map((s: any) => ({ ...s, spots: String(s.spots) })) : [{ date: c.date || '', time: c.time || '', duration: c.duration || '60 min', spots: String(c.spots || 10) }] }); setTab('edit') }} style={{ flex: 1, backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', padding: '8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDuplicate(c)} style={{ flex: 1, backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8', padding: '8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Duplicate</button>
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

            {/* Import from Excel */}
            {importStep === 'upload' && (
              <>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(249,115,22,0.4)', borderRadius: '16px', padding: '28px 24px', cursor: 'pointer', backgroundColor: 'rgba(249,115,22,0.04)', gap: '8px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '28px' }}>📂</span>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>Import from Excel</span>
                  <span style={{ color: '#6B7280', fontSize: '13px' }}>Upload any .xlsx, .xls or .csv — we'll map the columns automatically</span>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportFile} style={{ display: 'none' }} />
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: '#4B5563', fontSize: '13px' }}>or fill in manually</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                </div>
                <ClassForm data={newClass} setData={setNewClass} onSave={handleAdd} saving={saving} saveLabel="Add Class" />
              </>
            )}

            {importStep === 'map' && (
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>We detected your columns below. Match each one to the right Frolic field — we've auto-filled what we could.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  {FROLIC_FIELDS.map(field => (
                    <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: '16px' }}>
                      <label style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{field.label}</label>
                      <select value={columnMap[field.key] || ''} onChange={e => setColumnMap(m => ({ ...m, [field.key]: e.target.value }))} style={{ ...inputStyle, color: columnMap[field.key] ? 'white' : '#6B7280' }}>
                        <option value="">— skip this field —</option>
                        {rawColumns.map(col => <option key={col} value={col}>{col}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { setImportStep('upload'); setRawRows([]); setRawColumns([]) }} style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Back</button>
                  <button onClick={applyMapping} style={{ backgroundColor: '#F97316', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Preview {rawRows.length} Class{rawRows.length !== 1 ? 'es' : ''} →</button>
                </div>
              </div>
            )}

            {importStep === 'preview' && importRows.length > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{importRows.length} class{importRows.length !== 1 ? 'es' : ''} ready — review and edit before importing</p>
                  <button onClick={() => setImportStep('map')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '13px', cursor: 'pointer' }}>← Back to mapping</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {importRows.map((row, i) => (
                    <div key={i} style={{ backgroundColor: '#1A2332', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                      {FROLIC_FIELDS.map(f => (
                        <div key={f.key}>
                          <label style={{ color: '#6B7280', fontSize: '11px', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                          <input value={row[f.key]} onChange={e => setImportRows(rows => rows.map((r, j) => j === i ? { ...r, [f.key]: e.target.value } : r))} style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none', fontSize: '13px', boxSizing: 'border-box' as const }} />
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

        {tab === 'edit' && editingClass && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>Edit Class</h2>
            <ClassForm data={editingClass} setData={setEditingClass} onSave={handleEdit} saving={saving} saveLabel="Save Changes" />
          </div>
        )}

      </div>
    </div>
  )
}
