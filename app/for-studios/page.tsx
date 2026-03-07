'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'

const FEATURES = [
  { title: 'Reach New Students', desc: 'Get discovered by thousands of creative learners in your area looking for their next class. Our community is always growing.' },
  { title: 'Fill Your Classes', desc: 'Maximize attendance with our smart booking system and automated reminders.' },
  { title: 'Simple Pricing', desc: 'No upfront costs. Pay only when students book. Keep more of what you earn.' },
  { title: 'Community First', desc: 'Join a network that values local studios and supports the creative community.' },
]

export default function ForStudiosPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', studio: '', email: '', instagram: '', phone: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    setLoading(true)
    await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#0F1624' }}>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '2px solid #22C55E' }}>
            <span style={{ fontSize: '40px' }}>✓</span>
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: '900', color: 'white', marginBottom: '12px', textAlign: 'center' }}>Thank You for Your Application</h1>
          <p style={{ color: '#9CA3AF', fontSize: '18px', marginBottom: '32px', textAlign: 'center' }}>A member from our team will be in touch shortly about next steps.</p>
          <button onClick={() => setSubmitted(false)} style={{ backgroundColor: '#F97316', border: 'none', color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            Back to Partner Info
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0F1624' }}>
      <Navbar />
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px' }}>
        <div id="partner-form" style={{ marginBottom: '80px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>
            Grow Your Studio with Frolic — <span style={{ color: '#F97316' }}>Partner Application</span>
          </h1>
          <p style={{ color: '#9CA3AF', marginBottom: '32px' }}>Fill out the form below to learn what Frolic can do for your business.</p>
          <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Name*', name: 'name' },
              { label: 'Studio name*', name: 'studio' },
              { label: 'Email*', name: 'email' },
              { label: 'Link to Instagram or website*', name: 'instagram' },
              { label: 'Phone number*', name: 'phone' },
            ].map(field => (
              <div key={field.name}>
                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px', display: 'block', marginBottom: '8px' }}>{field.label}</label>
                <input
                  name={field.name}
                  value={(form as any)[field.name]}
                  onChange={handleChange}
                  style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
        <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: '8px' }}>Why Studios Love Frolic</h2>
        <p style={{ color: '#9CA3AF', textAlign: 'center', marginBottom: '48px' }}>Sell out classes in 3 clicks</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '80px' }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '28px', border: i === 3 ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ color: '#9CA3AF' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
