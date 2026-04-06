'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SUBCATEGORIES: Record<string, string[]> = {
  Music: ['Piano', 'Guitar', 'Vocals', 'Drums', 'Violin', 'Flute', 'Ukulele', 'Bass', 'Saxophone', 'Trumpet', 'Keyboard', 'Harp'],
  Sports: ['Basketball', 'Soccer', 'Tennis', 'Swimming', 'Yoga', 'Pilates', 'Boxing', 'Martial Arts', 'Golf', 'Running', 'Cycling', 'CrossFit', 'Gymnastics', 'Skating'],
  Dance: ['Ballet', 'Hip Hop', 'Salsa', 'Contemporary', 'Ballroom', 'Jazz', 'Tap', 'K-Pop', 'Zumba', 'Swing', 'Belly Dance', 'Flamenco'],
}

const inputStyle = { width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' as const }

export default function AccountPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'bookings' | 'classes'>('bookings')
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch('/api/customer/me')
      .then(r => { if (r.status === 401) { router.push('/login'); return null } return r.json() })
      .then(d => { if (d) setData(d); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const handleLogout = async () => {
    await fetch('/api/customer/logout', { method: 'POST' })
    router.push('/')
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/customer/classes/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    setSaving(false)
    if (res.ok) { setEditing(null); load() }
    else { const err = await res.json().catch(() => ({})); alert('Failed to save: ' + (err.error || res.status)) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class?')) return
    await fetch(`/api/customer/classes/${id}`, { method: 'DELETE' })
    load()
  }

  const updateSlot = (i: number, key: string, val: string) => {
    setEditing((e: any) => ({ ...e, slots: e.slots.map((s: any, j: number) => j === i ? { ...s, [key]: val } : s) }))
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0A0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6B7280' }}>Loading...</p>
    </main>
  )

  const isStudio = !!data?.studioName

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0A0F1A' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#1A2332', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ color: 'white', fontWeight: '900', fontSize: '20px', textDecoration: 'none' }}>Frolic</Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['bookings', ...(isStudio ? ['classes'] : [])].map(t => (
            <button key={t} onClick={() => setTab(t as any)}
              style={{ padding: '8px 18px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', backgroundColor: tab === t ? '#F97316' : 'transparent', color: 'white' }}>
              {t === 'bookings' ? 'My Bookings' : 'My Classes'}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#9CA3AF', padding: '8px 16px', borderRadius: '999px', fontSize: '14px', cursor: 'pointer' }}>Log Out</button>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>
            Hey, {data?.customer?.first_name}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>{data?.customer?.email}{isStudio && ` · ${data.studioName}`}</p>
        </div>

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
              My Bookings ({data?.bookings?.length || 0})
            </h2>
            {data?.bookings?.length === 0 ? (
              <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎭</p>
                <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '16px' }}>No bookings yet</p>
                <Link href="/" style={{ backgroundColor: '#F97316', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
                  Browse Classes
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data?.bookings?.map((b: any) => (
                  <div key={b.id} style={{ backgroundColor: '#1A2332', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{b.class_name}</p>
                      <p style={{ color: '#6B7280', fontSize: '13px' }}>Order #{b.order_id}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#F97316', fontWeight: '700', fontSize: '16px' }}>${b.amount}</p>
                      <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px', backgroundColor: b.payment_status === 'paid' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)', color: b.payment_status === 'paid' ? '#4ADE80' : '#FBBF24' }}>
                        {b.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* MY CLASSES TAB */}
        {tab === 'classes' && (
          <>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
              My Classes ({data?.studioClasses?.length || 0})
            </h2>

            {/* Edit panel */}
            {editing && (
              <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '28px', border: '2px solid #F97316', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ color: '#F97316', fontWeight: '800', fontSize: '18px' }}>Editing: {editing.title}</h3>
                  <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '22px', cursor: 'pointer' }}>×</button>
                </div>

                {[
                  { label: 'Class Title', key: 'title' },
                  { label: 'Instructor', key: 'instructor' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                    <input value={editing[f.key] || ''} onChange={e => setEditing((ed: any) => ({ ...ed, [f.key]: e.target.value }))} style={inputStyle} />
                  </div>
                ))}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Category</label>
                    <select value={editing.category || 'Sports'} onChange={e => setEditing((ed: any) => ({ ...ed, category: e.target.value, subcategory: '' }))} style={inputStyle}>
                      {['Sports', 'Music', 'Dance'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Subcategory</label>
                    <select value={editing.subcategory || ''} onChange={e => setEditing((ed: any) => ({ ...ed, subcategory: e.target.value }))} style={inputStyle}>
                      <option value="">— Select —</option>
                      {(SUBCATEGORIES[editing.category] || []).map((s: string) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Price ($)</label>
                    <input value={editing.price || ''} onChange={e => setEditing((ed: any) => ({ ...ed, price: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Level</label>
                    <select value={editing.level || 'Beginner'} onChange={e => setEditing((ed: any) => ({ ...ed, level: e.target.value }))} style={inputStyle}>
                      {['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Kids'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Description</label>
                  <textarea value={editing.description || ''} onChange={e => setEditing((ed: any) => ({ ...ed, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
                </div>

                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Time Slots</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(editing.slots || []).map((slot: any, i: number) => (
                      <div key={i} style={{ backgroundColor: '#0F1624', borderRadius: '10px', padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                        {[
                          { label: 'Day / Date', key: 'date' },
                          { label: 'Time', key: 'time' },
                          { label: 'Duration', key: 'duration' },
                          { label: 'Spots', key: 'spots' },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ color: '#6B7280', fontSize: '11px', display: 'block', marginBottom: '3px' }}>{f.label}</label>
                            <input value={slot[f.key] || ''} onChange={e => updateSlot(i, f.key, e.target.value)} style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }} />
                          </div>
                        ))}
                        {editing.slots.length > 1 && (
                          <button onClick={() => setEditing((ed: any) => ({ ...ed, slots: ed.slots.filter((_: any, j: number) => j !== i) }))}
                            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '18px', cursor: 'pointer', paddingBottom: '4px' }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setEditing((ed: any) => ({ ...ed, slots: [...(ed.slots || []), { date: '', time: '', duration: '60 min', spots: '10' }] }))}
                    style={{ marginTop: '8px', width: '100%', background: 'rgba(249,115,22,0.08)', border: '1px dashed rgba(249,115,22,0.4)', color: '#F97316', padding: '8px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    + Add Slot
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleSave} disabled={saving}
                    style={{ flex: 1, backgroundColor: '#F97316', border: 'none', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditing(null)}
                    style={{ padding: '14px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'none', color: '#9CA3AF', cursor: 'pointer', fontWeight: '600' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {data?.studioClasses?.length === 0 ? (
              <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ color: '#6B7280', fontSize: '16px' }}>No classes yet. Ask an admin to link your classes to your account.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {data?.studioClasses?.map((c: any) => (
                  <div key={c.id} style={{ backgroundColor: '#1A2332', borderRadius: '12px', padding: '20px', border: editing?.id === c.id ? '2px solid #F97316' : '1px solid rgba(255,255,255,0.1)' }}>
                    {c.image && <img src={c.image} alt={c.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />}
                    <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{c.title}</h3>
                    <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '4px' }}>{c.category}{c.subcategory ? ` · ${c.subcategory}` : ''}</p>
                    <p style={{ color: '#F97316', fontWeight: '700', marginBottom: '4px' }}>${c.price}</p>
                    <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '12px' }}>{c.slots?.length || 0} slot{c.slots?.length !== 1 ? 's' : ''}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setEditing({ ...c, slots: (c.slots || []).length > 0 ? c.slots.map((s: any) => ({ ...s, spots: String(s.spots) })) : [{ date: c.date || '', time: c.time || '', duration: c.duration || '60 min', spots: String(c.spots || 10) }] })}
                        style={{ flex: 1, backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', padding: '8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(c.id)}
                        style={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
