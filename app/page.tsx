'use client'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import ClassCard from '@/components/ClassCard'

const CATEGORIES = ['All', 'Music', 'Dance', 'Sports']

export default function HomePage() {
  const [classes, setClasses] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/classes')
      .then(r => r.json())
      .then(d => { setClasses(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return classes.filter(c => {
      const matchCat = activeCategory === 'All' || c.category === activeCategory
      const matchSearch = !search ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.studio?.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [classes, activeCategory, search])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0A0F1A' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #111827 0%, #0A0F1A 100%)', padding: '72px 24px 56px', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="section" style={{ textAlign: 'center', position: 'relative' }}>
          <div className="badge badge-orange" style={{ marginBottom: '20px', display: 'inline-flex' }}>
            ✦ Creative Classes in Your City
          </div>
          <h1
            className="hero-title animate-fade-up"
            style={{ fontSize: '56px', fontWeight: '900', color: 'white', marginBottom: '16px', lineHeight: '1.1', letterSpacing: '-1.5px', maxWidth: '700px', margin: '0 auto 16px' }}
          >
            Discover{' '}
            <span className="gradient-text">Creative Classes</span>
            <br />Near You
          </h1>
          <p className="animate-fade-up" style={{ color: '#9CA3AF', fontSize: '18px', marginBottom: '40px', animationDelay: '100ms' }}>
            Dance, sing, and create with your local community
          </p>

          {/* Search bar */}
          <div className="animate-fade-up" style={{ maxWidth: '580px', margin: '0 auto', animationDelay: '150ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '16px 20px', gap: '12px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onFocusCapture={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)' }}
              onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <svg width="18" height="18" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search classes, studios, instructors..."
                style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '15px' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Classes section */}
      <section className="section" style={{ padding: '40px 24px 80px' }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '9px 20px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                backgroundColor: activeCategory === cat ? '#F97316' : 'rgba(255,255,255,0.04)',
                color: activeCategory === cat ? 'white' : '#9CA3AF',
                boxShadow: activeCategory === cat ? '0 2px 12px rgba(249,115,22,0.3)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px', margin: 0 }}>
              {activeCategory === 'All' ? 'All Classes' : `${activeCategory} Classes`}
            </h2>
          </div>
          {!loading && (
            <span style={{ color: '#6B7280', fontSize: '14px' }}>
              {filtered.length} {filtered.length === 1 ? 'class' : 'classes'}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '380px', borderRadius: '16px', background: 'linear-gradient(90deg, #111827 25%, #1A2332 50%, #111827 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div className="class-grid stagger">
            {filtered.map(c => <ClassCard key={c.id} {...c} />)}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 24px' }}>
                <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</p>
                <p style={{ color: '#6B7280', fontSize: '18px', fontWeight: '600' }}>No classes found</p>
                <p style={{ color: '#4B5563', fontSize: '14px', marginTop: '8px' }}>Try a different search or category</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
