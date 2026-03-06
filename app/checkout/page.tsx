'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutContent() {
  const searchParams = useSearchParams()
  const classId = searchParams.get('classId')
  const router = useRouter()
  const [classData, setClassData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', cardNumber: '', expiry: '', cvv: '', zip: '' })

  useEffect(() => {
    if (!classId) return
    fetch(`/api/classes/${classId}`)
      .then(r => r.json())
      .then(d => { setClassData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [classId])

  const handleChange = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      alert('Please fill in all required fields')
      return
    }
    setProcessing(true)
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: (classData.price + 2) * 100,
          classId,
          className: classData.title,
          customerInfo: form,
        }),
      })
      const { clientSecret, orderId } = await res.json()
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe not loaded')
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: { token: 'tok_visa' } as any,
          billing_details: { name: `${form.firstName} ${form.lastName}`, email: form.email },
        },
      })
      if (result.error) {
        alert(result.error.message)
        setProcessing(false)
      } else {
        await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            classId,
            className: classData.title,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            amount: classData.price + 2,
            stripePaymentId: result.paymentIntent?.id,
          }),
        })
        router.push(`/booking-confirmation?orderId=${orderId}&classId=${classId}`)
      }
    } catch (err) {
      console.error(err)
      alert('Payment failed. Please try again.')
      setProcessing(false)
    }
  }

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0F1624', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>
  if (!classData) return <div style={{ minHeight: '100vh', backgroundColor: '#0F1624', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Class not found.</div>

  const total = classData.price + 2

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0F1624' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '32px' }}>Checkout</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '20px' }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px' }} />
              </div>
            </div>
            <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '20px' }}>💳 Payment Information</h2>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Card Number</label>
                <input name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Expiry Date</label>
                  <input name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>CVV</label>
                  <input name="cvv" value={form.cvv} onChange={handleChange} placeholder="123" style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>ZIP Code</label>
                <input name="zip" value={form.zip} onChange={handleChange} placeholder="12345" style={{ width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px' }} />
              </div>
            </div>
            <button onClick={handleSubmit} disabled={processing} style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }}>
              {processing ? 'Processing...' : `Complete Booking - $${classData.price}`}
            </button>
          </div>
          <div>
            <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: '24px' }}>
              <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '16px' }}>Order Summary</h2>
              {classData.image && <img src={classData.image} alt={classData.title} style={{ width: '100%', height: '192px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />}
              <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '4px' }}>{classData.title}</h3>
              <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '20px' }}>{classData.studio}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '20px' }}>
                {[['Date & Time', `${classData.date} at ${classData.time}`], ['Location', classData.studio], ['Duration', classData.duration], ['Level', classData.level]].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9CA3AF' }}>{label}:</span>
                    <span style={{ color: 'white', textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9CA3AF' }}>Class fee:</span><span style={{ color: 'white' }}>${classData.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9CA3AF' }}>Service fee:</span><span style={{ color: 'white' }}>$2.00</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>Total:</span>
                <span style={{ color: '#F97316', fontWeight: 'bold', fontSize: '24px' }}>${total}</span>
              </div>
              <div style={{ backgroundColor: '#0F1624', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '14px', color: '#9CA3AF' }}>
                <strong style={{ color: 'white' }}>Cancellation Policy:</strong> Full refund if cancelled 24 hours before the class starts.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0F1624' }} />}><CheckoutContent /></Suspense>
}
