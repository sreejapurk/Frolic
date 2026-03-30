'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [classes, setClasses] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [studios, setStudios] = useState<any[]>([])
  const [tab, setTab] = useState<'classes' | 'bookings' | 'applications' | 'studios' | 'add'>('classes')
  const [loading, setLoading] = useState(false)
  const [newClass, setNewClass] = useState({
    title: '', studio: '', category: 'Music', price: '', level: 'Beginner',
    duration: '60 min', date: '', time: '', spots: '', distance: '',
    rating: '4.9', image: '', instructor: '', room: '',
  })

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
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass),
    })
    if (res.ok) {
      alert('Class added!')
      setTab('classes')
      loadData()
    }
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
          {(['classes', 'bookings', 'applications', 'studios', 'add'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', backgroundColor: tab === t ? '#F97316' : 'transparent', color: 'white' }}>
              {t === 'add' ? '+ Add Class' : t === 'studios' ? 'Studios' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
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
                  <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '12px' }}>{c.date} • {c.time}</p>
                  <button onClick={() => deleteClass(c.id)} style={{ width: '100%', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', padding: '8px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    Delete
                  </button>
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

        {tab === 'add' && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '24px' }}>Add New Class</h2>
            <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Class Title', key: 'title' },
                { label: 'Studio Name', key: 'studio' },
                { label: 'Instructor', key: 'instructor' },
                { label: 'Room', key: 'room' },
                { label: 'Price ($)', key: 'price', type: 'number' },
                { label: 'Total Spots', key: 'spots', type: 'number' },
                { label: 'Date (e.g. Mon, Feb 23)', key: 'date' },
                { label: 'Time (e.g. 6:00 PM)', key: 'time' },
                { label: 'Duration (e.g. 60 min)', key: 'duration' },
                { label: 'Distance (e.g. 1.2 mi)', key: 'distance' },
                { label: 'Image URL', key: 'image' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    value={(newClass as any)[field.key]}
                    onChange={e => setNewClass(n => ({ ...n, [field.key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Category</label>
                  <select value={newClass.category} onChange={e => setNewClass(n => ({ ...n, category: e.target.value }))} style={{ ...inputStyle }}>
                    {['Music', 'Dance', 'Sports'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '6px' }}>Level</label>
                  <select value={newClass.level} onChange={e => setNewClass(n => ({ ...n, level: e.target.value }))} style={{ ...inputStyle }}>
                    {['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'Kids'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleAddClass} style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', marginTop: '8px' }}>
                Add Class
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
