'use client'
import Link from 'next/link'
import { useState } from 'react'

function getEmbedUrl(videoUrl: string): string | null {
  if (!videoUrl) return null
  const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`
  const igMatch = videoUrl.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/)
  if (igMatch) return `https://www.instagram.com/reel/${igMatch[1]}/embed/`
  return null
}

function getYouTubeThumbnail(videoUrl: string): string | null {
  const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
  return null
}

function isInstagramUrl(url: string): boolean {
  return url.includes('instagram.com')
}

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

interface ClassSlot {
  id: string
  date: string
  time: string
  duration: string
  spots: number
  spots_left: number
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
  instructor_background?: string
  location_type?: string
  location_types?: string[]
  room?: string
  room_maps_url?: string
  price_location?: number
  price_online?: number
  price_residence?: number
  slots?: ClassSlot[]
  video_url?: string
  video_urls?: string[]
  video_thumbnail?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Music: '#34D399',
  Dance: '#A78BFA',
  Sports: '#60A5FA',
}

export default function ClassCard(props: ClassCardProps) {
  const { id, title, studio, price, level, duration, date, time, spots_left, distance, rating, image, category, instructor, description, instructor_background, location_types, room, room_maps_url, price_location, price_online, price_residence, slots, video_url, video_urls, video_thumbnail } = props

  // Combine all video URLs, deduped
  const allVideos = [...(video_urls || []), ...(video_url && !(video_urls || []).includes(video_url) ? [video_url] : [])].filter(Boolean)

  const [modalOpen, setModalOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentVideo = allVideos[currentIndex] || ''
  const embedUrl = currentVideo ? getEmbedUrl(currentVideo) : null
  const isIG = currentVideo ? isInstagramUrl(currentVideo) : false

  // Thumbnail for card preview
  const firstVideo = allVideos[0] || ''
  const ytThumb = firstVideo ? getYouTubeThumbnail(firstVideo) : null
  const cardThumbnail = video_thumbnail || ytThumb || (firstVideo && isInstagramUrl(firstVideo) ? image : null) || image
  const hasVideo = allVideos.length > 0

  const availableSlots = (slots || []).filter(s => s.spots_left > 0)
  const totalSpotsLeft = slots && slots.length > 0 ? slots.reduce((sum, s) => sum + s.spots_left, 0) : spots_left
  const hasMultipleSlots = slots && slots.length > 1

  const locationPriceMap: Record<string, number | undefined> = { location: price_location, online: price_online, residence: price_residence }
  const types: string[] = location_types || []
  const perLocationPrices = types.map(t => locationPriceMap[t]).filter((p): p is number => p != null && p > 0)
  const displayPrice = perLocationPrices.length > 0
    ? (perLocationPrices.length > 1 ? `From $${Math.min(...perLocationPrices)}` : `$${perLocationPrices[0]}`)
    : `$${price}`

  const locationTags = [
    types.includes('online') ? '🌐 Online' : null,
    types.includes('residence') ? '🏠 At your home' : null,
    types.includes('location') && room ? null : null,
  ].filter(Boolean)
  const isSoldOut = totalSpotsLeft === 0
  const isLow = totalSpotsLeft > 0 && totalSpotsLeft <= 3
  const categoryColor = CATEGORY_COLORS[category] || '#F97316'

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!hasVideo) return
    setCurrentIndex(0)
    setModalOpen(true)
  }

  return (
    <>
      <div
        className="card animate-fade-up"
        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: isSoldOut ? 0.6 : 1 }}
      >
        {/* Media: thumbnail (click to play) or image */}
        <div
          style={{ position: 'relative', height: '200px', overflow: 'hidden', backgroundColor: '#0A0F1A', cursor: hasVideo ? 'pointer' : 'default' }}
          onClick={hasVideo ? openModal : undefined}
        >
          {cardThumbnail ? (
            <img
              src={cardThumbnail}
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

          {/* Play button overlay when video exists */}
          {hasVideo && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.25)')}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#111" style={{ marginLeft: '3px' }}>
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
              {allVideos.length > 1 && (
                <div style={{ position: 'absolute', bottom: '10px', right: '12px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '9999px' }}>
                  {allVideos.length} videos
                </div>
              )}
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

          {hasMultipleSlots ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ color: '#6B7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📅</span> {availableSlots.length} time slot{availableSlots.length !== 1 ? 's' : ''} available
              </p>
              {availableSlots.slice(0, 2).map(s => (
                <p key={s.id} style={{ color: '#6B7280', fontSize: '12px', marginLeft: '19px' }}>
                  {s.date} · {s.time} · {s.duration}
                </p>
              ))}
              {availableSlots.length > 2 && <p style={{ color: '#4B5563', fontSize: '12px', marginLeft: '19px' }}>+{availableSlots.length - 2} more</p>}
            </div>
          ) : (
            <p style={{ color: '#6B7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📅</span> {slots?.[0]?.date || date} · {slots?.[0]?.time || time}
            </p>
          )}
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
                  {isLow ? `⚡ Only ${totalSpotsLeft} spots left!` : `✓ ${totalSpotsLeft} spots available`}
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

      {/* Video Modal */}
      {modalOpen && embedUrl && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{ position: 'relative', width: isIG ? 'min(400px, 90vw)' : 'min(900px, 90vw)', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '-44px', right: 0, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '22px', fontWeight: '300', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
            >
              ×
            </button>

            {/* Video title */}
            <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '12px', opacity: 0.8 }}>{title}</p>

            {/* Video player */}
            {isIG ? (
              // Instagram blocks third-party iframe embeds — open in new tab instead
              <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#111', padding: '40px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
                <p style={{ color: 'white', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Instagram Reel</p>
                <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>Instagram doesn't allow videos to play inside other websites. Tap below to watch on Instagram.</p>
                <a
                  href={currentVideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: 'white', padding: '14px 32px', borderRadius: '12px', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}
                >
                  Watch on Instagram →
                </a>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                <iframe
                  src={embedUrl}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Navigation if multiple videos */}
            {allVideos.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
                <button
                  onClick={() => setCurrentIndex(i => (i - 1 + allVideos.length) % allVideos.length)}
                  style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: '18px', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ‹
                </button>
                <span style={{ color: '#9CA3AF', fontSize: '13px' }}>
                  {currentIndex + 1} / {allVideos.length}
                </span>
                <button
                  onClick={() => setCurrentIndex(i => (i + 1) % allVideos.length)}
                  style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: '18px', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
