'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const EMPTY_CLASS = {
  title: '', category: 'Sports', price: '', level: 'Beginner',
  date: '', time: '', spots: '',
  rating: '4.9', image: '', instructor: '', room: '',
}

const inputStyle = { width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' as const }

function ClassForm({ data, setData, onSave, saving, saveLabel }: any) {
  return (
    <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {[
        { label: 'Class Title', key: 'title' },
        { label: 'Instructor', key: 'instructor' },
        { label: 'Location', key: 'room' },
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
    else alert('Failed to add class')
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
      </div>
    </div>
  )
}
