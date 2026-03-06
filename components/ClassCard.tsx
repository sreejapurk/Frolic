'use client'
import Link from 'next/link'

interface ClassCardProps {
  id: string
  title: string
  studio: string
  price: number
  level: string
  duration: string
  date: string
  time: string
  spots_left: number
  distance: string
  rating: string
  image: string
  category: string
}

export default function ClassCard(props: ClassCardProps) {
  const { id, title, studio, price, level, duration, date, time, spots_left, distance, rating, image } = props
  const isSoldOut = spots_left === 0

  return (
    <div style={{ backgroundColor: '#1A2332', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: isSoldOut ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)', opacity: isSoldOut ? 0.8 : 1 }}>
      <div style={{ position: 'relative' }}>
        {image ? (
          <img src={image} alt={title} style={{ width: '100%', height: '192px', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '192px', backgroundColor: '#0F1624', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', fontSize: '14px' }}>No image</div>
        )}
        <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#F97316', color: 'white', fontSize: '14px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '999px' }}>${price}</span>
        {isSoldOut && (
          <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#1A2332', color: 'white', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '999px' }}>SOLD OUT</span>
        )}
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>{title}</h3>
        <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '12px' }}>{studio}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: '#9CA3AF', marginBottom: '12px' }}>
          <span>📍 {distance}</span>
          <span style={{ color: '#FBBF24', fontWeight: '500' }}>⭐ {rating}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ backgroundColor: '#0F1624', color: '#D1D5DB', fontSize: '12px', padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)' }}>{level}</span>
          <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{duration}</span>
        </div>
        <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '16px' }}>{date} • {time}</p>
        <div style={{ marginTop: 'auto' }}>
          {isSoldOut ? (
            <>
              <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '12px' }}>No spots available</p>
              <button disabled style={{ width: '100%', backgroundColor: '#2A3547', color: '#6B7280', padding: '12px', borderRadius: '12px', fontWeight: '600', border: 'none', cursor: 'not-allowed' }}>Sold Out</button>
            </>
          ) : (
            <>
              <p style={{ color: '#F97316', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>{spots_left} spots left</p>
              <Link href={`/checkout?classId=${id}`} style={{ display: 'block', width: '100%', backgroundColor: '#F97316', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '600', textAlign: 'center', textDecoration: 'none' }}>Book Now</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}