'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    const res = await fetch('/api/customer/signup', {
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
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginTop: '24px', marginBottom: '8px' }}>Create your account</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Book classes and track your activity</p>
        </div>

        <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '6px' }}>First name</label>
              <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Last name</label>
              <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" style={inputStyle} />
          </div>

          {error && <p style={{ color: '#F87171', fontSize: '14px', margin: 0 }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p style={{ color: '#6B7280', fontSize: '14px', textAlign: 'center', margin: 0 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#F97316', textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
