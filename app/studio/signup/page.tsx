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
    if (!form.studioName || !form.email || !form.password) {
      setError('All fields are required')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    const res = await fetch('/api/studio/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studioName: form.studioName, email: form.email, password: form.password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error)
    } else {
      setSubmitted(true)
    }
  }

  const inputStyle = { width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' as const }

  if (submitted) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F1624', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '2px solid #22C55E', fontSize: '28px' }}>✓</div>
        <h1 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '12px' }}>Application Submitted!</h1>
        <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>We'll review your application and notify you at <strong style={{ color: 'white' }}>{form.email}</strong> once approved.</p>
        <Link href="/" style={{ color: '#F97316', textDecoration: 'none', fontWeight: '600' }}>Back to Frolic</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F1624', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '420px' }}>
        <Link href="/" style={{ color: '#F97316', fontWeight: 'bold', fontSize: '20px', textDecoration: 'none', display: 'block', marginBottom: '32px' }}>Frolic</Link>
        <h1 style={{ color: 'white', fontWeight: '900', fontSize: '24px', marginBottom: '8px' }}>Create Studio Account</h1>
        <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '32px' }}>Apply to list your classes on Frolic</p>

        {error && <p style={{ color: '#F87171', fontSize: '14px', marginBottom: '16px', backgroundColor: 'rgba(248,113,113,0.1)', padding: '12px', borderRadius: '8px' }}>{error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Studio Name', name: 'studioName', type: 'text' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'Password', name: 'password', type: 'password' },
            { label: 'Confirm Password', name: 'confirm', type: 'password' },
          ].map(f => (
            <div key={f.name}>
              <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>{f.label}</label>
              <input name={f.name} type={f.type} value={(form as any)[f.name]} onChange={handleChange} style={inputStyle} />
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}>
            {loading ? 'Submitting...' : 'Apply to Join'}
          </button>
        </div>

        <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center', marginTop: '24px' }}>
          Already approved?{' '}
          <Link href="/studio/login" style={{ color: '#F97316', textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
