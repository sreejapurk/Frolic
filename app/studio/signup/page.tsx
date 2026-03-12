'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function StudioSignupPage() {
  const [form, setForm] = useState({ studioName: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.studioName || !form.email || !form.password) { setError('All fields are required'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const res = await fetch('/api/studio/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studioName: form.studioName, email: form.email, password: form.password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error) } else { setSubmitted(true) }
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card animate-fade-up" style={{ padding: '48px 40px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>✓</div>
        <h1 style={{ color: 'white', fontWeight: '800', fontSize: '24px', marginBottom: '12px', letterSpacing: '-0.5px' }}>Application Submitted!</h1>
        <p style={{ color: '#9CA3AF', marginBottom: '8px', lineHeight: '1.6' }}>We'll review your application and reach out to <strong style={{ color: 'white' }}>{form.email}</strong> once approved.</p>
        <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '32px' }}>This usually takes 1-2 business days.</p>
        <Link href="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>Back to Frolic</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
        <div className="card" style={{ padding: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '36px' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>Frolic</span>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F97316', display: 'inline-block' }} />
          </Link>

          <div className="badge badge-orange" style={{ marginBottom: '16px' }}>For Studios</div>
          <h1 style={{ color: 'white', fontWeight: '800', fontSize: '26px', marginBottom: '6px', letterSpacing: '-0.5px' }}>List your studio</h1>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '32px' }}>Apply to reach thousands of students in your area</p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#F87171', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Studio Name', name: 'studioName', type: 'text', placeholder: 'Your Studio Name' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'studio@example.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: '8+ characters' },
              { label: 'Confirm Password', name: 'confirm', type: 'password', placeholder: 'Repeat password' },
            ].map(f => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input name={f.name} type={f.type} value={(form as any)[f.name]} onChange={handleChange} className="input" placeholder={f.placeholder} />
              </div>
            ))}
            <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              {loading ? 'Submitting...' : 'Apply to Join →'}
            </button>
          </div>

          <hr className="divider" />

          <p style={{ color: '#6B7280', fontSize: '14px', textAlign: 'center' }}>
            Already approved?{' '}
            <Link href="/studio/login" style={{ color: '#F97316', textDecoration: 'none', fontWeight: '600' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
