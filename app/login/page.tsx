'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    const res = await fetch('/api/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push('/account')
  }

  const inputStyle = {
    width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none',
    fontSize: '14px', boxSizing: 'border-box' as const,
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0A0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ color: 'white', fontWeight: '900', fontSize: '28px', textDecoration: 'none' }}>Frolic</Link>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginTop: '24px', marginBottom: '8px' }}>Welcome back</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Log in to your account</p>
        </div>

        <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inputStyle} />
          </div>

          {error && <p style={{ color: '#F87171', fontSize: '14px', margin: 0 }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <p style={{ color: '#6B7280', fontSize: '14px', textAlign: 'center', margin: 0 }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#F97316', textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
