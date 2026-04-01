'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const cardElementOptions = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      fontSize: '14px',
      '::placeholder': { color: '#6B7280' },
    },
    invalid: { color: '#F87171' },
  },
}

function CheckoutForm({ classData, classId }: { classData: any; classId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [cardError, setCardError] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [savedCards, setSavedCards] = useState<any[]>([])
  const [selectedSavedCard, setSelectedSavedCard] = useState<string | null>(null)
  const [useNewCard, setUseNewCard] = useState(false)
  const locationOptions: string[] = classData.location_types || (classData.location_type ? [classData.location_type] : [])
  const [selectedLocation, setSelectedLocation] = useState(locationOptions[0] || '')
  const availableSlots = (classData.slots || []).filter((s: any) => s.spots_left > 0)
  const hasSlots = availableSlots.length > 0
  const [selectedSlot, setSelectedSlot] = useState<any>(availableSlots[0] || null)

  useEffect(() => {
    fetch('/api/customer/payment-methods')
      .then(r => r.json())
      .then(d => {
        if (d.methods?.length > 0) {
          setSavedCards(d.methods)
          setSelectedSavedCard(d.methods[0].id)
        }
      })
      .catch(() => {})
  }, [])

  const locationPrice = (loc: string): number => {
    if (loc === 'location' && classData.price_location) return Number(classData.price_location)
    if (loc === 'online' && classData.price_online) return Number(classData.price_online)
    if (loc === 'residence' && classData.price_residence) return Number(classData.price_residence)
    return Number(classData.price) || 0
  }

  const handleChange = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      alert('Please fill in all required fields')
      return
    }
    if (hasSlots && !selectedSlot) {
      alert('Please select a time slot')
      return
    }
    if (locationOptions.length > 1 && !selectedLocation) {
      alert('Please select a location preference')
      return
    }
    const usingSavedCard = savedCards.length > 0 && !useNewCard && selectedSavedCard
    if (!stripe) return
    if (!usingSavedCard) {
      if (!elements) return
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return
    }

    setProcessing(true)
    setCardError('')
    try {
      const basePrice = locationPrice(selectedLocation)
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: (basePrice + 2) * 100,
          classId,
          className: classData.title,
          customerInfo: form,
          savedPaymentMethodId: usingSavedCard ? selectedSavedCard : undefined,
        }),
      })
      const intentData = await res.json()
      if (!intentData.clientSecret) {
        alert(`Payment setup failed: ${intentData.error || 'Unknown error'}`)
        setProcessing(false)
        return
      }
      const { clientSecret, orderId } = intentData

      const result = await stripe.confirmCardPayment(clientSecret,
        usingSavedCard
          ? { payment_method: selectedSavedCard! }
          : {
              payment_method: {
                card: elements!.getElement(CardElement)!,
                billing_details: { name: `${form.firstName} ${form.lastName}`, email: form.email },
              },
            }
      )

      if (result.error) {
        setCardError(result.error.message || 'Payment failed')
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
            amount: basePrice + 2,
            locationPreference: selectedLocation,
            slotId: selectedSlot?.id || null,
            stripePaymentId: result.paymentIntent?.id,
          }),
        })
        router.push(`/booking-confirmation?orderId=${orderId}&classId=${classId}`)
      }
    } catch (err: any) {
      console.error(err)
      alert(`Payment failed: ${err?.message || err}`)
      setProcessing(false)
    }
  }

  const total = locationPrice(selectedLocation) + 2
  const inputStyle = { width: '100%', backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {hasSlots && availableSlots.length > 1 && (
          <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '8px' }}>Choose a Time Slot</h2>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '16px' }}>Select the date and time that works best for you.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {availableSlots.map((slot: any) => {
                const selected = selectedSlot?.id === slot.id
                return (
                  <button key={slot.id} type="button" onClick={() => setSelectedSlot(slot)}
                    style={{ textAlign: 'left', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', border: selected ? '2px solid #F97316' : '1px solid rgba(255,255,255,0.1)', backgroundColor: selected ? 'rgba(249,115,22,0.08)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: selected ? '2px solid #F97316' : '2px solid rgba(255,255,255,0.2)', backgroundColor: selected ? '#F97316' : 'transparent', flexShrink: 0 }} />
                      <div>
                        <span style={{ color: selected ? '#F97316' : 'white', fontWeight: '600', fontSize: '14px', display: 'block' }}>{slot.date} at {slot.time}</span>
                        <span style={{ color: '#6B7280', fontSize: '12px' }}>{slot.duration} · {slot.spots_left} spot{slot.spots_left !== 1 ? 's' : ''} left</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {locationOptions.length > 1 && (
          <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '8px' }}>Where would you like the class?</h2>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '16px' }}>This instructor offers multiple options — pick one.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {locationOptions.map((opt: string) => {
                const label = opt === 'online' ? '🌐 Online' : opt === 'residence' ? '🏠 At my home' : opt === 'location' ? `📍 At the instructor's location${classData.room ? ` — ${classData.room}` : ''}` : opt
                const selected = selectedLocation === opt
                const price = locationPrice(opt)
                return (
                  <button key={opt} type="button" onClick={() => setSelectedLocation(opt)}
                    style={{ textAlign: 'left', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', border: selected ? '2px solid #F97316' : '1px solid rgba(255,255,255,0.1)', backgroundColor: selected ? 'rgba(249,115,22,0.08)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: selected ? '2px solid #F97316' : '2px solid rgba(255,255,255,0.2)', backgroundColor: selected ? '#F97316' : 'transparent', flexShrink: 0 }} />
                      <span style={{ color: selected ? '#F97316' : 'white', fontWeight: '600', fontSize: '14px' }}>{label}</span>
                    </div>
                    <span style={{ color: selected ? '#F97316' : '#9CA3AF', fontWeight: '700', fontSize: '15px' }}>${price}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '20px' }}>Personal Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '20px' }}>Payment Information</h2>

          {savedCards.length > 0 && !useNewCard ? (
            <div>
              <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '12px' }}>Saved cards</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {savedCards.map(card => (
                  <button key={card.id} type="button" onClick={() => setSelectedSavedCard(card.id)}
                    style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', border: selectedSavedCard === card.id ? '2px solid #F97316' : '1px solid rgba(255,255,255,0.1)', backgroundColor: selectedSavedCard === card.id ? 'rgba(249,115,22,0.08)' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: selectedSavedCard === card.id ? '2px solid #F97316' : '2px solid rgba(255,255,255,0.2)', backgroundColor: selectedSavedCard === card.id ? '#F97316' : 'transparent', flexShrink: 0 }} />
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>{card.brand} •••• {card.last4}</span>
                    <span style={{ color: '#6B7280', fontSize: '13px', marginLeft: 'auto' }}>Expires {card.exp_month}/{card.exp_year}</span>
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => { setUseNewCard(true); setSelectedSavedCard(null) }}
                style={{ background: 'none', border: 'none', color: '#F97316', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                + Use a different card
              </button>
            </div>
          ) : (
            <div>
              {savedCards.length > 0 && (
                <button type="button" onClick={() => { setUseNewCard(false); setSelectedSavedCard(savedCards[0].id) }}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '13px', cursor: 'pointer', padding: 0, marginBottom: '12px', display: 'block' }}>
                  ← Use saved card
                </button>
              )}
              <label style={{ color: '#9CA3AF', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Card Details</label>
              <div style={{ backgroundColor: '#0F1624', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px' }}>
                <CardElement options={cardElementOptions} onChange={() => setCardError('')} />
              </div>
              {cardError && <p style={{ color: '#F87171', fontSize: '13px', marginTop: '8px' }}>{cardError}</p>}
            </div>
          )}
          <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '12px' }}>
            Your card details are securely processed by Stripe. Frolic never stores your card information.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={processing || !stripe}
          style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }}
        >
          {processing ? 'Processing...' : `Complete Booking — $${total}`}
        </button>
      </div>

      <div>
        <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: '24px' }}>
          <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '16px' }}>Order Summary</h2>
          {classData.image && <img src={classData.image} alt={classData.title} style={{ width: '100%', height: '192px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />}
          <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '4px' }}>{classData.title}</h3>
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '20px' }}>{classData.studio}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '20px' }}>
            {[
              ['Date & Time', selectedSlot ? `${selectedSlot.date} at ${selectedSlot.time}` : `${classData.date} at ${classData.time}`],
              ['Location', selectedLocation === 'online' ? 'Online' : selectedLocation === 'residence' ? 'At your home' : classData.room || classData.studio],
              ['Level', classData.level]
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9CA3AF' }}>{label}:</span>
                <span style={{ color: 'white', textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9CA3AF' }}>Class fee:</span><span style={{ color: 'white' }}>${locationPrice(selectedLocation)}</span>
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
  )
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const classId = searchParams.get('classId')
  const [classData, setClassData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classId) return
    fetch(`/api/classes/${classId}`)
      .then(r => r.json())
      .then(d => { setClassData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [classId])

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0F1624', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>
  if (!classData) return <div style={{ minHeight: '100vh', backgroundColor: '#0F1624', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Class not found.</div>

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0F1624' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '32px' }}>Checkout</h1>
        <Elements stripe={stripePromise}>
          <CheckoutForm classData={classData} classId={classId!} />
        </Elements>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#0F1624' }} />}><CheckoutContent /></Suspense>
}
