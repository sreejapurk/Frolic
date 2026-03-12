'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const classId = searchParams.get('classId')
  const [classData, setClassData] = useState<any>(null)

  useEffect(() => {
    if (!classId) return
    fetch(`/api/classes/${classId}`).then(r => r.json()).then(setClassData)
  }, [classId])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0A0F1A' }}>
      <Navbar />
      <div className="section" style={{ padding: '64px 24px', maxWidth: '680px' }}>

        {/* Header */}
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px', animation: 'pulse-glow 2s infinite' }}>
            🎉
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: '900', color: 'white', marginBottom: '10px', letterSpacing: '-1px' }}>You're booked!</h1>
          <p style={{ color: '#9CA3AF', fontSize: '17px' }}>Your booking is confirmed and a receipt has been sent to your email.</p>
        </div>

        {/* Order card */}
        <div className="card animate-fade-up" style={{ padding: '32px', marginBottom: '20px', animationDelay: '100ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p className="label">Order Number</p>
              <p style={{ color: '#F97316', fontWeight: '700', fontSize: '18px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{orderId}</p>
            </div>
            <span className="badge badge-green" style={{ fontSize: '13px' }}>✓ Payment Confirmed</span>
          </div>

          {/* Email notice */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(249,115,22,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>✉️</div>
            <div>
              <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>Confirmation email sent</p>
              <p style={{ color: '#6B7280', fontSize: '13px' }}>Check your inbox for full booking details from hello@joinfrolic.com</p>
            </div>
          </div>

          {classData && (
            <>
              <hr className="divider" />
              <h2 style={{ color: 'white', fontWeight: '700', fontSize: '17px', marginBottom: '20px' }}>Class Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '🎭', label: 'Class', value: classData.title },
                  { icon: '👤', label: 'Instructor', value: classData.instructor },
                  { icon: '📅', label: 'Date & Time', value: `${classData.date} at ${classData.time}` },
                  { icon: '⏱️', label: 'Duration', value: classData.duration },
                  { icon: '📍', label: 'Location', value: `${classData.studio}${classData.room ? ` · ${classData.room}` : ''}` },
                ].filter(d => d.value).map(detail => (
                  <div key={detail.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{detail.icon}</div>
                    <div>
                      <p className="label" style={{ marginBottom: '2px' }}>{detail.label}</p>
                      <p style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{detail.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Important info */}
        <div className="animate-fade-up" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '14px', padding: '20px 24px', marginBottom: '24px', animationDelay: '200ms' }}>
          <h3 style={{ color: 'white', fontWeight: '700', fontSize: '15px', marginBottom: '12px' }}>Before you go</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0 }}>
            {[
              'Arrive 10 minutes before class starts',
              'Wear comfortable clothing',
              'Full refund available if cancelled 24 hours before',
              'Contact the studio directly if you need to reschedule',
            ].map(item => (
              <li key={item} style={{ color: '#D1D5DB', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#F97316', marginTop: '1px', flexShrink: 0 }}>·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', animationDelay: '250ms' }}>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>Browse More Classes</Link>
          <button onClick={() => window.print()} className="btn-secondary">Print Receipt</button>
        </div>
      </div>
    </main>
  )
}

export default function ConfirmationPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0A0F1A' }} />}><ConfirmationContent /></Suspense>
}
