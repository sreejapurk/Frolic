'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StudioLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    const res = await fetch('/api/studio/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error)
    } else {
      router.push('/studio/dashboard')
    }
  }

  const inputStyle = { width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' as const }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F1624', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '420px' }}>
        <Link href="/" style={{ color: '#F97316', fontWeight: 'bold', fontSize: '20px', textDecoration: 'none', display: 'block', marginBottom: '32px' }}>Frolic</Link>
        <h1 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '8px' }}>Studio Login</h1>
        <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '32px' }}>Manage your classes on Frolic</p>

        {error && <p style={{ color: '#F87171', fontSize: '14px', marginBottom: '16px', backgroundColor: 'rgba(248,113,113,0.1)', padding: '12px', borderRadius: '8px' }}>{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inputStyle} />
          </div>
          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </div>

        <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center', marginTop: '24px' }}>
          New studio?{' '}
          <Link href="/studio/signup" style={{ color: '#F97316', textDecoration: 'none', fontWeight: '600' }}>Apply to join</Link>
        </p>
      </div>
    </div>
  )
}
