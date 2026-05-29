'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Slot {
  id: string
  date: string
  time: string
  duration: string
  spots: number
  spots_left: number
  label?: string
}

interface ClassItem {
  id: string
  title: string
  price: string | number
  price_location?: number
  price_online?: number
  price_residence?: number
  location_types?: string[]
  level: string
  duration: string
  instructor?: string
  description?: string
  category: string
  subcategory?: string
  slots?: Slot[]
  date: string
  time: string
  spots_left: number
  image?: string
  room?: string
  room_maps_url?: string
  rating?: string
}

interface StudioCardProps {
  studioName: string
  classes: ClassItem[]
}

const CATEGORY_COLORS: Record<string, string> = {
  Music: '#34D399',
  Dance: '#A78BFA',
  Sports: '#60A5FA',
}

function getDisplayPrice(cls: ClassItem): string {
  const types = cls.location_types || []
  const map: Record<string, number | undefined> = {
    location: cls.price_location,
    online: cls.price_online,
    residence: cls.price_residence,
  }
  const prices = types.map(t => map[t]).filter((p): p is number => p != null && p > 0)
  if (prices.length > 1) return `From $${Math.min(...prices)}`
  if (prices.length === 1) return `$${prices[0]}`
  return `$${cls.price}`
}

export default function StudioCard({ studioName, classes }: StudioCardProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<{ classId: string; slot: Slot } | null>(null)

  const instructors = [...new Set(classes.map(c => c.instructor).filter(Boolean))]
  const categories = [...new Set(classes.map(c => c.category))]
  const image = classes.find(c => c.image)?.image || ''
  const room = classes.find(c => c.room)?.room || ''
  const room_maps_url = classes.find(c => c.room_maps_url)?.room_maps_url || ''

  const availableSlots = classes.flatMap(c =>
    (c.slots || []).filter(s => s.spots_left > 0).map(s => ({ ...s, _classId: c.id, _cls: c }))
  )
  const totalSpots = availableSlots.reduce((sum, s) => sum + s.spots_left, 0)
  const isSoldOut = totalSpots === 0

  return (
    <div className="card animate-fade-up" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header — always visible */}
      <div
        onClick={() => { if (!isSoldOut) { setOpen(o => !o); setSelected(null) } }}
        style={{ cursor: isSoldOut ? 'default' : 'pointer' }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: '180px', overflow: 'hidden', backgroundColor: '#0A0F1A' }}>
          {image ? (
            <img
              src={image}
              alt={studioName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              onMouseEnter={e => { if (!isSoldOut) (e.currentTarget.style.transform = 'scale(1.05)') }}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1A2332, #0A0F1A)' }}>
              <span style={{ fontSize: '40px', opacity: 0.3 }}>🎭</span>
            </div>
          )}

          {/* Category badges */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <span key={cat} style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: CATEGORY_COLORS[cat] || '#F97316', fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '9999px', border: `1px solid ${(CATEGORY_COLORS[cat] || '#F97316')}30` }}>
                {cat}
              </span>
            ))}
          </div>

          {isSoldOut && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: 'rgba(0,0,0,0.8)', color: 'white', fontWeight: '700', fontSize: '13px', padding: '8px 20px', borderRadius: '9999px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sold Out</span>
            </div>
          )}
        </div>

        {/* Studio info */}
        <div style={{ padding: '16px 20px 12px' }}>
          <h3 style={{ color: 'white', fontWeight: '800', fontSize: '17px', marginBottom: '4px', letterSpacing: '-0.2px' }}>{studioName}</h3>
          {instructors.length > 0 && (
            <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '6px' }}>{instructors.join(' · ')}</p>
          )}
          {(() => {
            const subcats = [...new Set(classes.map(c => c.subcategory).filter(Boolean))]
            const labels = subcats.length > 0 ? subcats : [...new Set(classes.map(c => c.title))]
            return (
              <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '8px' }}>
                {labels.join(' · ')}
              </p>
            )
          })()}
          {room && (
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
              {room_maps_url
                ? <a href={room_maps_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#60A5FA', textDecoration: 'none' }}>📍 {room}</a>
                : `📍 ${room}`}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#6B7280', fontSize: '13px' }}>
              {classes.length} class{classes.length !== 1 ? 'es' : ''} · {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
            </span>
            {!isSoldOut && (
              <span style={{ color: '#F97316', fontSize: '13px', fontWeight: '700' }}>
                {open ? 'Hide ↑' : 'Book ↓'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded slot picker */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {classes.map(cls => {
            const clsSlots = (cls.slots || []).filter(s => s.spots_left > 0)
            if (clsSlots.length === 0) return null
            return (
              <div key={cls.id}>
                <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>{cls.title}</p>
                  <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '2px' }}>
                    {cls.level} · {cls.duration} · <span style={{ color: '#F97316', fontWeight: '700' }}>{getDisplayPrice(cls)}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {clsSlots.map(slot => {
                    const isSelected = selected?.slot.id === slot.id
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelected(isSelected ? null : { classId: cls.id, slot })}
                        style={{
                          width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                          border: isSelected ? '2px solid #F97316' : '1px solid rgba(255,255,255,0.1)',
                          background: isSelected ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            {slot.label && <p style={{ color: '#F97316', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>{slot.label}</p>}
                            <p style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>📅 {slot.date} · {slot.time}</p>
                            <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '2px' }}>{slot.duration}</p>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: slot.spots_left <= 3 ? '#F97316' : '#4ADE80', flexShrink: 0, marginLeft: '8px' }}>
                            {slot.spots_left <= 3 ? `⚡ ${slot.spots_left} left` : `✓ ${slot.spots_left}`}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {selected && (
            <Link
              href={`/checkout?classId=${selected.classId}&slotId=${selected.slot.id}`}
              style={{ display: 'block', width: '100%', background: '#F97316', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: '700', textAlign: 'center', textDecoration: 'none', fontSize: '15px', boxShadow: '0 2px 12px rgba(249,115,22,0.3)' }}
            >
              Book — {selected.slot.date} · {selected.slot.time} →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
