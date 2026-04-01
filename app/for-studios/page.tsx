import Navbar from '@/components/Navbar'
import Link from 'next/link'

const FEATURES = [
  { title: 'Reach New Students', desc: 'Get discovered by thousands of creative learners in your area looking for their next class. Our community is always growing.' },
  { title: 'Fill Your Classes', desc: 'Maximize attendance with our smart booking system and automated reminders.' },
  { title: 'Simple Pricing', desc: 'No upfront costs. Pay only when students book. Keep more of what you earn.' },
  { title: 'Community First', desc: 'Join a network that values local studios and supports the creative community.' },
]

export default function ForStudiosPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0F1624' }}>
      <Navbar />
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: '8px' }}>Why Studios Love Frolic</h2>
        <p style={{ color: '#9CA3AF', textAlign: 'center', marginBottom: '48px' }}>Sell out classes in 3 clicks</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '28px', border: i === 3 ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ color: '#9CA3AF' }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', paddingBottom: '80px' }}>
          <Link
            href="/studio/dashboard"
            style={{ display: 'inline-block', backgroundColor: '#F97316', color: 'white', padding: '16px 48px', borderRadius: '16px', fontWeight: '800', fontSize: '18px', textDecoration: 'none', boxShadow: '0 4px 24px rgba(249,115,22,0.35)' }}
          >
            Get Started — List Your Classes →
          </Link>
          <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '12px' }}>No upfront cost. Takes less than 5 minutes.</p>
        </div>
      </section>
    </main>
  )
}
