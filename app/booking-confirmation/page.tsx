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
    <main style={{ minHeight: '100vh', backgroundColor: '#0F1624' }}>
      <Navbar />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>Congratulations!</h1>
          <p style={{ color: '#9CA3AF', fontSize: '18px' }}>Your booking has been completed successfully</p>
        </div>
        <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '8px' }}>Order Number</p>
            <p style={{ color: '#F97316', fontWeight: 'bold', fontSize: '24px', fontFamily: 'monospace' }}>{orderId}</p>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#0F1624', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '24px' }}>✉️</span>
              <div>
                <p style={{ color: 'white', fontWeight: '600', marginBottom: '4px' }}>Confirmation email sent</p>
                <p style={{ color: '#9CA3AF', fontSize: '14px' }}>A confirmation has been sent to your email</p>
              </div>
            </div>
          </div>
          {classData && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '20px' }}>Class Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '4px' }}>Class</p>
                  <p style={{ color: 'white', fontWeight: 'bold' }}>{classData.title}</p>
                </div>
                <div>
                  <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '4px' }}>Instructor</p>
                  <p style={{ color: 'white', fontWeight: '600' }}>{classData.instructor}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ color: '#9CA3AF' }}>📅</span>
                  <div>
                    <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '4px' }}>Date & Time</p>
                    <p style={{ color: 'white', fontWeight: '600' }}>{classData.date} at {classData.time}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ color: '#9CA3AF' }}>🕐</span>
                  <div>
                    <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '4px' }}>Duration</p>
                    <p style={{ color: 'white', fontWeight: '600' }}>{classData.duration}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ color: '#9CA3AF' }}>📍</span>
                  <div>
                    <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '4px' }}>Location</p>
                    <p style={{ color: 'white', fontWeight: '600' }}>{classData.studio}</p>
                    {classData.room && <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{classData.room}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div style={{ backgroundColor: '#2A1810', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid rgba(249,115,22,0.2)' }}>
            <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '12px' }}>Important Information</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Please arrive 10 minutes before class starts', 'Bring comfortable clothing and any required materials', 'Full refund available if cancelled 24 hours before class', 'Check your email for the full booking details and studio contact information'].map(item => (
                <li key={item} style={{ color: '#D1D5DB', fontSize: '14px' }}>• {item}</li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Link href="/" style={{ backgroundColor: '#F97316', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 'bold', textAlign: 'center', textDecoration: 'none', display: 'block' }}>Browse More Classes</Link>
            <button onClick={() => window.print()} style={{ backgroundColor: '#2A3547', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Print Confirmation</button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ConfirmationPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0F1624' }} />}><ConfirmationContent /></Suspense>
}
