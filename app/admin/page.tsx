'use client'
import { useState } from 'react'
import Link from 'next/link'

const EMPTY_SLOT = { date: '', time: '', duration: '60 min', spots: '10' }

const TIME_OPTIONS = (() => {
  const times: string[] = []
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) continue
      const hour = h % 12 === 0 ? 12 : h % 12
      const ampm = h < 12 ? 'AM' : 'PM'
      times.push(`${hour}:${m === 0 ? '00' : '30'} ${ampm}`)
    }
  }
  return times
})()

const DURATION_OPTIONS = ['30 min', '45 min', '60 min', '75 min', '90 min', '2 hours', '2.5 hours', '3 hours']

function formatDateValue(raw: string) {
  const d = raw ? new Date(raw + 'T00:00:00') : null
  if (!d) return ''
  const SHORT_D = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const SHORT_M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${SHORT_D[d.getDay()]}, ${SHORT_M[d.getMonth()]} ${d.getDate()}`
}
const EMPTY_CLASS = {
  title: '', studio: '', category: 'Sports', subcategory: '', price: '', level: 'Beginner',
  slots: [{ ...EMPTY_SLOT }] as { date: string; time: string; duration: string; spots: string }[],
  rating: '4.9', image: '', instructor: '', room: '', room_maps_url: '', recurring: false,
  description: '', location_type: 'location', location_types: [] as string[],
  price_location: '', price_online: '', price_residence: '', distance: '',
}

const SUBCATEGORIES: Record<string, string[]> = {
  Music: ['Piano', 'Guitar', 'Vocals', 'Drums', 'Violin', 'Flute', 'Ukulele', 'Bass', 'Saxophone', 'Trumpet', 'Keyboard', 'Harp'],
  Sports: ['Basketball', 'Soccer', 'Tennis', 'Swimming', 'Yoga', 'Pilates', 'Boxing', 'Martial Arts', 'Golf', 'Running', 'Cycling', 'CrossFit', 'Gymnastics', 'Skating'],
  Dance: ['Ballet', 'Hip Hop', 'Salsa', 'Contemporary', 'Ballroom', 'Jazz', 'Tap', 'K-Pop', 'Zumba', 'Swing', 'Belly Dance', 'Flamenco'],
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [classes, setClasses] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [studios, setStudios] = useState<any[]>([])
  const [tab, setTab] = useState<'classes' | 'bookings' | 'applications' | 'studios' | 'add' | 'edit' | 'reschedule'>('classes')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newClass, setNewClass] = useState({ ...EMPTY_CLASS })
  const [editingClass, setEditingClass] = useState<any>(null)
  const [reschedule, setReschedule] = useState({ instructor: '', oldDay: '', newDay: '', oldTime: '', newTime: '' })
  const [rescheduling, setRescheduling] = useState(false)

  const login = async () => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (data.ok) {
      setAuthed(true)
      loadData()
    } else {
      alert('Wrong password')
    }
  }

  const loadData = async () => {
    setLoading(true)
    const [c, b, a, s] = await Promise.all([
      fetch('/api/admin/classes').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
      fetch('/api/applications').then(r => r.json()),
      fetch('/api/admin/studios').then(r => r.json()),
    ])
    setClasses(c)
    setBookings(b)
    setApplications(a)
    setStudios(s)
    setLoading(false)
  }

  const deleteClass = async (id: string) => {
    if (!confirm('Delete this class?')) return
    await fetch(`/api/classes/${id}`, { method: 'DELETE' })
    loadData()
  }

  const handleAddClass = async () => {
    setSaving(true)
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass),
    })
    setSaving(false)
    if (res.ok) {
      setNewClass({ ...EMPTY_CLASS })
      setTab('classes')
      loadData()
    } else {
      const err = await res.json().catch(() => ({}))
      alert('Failed to add class: ' + (err.error || res.status))
    }
  }

  const handleEditSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/classes/${editingClass.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingClass),
    })
    setSaving(false)
    if (res.ok) { setTab('classes'); setEditingClass(null); loadData() }
    else alert('Failed to save changes')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const json = await res.json()
    setUploading(false)
    if (res.ok) setNewClass(n => ({ ...n, image: json.url }))
    else alert(json.error || 'Upload failed')
  }

  const inputStyle = { width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' as const }

  if (!authed) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F1624', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Password"
          style={{ ...inputStyle, marginBottom: '16px' }}
        />
        <button onClick={login} style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
          Log In
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F1624' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#1A2332', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', textDecoration: 'none' }}>Frolic Admin</Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          {(['classes', 'bookings', 'applications', 'studios', 'add', 'reschedule'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', backgroundColor: tab === t ? '#F97316' : 'transparent', color: 'white' }}>
              {t === 'add' ? '+ Add Class' : t === 'reschedule' ? 'Reschedule' : t === 'studios' ? 'Studios' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          {tab === 'edit' && (
            <button style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', border: 'none', backgroundColor: '#F97316', color: 'white' }}>
              Editing Class
            </button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {loading && <p style={{ color: '#9CA3AF' }}>Loading...</p>}

        {tab === 'classes' && !loading && (
          <div>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>Classes ({classes.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {classes.map(c => (
                <div key={c.id} style={{ backgroundColor: '#1A2332', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {c.image && <img src={c.image} alt={c.title} style={{ width: '100%', height: '128px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />}
                  <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}>{c.title}</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>{c.studio}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#F97316', fontWeight: 'bold' }}>${c.price}</span>
                    <span style={{ color: '#9CA3AF', fontSize: '14px' }}>{c.spots_left} spots left</span>
                  </div>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '8px' }}>{c.date} • {c.time}</p>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                      {c.studio_user_id ? '✓ Linked to studio' : 'Assign to studio'}
                    </label>
                    <select
                      value={c.studio_user_id || ''}
                      onChange={async e => {
                        await fetch(`/api/admin/classes/${c.id}/assign`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ studio_user_id: e.target.value || null }),
                        })
                        loadData()
                      }}
                      style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '13px' }}
                    >
                      <option value="">— Unlinked —</option>
                      {studios.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.studio_name} ({s.email})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => {
                      setEditingClass({ ...c, slots: (c.slots || []).length > 0 ? c.slots.map((s: any) => ({ ...s, spots: String(s.spots) })) : [{ date: c.date || '', time: c.time || '', duration: c.duration || '60 min', spots: String(c.spots || 10) }] })
                      setTab('edit')
                    }} style={{ flex: 1, backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', padding: '8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      Edit
                    </button>
                    <button onClick={() => deleteClass(c.id)} style={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {classes.length === 0 && <p style={{ color: '#6B7280' }}>No classes yet. Add one!</p>}
            </div>
          </div>
        )}

        {tab === 'bookings' && !loading && (
          <div>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>Bookings ({bookings.length})</h2>
            <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Order ID', 'Class', 'Student', 'Email', 'Amount', 'Date', ''].map(h => (
                      <th key={h} style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '600', textAlign: 'left', padding: '16px 20px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px 20px', color: '#F97316', fontSize: '14px', fontFamily: 'monospace' }}>{b.order_id?.slice(0, 20)}...</td>
                      <td style={{ padding: '16px 20px', color: 'white', fontSize: '14px' }}>{b.class_name}</td>
                      <td style={{ padding: '16px 20px', color: 'white', fontSize: '14px' }}>{b.first_name} {b.last_name}</td>
                      <td style={{ padding: '16px 20px', color: '#9CA3AF', fontSize: '14px' }}>{b.email}</td>
                      <td style={{ padding: '16px 20px', color: '#4ADE80', fontWeight: 'bold' }}>${b.amount}</td>
                      <td style={{ padding: '16px 20px', color: '#9CA3AF', fontSize: '14px' }}>{new Date(b.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this booking and restore the spot?')) return
                            await fetch(`/api/admin/bookings/${b.id}`, { method: 'DELETE' })
                            loadData()
                          }}
                          style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <p style={{ color: '#6B7280', textAlign: 'center', padding: '48px' }}>No bookings yet</p>}
            </div>
          </div>
        )}

        {tab === 'applications' && !loading && (
          <div>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>Studio Applications ({applications.length})</h2>
            <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Name', 'Studio', 'Email', 'Instagram', 'Phone', 'Date'].map(h => (
                      <th key={h} style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '600', textAlign: 'left', padding: '16px 20px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px 20px', color: 'white', fontSize: '14px' }}>{a.name}</td>
                      <td style={{ padding: '16px 20px', color: 'white', fontSize: '14px' }}>{a.studio_name}</td>
                      <td style={{ padding: '16px 20px', color: '#9CA3AF', fontSize: '14px' }}>{a.email}</td>
                      <td style={{ padding: '16px 20px', color: '#9CA3AF', fontSize: '14px' }}>{a.instagram}</td>
                      <td style={{ padding: '16px 20px', color: '#9CA3AF', fontSize: '14px' }}>{a.phone}</td>
                      <td style={{ padding: '16px 20px', color: '#9CA3AF', fontSize: '14px' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {applications.length === 0 && <p style={{ color: '#6B7280', textAlign: 'center', padding: '48px' }}>No applications yet</p>}
            </div>
          </div>
        )}

        {tab === 'studios' && !loading && (
          <div>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>Studio Accounts ({studios.length})</h2>
            <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Studio', 'Email', 'Status', 'Joined', 'Action'].map(h => (
                      <th key={h} style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '600', textAlign: 'left', padding: '16px 20px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studios.map((s: any) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px 20px', color: 'white', fontSize: '14px' }}>{s.studio_name}</td>
                      <td style={{ padding: '16px 20px', color: '#9CA3AF', fontSize: '14px' }}>{s.email}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ backgroundColor: s.approved ? 'rgba(34,197,94,0.2)' : 'rgba(249,115,22,0.2)', color: s.approved ? '#4ADE80' : '#F97316', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                          {s.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#9CA3AF', fontSize: '14px' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
                        {!s.approved && (
                          <>
                            <button
                              onClick={async () => {
                                const res = await fetch(`/api/admin/studios/${s.id}/approve`, { method: 'POST' })
                                const data = await res.json()
                                if (data.emailError) alert('Approved but email failed: ' + data.emailError)
                                loadData()
                              }}
                              style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ADE80', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm('Decline this studio?')) return
                                await fetch(`/api/admin/studios/${s.id}/decline`, { method: 'POST' })
                                loadData()
                              }}
                              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {studios.length === 0 && <p style={{ color: '#6B7280', textAlign: 'center', padding: '48px' }}>No studio accounts yet</p>}
            </div>
          </div>
        )}

        {tab === 'edit' && editingClass && (
          <div style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <button onClick={() => { setTab('classes'); setEditingClass(null) }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#9CA3AF', padding: '8px 16px', borderRadius: '999px', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
              <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px' }}>Edit Class</h2>
            </div>
            <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Assign to studio */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Studio Account</label>
                <select value={editingClass.studio_user_id || ''} onChange={e => { const s = studios.find((x: any) => x.id === e.target.value); setEditingClass((c: any) => ({ ...c, studio_user_id: e.target.value, studio: s?.studio_name || c.studio })) }} style={inputStyle}>
                  <option value="">— Unlinked —</option>
                  {studios.map((s: any) => <option key={s.id} value={s.id}>{s.studio_name} ({s.email})</option>)}
                </select>
              </div>

              {/* Basic fields */}
              {[{ label: 'Class Title', key: 'title' }, { label: 'Studio Name', key: 'studio' }, { label: 'Instructor', key: 'instructor' }, { label: 'Distance (e.g. 1.2 mi)', key: 'distance' }].map(f => (
                <div key={f.key}>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                  <input value={editingClass[f.key] || ''} onChange={e => setEditingClass((c: any) => ({ ...c, [f.key]: e.target.value }))} style={inputStyle} />
                </div>
              ))}

              {/* Time Slots */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Time Slots</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(editingClass.slots || []).map((slot: any, i: number) => (
                    <div key={i} style={{ backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#F97316', fontSize: '13px', fontWeight: '700' }}>Slot {i + 1}</span>
                        {editingClass.slots.length > 1 && <button type="button" onClick={() => setEditingClass((c: any) => ({ ...c, slots: c.slots.filter((_: any, j: number) => j !== i) }))} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '18px', cursor: 'pointer' }}>×</button>}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Day / Date</label>
                          <input
                            type="date"
                            value={slot.rawDate || ''}
                            onChange={e => setEditingClass((c: any) => ({ ...c, slots: c.slots.map((s: any, j: number) => j === i ? { ...s, rawDate: e.target.value, date: formatDateValue(e.target.value) || s.date } : s) }))}
                            style={inputStyle}
                          />
                          {slot.date && <p style={{ color: '#6B7280', fontSize: '11px', marginTop: '3px' }}>{slot.date}</p>}
                        </div>
                        <div>
                          <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Time</label>
                          <select value={slot.time || ''} onChange={e => setEditingClass((c: any) => ({ ...c, slots: c.slots.map((s: any, j: number) => j === i ? { ...s, time: e.target.value } : s) }))} style={inputStyle}>
                            <option value="">— Select time —</option>
                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Duration</label>
                          <select value={slot.duration || '60 min'} onChange={e => setEditingClass((c: any) => ({ ...c, slots: c.slots.map((s: any, j: number) => j === i ? { ...s, duration: e.target.value } : s) }))} style={inputStyle}>
                            {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Spots</label>
                          <input value={slot.spots || ''} onChange={e => setEditingClass((c: any) => ({ ...c, slots: c.slots.map((s: any, j: number) => j === i ? { ...s, spots: e.target.value } : s) }))} style={inputStyle} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setEditingClass((c: any) => ({ ...c, slots: [...(c.slots || []), { date: '', time: '', duration: '60 min', spots: '10' }] }))}
                  style={{ marginTop: '10px', width: '100%', background: 'rgba(249,115,22,0.08)', border: '1px dashed rgba(249,115,22,0.4)', color: '#F97316', padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  + Add Another Slot
                </button>
              </div>

              {/* Description & Instructor Background */}
              {[{ label: 'Description', key: 'description' }, { label: 'Instructor Background', key: 'instructor_background' }].map(f => (
                <div key={f.key}>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                  <textarea value={editingClass[f.key] || ''} onChange={e => setEditingClass((c: any) => ({ ...c, [f.key]: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
                </div>
              ))}

              {/* Video URL */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Video URL</label>
                <input type="url" value={editingClass.video_url || ''} onChange={e => setEditingClass((c: any) => ({ ...c, video_url: e.target.value }))} placeholder="Instagram Reel or YouTube link..." style={inputStyle} />
              </div>

              {/* Image */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Image URL</label>
                <input value={editingClass.image || ''} onChange={e => setEditingClass((c: any) => ({ ...c, image: e.target.value }))} placeholder="https://..." style={inputStyle} />
                {editingClass.image && <img src={editingClass.image} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />}
              </div>

              {/* Category, Subcategory, Level, Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[{ label: 'Category', key: 'category', options: ['Sports', 'Music', 'Dance'] }, { label: 'Level', key: 'level', options: ['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Kids'] }].map(f => (
                  <div key={f.key}>
                    <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                    <select value={editingClass[f.key] || ''} onChange={e => setEditingClass((c: any) => ({ ...c, [f.key]: e.target.value }))} style={inputStyle}>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Subcategory</label>
                  <input value={editingClass.subcategory || ''} onChange={e => setEditingClass((c: any) => ({ ...c, subcategory: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Price ($)</label>
                  <input value={editingClass.price || ''} onChange={e => setEditingClass((c: any) => ({ ...c, price: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              {/* Location */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Location</label>
                <input value={editingClass.room || ''} onChange={e => setEditingClass((c: any) => ({ ...c, room: e.target.value }))} placeholder="Address..." style={inputStyle} />
              </div>

              {/* Recurring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={editingClass.recurring || false} onChange={e => setEditingClass((c: any) => ({ ...c, recurring: e.target.checked }))} id="edit-recurring" />
                <label htmlFor="edit-recurring" style={{ color: '#9CA3AF', fontSize: '14px', cursor: 'pointer' }}>Recurring class (repeats weekly)</label>
              </div>

              <button onClick={handleEditSave} disabled={saving}
                style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {tab === 'reschedule' && (
          <div style={{ maxWidth: '560px' }}>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '8px' }}>Bulk Reschedule</h2>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>Update the schedule for all classes by an instructor at once. Leave fields blank to update all their slots regardless of current day/time.</p>
            <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Instructor name <span style={{ color: '#F97316' }}>*</span></label>
                <input value={reschedule.instructor} onChange={e => setReschedule(r => ({ ...r, instructor: e.target.value }))} placeholder="e.g. Ira Klein" style={inputStyle} />
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '12px', fontWeight: '600' }}>Current schedule (optional — leave blank to match all)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ color: '#6B7280', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Current day</label>
                    <select value={reschedule.oldDay} onChange={e => setReschedule(r => ({ ...r, oldDay: e.target.value }))} style={inputStyle}>
                      <option value="">Any day</option>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#6B7280', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Current time</label>
                    <input value={reschedule.oldTime} onChange={e => setReschedule(r => ({ ...r, oldTime: e.target.value }))} placeholder="e.g. 6:00 PM" style={inputStyle} />
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '12px', fontWeight: '600' }}>New schedule</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ color: '#6B7280', fontSize: '13px', display: 'block', marginBottom: '6px' }}>New day</label>
                    <select value={reschedule.newDay} onChange={e => setReschedule(r => ({ ...r, newDay: e.target.value }))} style={inputStyle}>
                      <option value="">No change</option>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#6B7280', fontSize: '13px', display: 'block', marginBottom: '6px' }}>New time</label>
                    <input value={reschedule.newTime} onChange={e => setReschedule(r => ({ ...r, newTime: e.target.value }))} placeholder="e.g. 7:00 PM" style={inputStyle} />
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!reschedule.instructor) { alert('Enter an instructor name'); return }
                  if (!reschedule.newDay && !reschedule.newTime) { alert('Enter a new day or time'); return }
                  if (!confirm(`Update all classes for "${reschedule.instructor}"?`)) return
                  setRescheduling(true)
                  const res = await fetch('/api/admin/reschedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reschedule),
                  })
                  const data = await res.json()
                  setRescheduling(false)
                  if (res.ok) {
                    alert(`Updated ${data.updated} slot(s) across ${data.classes} class(es)`)
                    setReschedule({ instructor: '', oldDay: '', newDay: '', oldTime: '', newTime: '' })
                    loadData()
                  } else {
                    alert(data.error || 'Failed to reschedule')
                  }
                }}
                disabled={rescheduling}
                style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: rescheduling ? 'not-allowed' : 'pointer', opacity: rescheduling ? 0.7 : 1 }}
              >
                {rescheduling ? 'Updating...' : 'Apply Reschedule'}
              </button>
            </div>
          </div>
        )}

        {tab === 'add' && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>Add New Class</h2>
            <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Assign to studio account */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Assign to Studio Account</label>
                <select
                  value={(newClass as any).studio_user_id || ''}
                  onChange={e => {
                    const selected = studios.find((s: any) => s.id === e.target.value)
                    setNewClass(n => ({ ...n, studio_user_id: e.target.value, studio: selected?.studio_name || n.studio }))
                  }}
                  style={inputStyle}
                >
                  <option value="">— No account (unlinked) —</option>
                  {studios.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.studio_name} ({s.email})</option>
                  ))}
                </select>
                <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '6px' }}>Linking a class to an account lets that studio see and edit it in their dashboard.</p>
              </div>

              {/* Studio Name & Distance (admin-only fields) */}
              {[{ label: 'Studio Name', key: 'studio' }, { label: 'Distance (e.g. 1.2 mi)', key: 'distance' }].map(f => (
                <div key={f.key}>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                  <input value={(newClass as any)[f.key]} onChange={e => setNewClass(n => ({ ...n, [f.key]: e.target.value }))} style={inputStyle} />
                </div>
              ))}

              {/* Title & Instructor */}
              {[{ label: 'Class Title', key: 'title' }, { label: 'Instructor', key: 'instructor' }].map(f => (
                <div key={f.key}>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                  <input value={(newClass as any)[f.key]} onChange={e => setNewClass(n => ({ ...n, [f.key]: e.target.value }))} style={inputStyle} />
                </div>
              ))}

              {/* Time Slots */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Time Slots</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {newClass.slots.map((slot, i) => (
                    <div key={i} style={{ backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#F97316', fontSize: '13px', fontWeight: '700' }}>Slot {i + 1}</span>
                        {newClass.slots.length > 1 && (
                          <button type="button" onClick={() => setNewClass(n => ({ ...n, slots: n.slots.filter((_, j) => j !== i) }))}
                            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '18px', cursor: 'pointer' }}>×</button>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Date</label>
                          <input type="date" value={(slot as any).rawDate || ''} onChange={e => setNewClass(n => ({ ...n, slots: n.slots.map((s, j) => j === i ? { ...s, rawDate: e.target.value, date: formatDateValue(e.target.value) } : s) }))} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Time</label>
                          <select value={(slot as any).time || ''} onChange={e => setNewClass(n => ({ ...n, slots: n.slots.map((s, j) => j === i ? { ...s, time: e.target.value } : s) }))} style={inputStyle}>
                            <option value="">— Select time —</option>
                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Duration</label>
                          <select value={(slot as any).duration || '60 min'} onChange={e => setNewClass(n => ({ ...n, slots: n.slots.map((s, j) => j === i ? { ...s, duration: e.target.value } : s) }))} style={inputStyle}>
                            {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ color: '#6B7280', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Spots</label>
                          <input value={(slot as any).spots || ''} onChange={e => setNewClass(n => ({ ...n, slots: n.slots.map((s, j) => j === i ? { ...s, spots: e.target.value } : s) }))} style={inputStyle} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setNewClass(n => ({ ...n, slots: [...n.slots, { ...EMPTY_SLOT }] }))}
                  style={{ marginTop: '10px', width: '100%', background: 'rgba(249,115,22,0.08)', border: '1px dashed rgba(249,115,22,0.4)', color: '#F97316', padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  + Add Another Time Slot
                </button>
              </div>

              {/* Description */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea value={newClass.description} onChange={e => setNewClass(n => ({ ...n, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
              </div>
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Instructor Background</label>
                <textarea value={(newClass as any).instructor_background || ''} onChange={e => setNewClass(n => ({ ...n, instructor_background: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
              </div>

              {/* Location Types */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Where does the class take place?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { value: 'location', label: 'One Location', priceKey: 'price_location' },
                    { value: 'online', label: 'Online', priceKey: 'price_online' },
                    { value: 'residence', label: 'Can Come to Residence', priceKey: 'price_residence' },
                  ].map(opt => {
                    const types: string[] = newClass.location_types || []
                    const selected = types.includes(opt.value)
                    const toggle = () => {
                      const next = selected ? types.filter(t => t !== opt.value) : [...types, opt.value]
                      setNewClass(n => ({ ...n, location_types: next, location_type: next[0] || 'location' }))
                    }
                    return (
                      <div key={opt.value}>
                        <button type="button" onClick={toggle}
                          style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', border: selected ? '2px solid #F97316' : '1px solid rgba(255,255,255,0.1)', backgroundColor: selected ? 'rgba(249,115,22,0.08)' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: selected ? '2px solid #F97316' : '2px solid rgba(255,255,255,0.2)', backgroundColor: selected ? '#F97316' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selected && <span style={{ color: 'white', fontSize: '11px', fontWeight: '900' }}>✓</span>}
                          </div>
                          <span style={{ color: selected ? '#F97316' : 'white', fontWeight: '600', fontSize: '14px' }}>{opt.label}</span>
                        </button>
                        {selected && (
                          <div style={{ marginTop: '8px', paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ color: '#9CA3AF', fontSize: '13px', whiteSpace: 'nowrap' }}>Price ($)</label>
                            <input type="number" value={(newClass as any)[opt.priceKey] || ''} onChange={e => setNewClass(n => ({ ...n, [opt.priceKey]: e.target.value, price: e.target.value }))} style={{ ...inputStyle, width: '120px' }} />
                          </div>
                        )}
                        {selected && opt.value === 'location' && (
                          <div style={{ marginTop: '8px', paddingLeft: '12px' }}>
                            <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Address</label>
                            <input value={newClass.room} onChange={e => setNewClass(n => ({ ...n, room: e.target.value }))} placeholder="Enter address" style={inputStyle} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Video URL <span style={{ color: '#6B7280', fontWeight: '400' }}>(optional)</span></label>
                <input type="url" value={(newClass as any).video_url || ''} onChange={e => setNewClass(n => ({ ...n, video_url: e.target.value }))} placeholder="Instagram Reel or YouTube link..." style={inputStyle} />
              </div>

              {/* Image Upload */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Class Image <span style={{ color: '#6B7280', fontWeight: '400' }}>(used if no video)</span></label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ ...inputStyle, padding: '10px 16px', cursor: 'pointer' }} />
                {uploading && <p style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '6px' }}>Uploading...</p>}
                {newClass.image && !uploading && <img src={newClass.image} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />}
              </div>

              {/* Category, Subcategory, Level */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Category</label>
                  <select value={newClass.category} onChange={e => setNewClass(n => ({ ...n, category: e.target.value, subcategory: '' }))} style={inputStyle}>
                    {['Sports', 'Music', 'Dance'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Subcategory</label>
                  <select
                    value={(SUBCATEGORIES[newClass.category] || []).includes(newClass.subcategory) ? newClass.subcategory : newClass.subcategory ? '__other__' : ''}
                    onChange={e => setNewClass(n => ({ ...n, subcategory: e.target.value === '__other__' ? '__other__' : e.target.value }))}
                    style={inputStyle}>
                    <option value="">— Select —</option>
                    {(SUBCATEGORIES[newClass.category] || []).map(s => <option key={s}>{s}</option>)}
                    <option value="__other__">Other (specify below)</option>
                  </select>
                  {(newClass.subcategory === '__other__' || (newClass.subcategory && !(SUBCATEGORIES[newClass.category] || []).includes(newClass.subcategory))) && (
                    <input value={newClass.subcategory === '__other__' ? '' : newClass.subcategory} onChange={e => setNewClass(n => ({ ...n, subcategory: e.target.value }))} placeholder="e.g. Cello, Badminton..." style={{ ...inputStyle, marginTop: '8px' }} />
                  )}
                </div>
              </div>
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Level</label>
                <select value={newClass.level} onChange={e => setNewClass(n => ({ ...n, level: e.target.value }))} style={inputStyle}>
                  {['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Kids'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              <button onClick={handleAddClass} disabled={saving} style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: '8px' }}>
                {saving ? 'Saving...' : 'Add Class'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
