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
    if (!res.ok) { setError(data.error) } else { router.push('/studio/dashboard') }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        <div className="card" style={{ padding: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '36px' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>Frolic</span>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F97316', display: 'inline-block' }} />
          </Link>

          <h1 style={{ color: 'white', fontWeight: '800', fontSize: '26px', marginBottom: '6px', letterSpacing: '-0.5px' }}>Welcome back</h1>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '32px' }}>Sign in to your studio account</p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#F87171', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleSubmit()} className="input" placeholder="you@studio.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleSubmit()} className="input" placeholder="••••••••" />
            </div>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>

          <hr className="divider" />

          <p style={{ color: '#6B7280', fontSize: '14px', textAlign: 'center' }}>
            New to Frolic?{' '}
            <Link href="/studio/signup" style={{ color: '#F97316', textDecoration: 'none', fontWeight: '600' }}>Apply to join</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
