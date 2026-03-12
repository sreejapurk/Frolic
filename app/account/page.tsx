'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AccountPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/customer/me')
      .then(r => { if (r.status === 401) { router.push('/login'); return null } return r.json() })
      .then(d => { if (d) setData(d); setLoading(false) })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/customer/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0A0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6B7280' }}>Loading...</p>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0A0F1A' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#1A2332', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href="/" style={{ color: 'white', fontWeight: '900', fontSize: '20px', textDecoration: 'none' }}>Frolic</Link>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#9CA3AF', padding: '8px 16px', borderRadius: '999px', fontSize: '14px', cursor: 'pointer' }}>Log Out</button>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>
            Hey, {data?.customer?.first_name} 👋
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>{data?.customer?.email}</p>
        </div>

        <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
          My Bookings ({data?.bookings?.length || 0})
        </h2>

        {data?.bookings?.length === 0 ? (
          <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎭</p>
            <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '16px' }}>No bookings yet</p>
            <Link href="/" style={{ backgroundColor: '#F97316', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
              Browse Classes
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.bookings?.map((b: any) => (
              <div key={b.id} style={{ backgroundColor: '#1A2332', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{b.class_name}</p>
                  <p style={{ color: '#6B7280', fontSize: '13px' }}>Order #{b.order_id}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#F97316', fontWeight: '700', fontSize: '16px' }}>${b.amount}</p>
                  <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px', backgroundColor: b.payment_status === 'paid' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)', color: b.payment_status === 'paid' ? '#4ADE80' : '#FBBF24' }}>
                    {b.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
