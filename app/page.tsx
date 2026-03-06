'use client'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import ClassCard from '@/components/ClassCard'

const CATEGORIES = ['All', 'Dance', 'Singing', 'Art']

export default function HomePage() {
  const [classes, setClasses] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/classes')
      .then(r => r.json())
      .then(d => { setClasses(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return classes.filter(c => {
      const matchCat = activeCategory === 'All' || c.category === activeCategory
      const matchSearch = !search ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.studio?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [classes, activeCategory, search])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0F1624' }}>
      <Navbar />
      <section style={{ textAlign: 'center', padding: '64px 24px', background: 'linear-gradient(to bottom, #1A2332, #0F1624)' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '900', color: 'white', marginBottom: '16px' }}>Discover Creative Classes Near You</h1>
        <p style={{ color: '#9CA3AF', fontSize: '18px', marginBottom: '32px' }}>Dance, sing, and create with your local community</p>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', padding: '16px 20px', gap: '12px' }}>
            <span style={{ color: '#9CA3AF' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for dance, painting, singing classes..."
              style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '16px' }}
            />
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{ padding: '8px 20px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.1)', backgroundColor: activeCategory === cat ? '#F97316' : '#1A2332', color: 'white' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>
          {activeCategory === 'All' ? 'All Classes' : `${activeCategory} Classes`}
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>{filtered.length} classes available</p>

        {loading ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '64px' }}>Loading classes...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filtered.map(c => <ClassCard key={c.id} {...c} />)}
            {filtered.length === 0 && (
              <p style={{ color: '#6B7280', gridColumn: '1/-1', textAlign: 'center', padding: '64px' }}>No classes found.</p>
            )}
          </div>
        )}
      </section>
    </main>
  )
}