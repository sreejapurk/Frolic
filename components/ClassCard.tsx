'use client'
import Link from 'next/link'
import { useState } from 'react'

function ExpandableDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false)
  const limit = 80
  const isLong = description.length > limit

  return (
    <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '6px', lineHeight: '1.5' }}>
      {expanded || !isLong ? description : `${description.slice(0, limit).trimEnd()}...`}
      {isLong && (
        <button
          onClick={e => { e.preventDefault(); setExpanded(v => !v) }}
          style={{ background: 'none', border: 'none', color: '#F97316', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: '0 0 0 4px' }}
        >
          {expanded ? 'less' : 'more'}
        </button>
      )}
    </p>
  )
}

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
  instructor?: string
  description?: string
  location_type?: string
  location_types?: string[]
  room?: string
  room_maps_url?: string
  price_location?: number
  price_online?: number
  price_residence?: number
}

const CATEGORY_COLORS: Record<string, string> = {
  Music: '#34D399',
  Dance: '#A78BFA',
  Sports: '#60A5FA',
}

export default function ClassCard(props: ClassCardProps) {
  const { id, title, studio, price, level, duration, date, time, spots_left, distance, rating, image, category, instructor, description, location_types, room, room_maps_url, price_location, price_online, price_residence } = props

  const locationPriceMap: Record<string, number | undefined> = { location: price_location, online: price_online, residence: price_residence }
  const types: string[] = location_types || []
  const perLocationPrices = types.map(t => locationPriceMap[t]).filter((p): p is number => p != null && p > 0)
  const displayPrice = perLocationPrices.length > 0
    ? (perLocationPrices.length > 1 ? `From $${Math.min(...perLocationPrices)}` : `$${perLocationPrices[0]}`)
    : `$${price}`

  const locationTags = [
    types.includes('online') ? '🌐 Online' : null,
    types.includes('residence') ? '🏠 At your home' : null,
    types.includes('location') && room ? null : null, // shown separately with link
  ].filter(Boolean)
  const isSoldOut = spots_left === 0
  const isLow = spots_left > 0 && spots_left <= 3
  const categoryColor = CATEGORY_COLORS[category] || '#F97316'

  return (
    <div
      className="card animate-fade-up"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: isSoldOut ? 0.6 : 1 }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden', backgroundColor: '#0A0F1A' }}>
        {image ? (
          <img
            src={image}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1A2332, #0A0F1A)' }}>
            <span style={{ fontSize: '40px', opacity: 0.3 }}>🎭</span>
          </div>
        )}

        {/* Price badge */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#F97316', color: 'white', fontSize: '15px', fontWeight: '800', padding: '5px 12px', borderRadius: '9999px', boxShadow: '0 2px 12px rgba(249,115,22,0.4)' }}>
          {displayPrice}
        </div>

        {/* Category badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: categoryColor, fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px', border: `1px solid ${categoryColor}30`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {category}
        </div>

        {isSoldOut && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: 'rgba(0,0,0,0.8)', color: 'white', fontWeight: '700', fontSize: '13px', padding: '8px 20px', borderRadius: '9999px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
        <div>
          <h3 style={{ color: 'white', fontWeight: '800', fontSize: '17px', marginBottom: '4px', lineHeight: '1.3', letterSpacing: '-0.2px' }}>{title}</h3>
          <p style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: '500' }}>{studio}{instructor ? ` · ${instructor}` : ''}</p>
          {description && <ExpandableDescription description={description} />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#9CA3AF', fontSize: '13px' }}>📍 {distance}</span>
          <span style={{ color: '#FBBF24', fontSize: '13px', fontWeight: '600' }}>⭐ {rating}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-gray">{level}</span>
          <span style={{ color: '#6B7280', fontSize: '12px' }}>·</span>
          <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{duration}</span>
        </div>

        <p style={{ color: '#6B7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📅</span> {date} · {time}
        </p>
        {(types.includes('location') && room) && (
          <p style={{ fontSize: '13px', color: '#6B7280' }}>
            {room_maps_url
              ? <a href={room_maps_url} target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA', textDecoration: 'none' }}>📍 {room}</a>
              : `📍 ${room}`}
          </p>
        )}
        {locationTags.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {locationTags.map((tag, i) => (
              <span key={i} style={{ fontSize: '12px', color: '#9CA3AF', backgroundColor: 'rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: '999px' }}>{tag}</span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
          {isSoldOut ? (
            <button disabled style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#6B7280', padding: '12px', borderRadius: '12px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.08)', cursor: 'not-allowed', fontSize: '14px' }}>
              Sold Out
            </button>
          ) : (
            <>
              <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: isLow ? '#F97316' : '#4ADE80' }}>
                {isLow ? `⚡ Only ${spots_left} spots left!` : `✓ ${spots_left} spots available`}
              </p>
              <Link
                href={`/checkout?classId=${id}`}
                style={{ display: 'block', width: '100%', background: '#F97316', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '700', textAlign: 'center', textDecoration: 'none', fontSize: '14px', transition: 'all 0.2s ease', boxShadow: '0 2px 12px rgba(249,115,22,0.25)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EA6C0A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F97316'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
              >
                Book Now →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
