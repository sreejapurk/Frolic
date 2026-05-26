'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import ClassCard from '@/components/ClassCard'
import Link from 'next/link'

const AGE_GROUPS = [
  { label: 'Child', sub: 'Ages 5–12', value: 'Child (5-12)' },
  { label: 'Teen', sub: 'Ages 13–17', value: 'Teen (13-17)' },
  { label: 'Adult', sub: 'Ages 18+', value: 'Adult (18+)' },
]

const CATEGORIES = [
  { label: 'Music', emoji: '🎵', value: 'Music' },
  { label: 'Sports', emoji: '⚡', value: 'Sports' },
  { label: 'Dance', emoji: '🎭', value: 'Dance' },
  { label: 'Not sure', emoji: '✨', value: '' },
]

const SUBCATEGORIES: Record<string, { label: string; value: string }[]> = {
  Music: [
    { label: 'Piano', value: 'Piano' }, { label: 'Guitar', value: 'Guitar' },
    { label: 'Vocals', value: 'Vocals' }, { label: 'Drums', value: 'Drums' },
    { label: 'Violin', value: 'Violin' }, { label: 'Saxophone', value: 'Saxophone' },
    { label: 'Flute', value: 'Flute' }, { label: 'Other / Not sure', value: '' },
  ],
  Sports: [
    { label: 'Tennis', value: 'Tennis' }, { label: 'Swimming', value: 'Swimming' },
    { label: 'Yoga', value: 'Yoga' }, { label: 'Boxing', value: 'Boxing' },
    { label: 'Basketball', value: 'Basketball' }, { label: 'Soccer', value: 'Soccer' },
    { label: 'Martial Arts', value: 'Martial Arts' }, { label: 'Other / Not sure', value: '' },
  ],
  Dance: [
    { label: 'Ballet', value: 'Ballet' }, { label: 'Hip Hop', value: 'Hip Hop' },
    { label: 'Salsa', value: 'Salsa' }, { label: 'Contemporary', value: 'Contemporary' },
    { label: 'K-Pop', value: 'K-Pop' }, { label: 'Zumba', value: 'Zumba' },
    { label: 'Other / Not sure', value: '' },
  ],
}

const LEVELS = [
  { label: 'Just starting out', sub: 'Never tried it before', value: 'Beginner' },
  { label: 'Some experience', sub: 'I know the basics', value: 'Intermediate' },
  { label: 'Already skilled', sub: 'Looking to improve further', value: 'Advanced' },
]

type Step = 'age' | 'category' | 'subcategory' | 'level' | 'extra' | 'results'

export default function MatchPage() {
  const [step, setStep] = useState<Step>('age')
  const [ageGroup, setAgeGroup] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [level, setLevel] = useState('')
  const [freeText, setFreeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')

  const progress = { age: 20, category: 40, subcategory: 55, level: 75, extra: 88, results: 100 }[step]

  const findMatches = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ageGroup, category, subcategory, level, freeText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data)
      setStep('results')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('age'); setAgeGroup(''); setCategory(''); setSubcategory('')
    setLevel(''); setFreeText(''); setResults([]); setError('')
  }

  const btnStyle = (selected: boolean) => ({
    width: '100%', padding: '20px 24px', borderRadius: '16px', cursor: 'pointer',
    border: selected ? '2px solid #F97316' : '1px solid rgba(255,255,255,0.1)',
    backgroundColor: selected ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.02)',
    textAlign: 'left' as const, transition: 'all 0.15s ease',
  })

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0A0F1A' }}>
      <Navbar />

      {step !== 'results' && (
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>
          {/* Progress bar */}
          <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '999px', marginBottom: '48px' }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#F97316', borderRadius: '999px', transition: 'width 0.4s ease' }} />
          </div>

          {/* Age step */}
          {step === 'age' && (
            <div>
              <p style={{ color: '#F97316', fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Step 1 of 4</p>
              <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '8px' }}>Who is this for?</h1>
              <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px' }}>We'll find the right level and style for them.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {AGE_GROUPS.map(ag => (
                  <button key={ag.value} style={btnStyle(ageGroup === ag.value)} onClick={() => { setAgeGroup(ag.value); setStep('category') }}>
                    <span style={{ color: ageGroup === ag.value ? '#F97316' : 'white', fontWeight: '700', fontSize: '17px', display: 'block' }}>{ag.label}</span>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>{ag.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category step */}
          {step === 'category' && (
            <div>
              <p style={{ color: '#F97316', fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Step 2 of 4</p>
              <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '8px' }}>What are you interested in?</h1>
              <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px' }}>Pick a category to get started.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.value} style={btnStyle(category === cat.value)} onClick={() => {
                    setCategory(cat.value)
                    setSubcategory('')
                    setStep(cat.value && SUBCATEGORIES[cat.value] ? 'subcategory' : 'level')
                  }}>
                    <span style={{ fontSize: '22px', marginRight: '12px' }}>{cat.emoji}</span>
                    <span style={{ color: category === cat.value ? '#F97316' : 'white', fontWeight: '700', fontSize: '17px' }}>{cat.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('age')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
            </div>
          )}

          {/* Subcategory step */}
          {step === 'subcategory' && category && SUBCATEGORIES[category] && (
            <div>
              <p style={{ color: '#F97316', fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Step 2b of 4</p>
              <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '8px' }}>Any specific interest?</h1>
              <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px' }}>Narrow it down or skip if you're open.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                {SUBCATEGORIES[category].map(sub => (
                  <button key={sub.value} style={{ ...btnStyle(subcategory === sub.value), padding: '14px 16px' }}
                    onClick={() => { setSubcategory(sub.value); setStep('level') }}>
                    <span style={{ color: subcategory === sub.value ? '#F97316' : 'white', fontWeight: '600', fontSize: '15px' }}>{sub.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('category')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
            </div>
          )}

          {/* Level step */}
          {step === 'level' && (
            <div>
              <p style={{ color: '#F97316', fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Step 3 of 4</p>
              <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '8px' }}>What's their experience level?</h1>
              <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px' }}>We'll find classes at the right pace.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {LEVELS.map(lv => (
                  <button key={lv.value} style={btnStyle(level === lv.value)} onClick={() => { setLevel(lv.value); setStep('extra') }}>
                    <span style={{ color: level === lv.value ? '#F97316' : 'white', fontWeight: '700', fontSize: '17px', display: 'block' }}>{lv.label}</span>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>{lv.sub}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(category && SUBCATEGORIES[category] ? 'subcategory' : 'category')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
            </div>
          )}

          {/* Extra step */}
          {step === 'extra' && (
            <div>
              <p style={{ color: '#F97316', fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Step 4 of 4</p>
              <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '8px' }}>Anything else we should know?</h1>
              <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px' }}>Optional — add any specific goals, preferences, or details.</p>
              <textarea
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                placeholder="e.g. Looking for a patient teacher, prefer weekend classes, want to perform eventually..."
                rows={4}
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '16px', color: 'white', fontSize: '15px', outline: 'none', resize: 'none', marginBottom: '24px', boxSizing: 'border-box', lineHeight: '1.6' }}
              />
              {error && <p style={{ color: '#F87171', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}
              <button
                onClick={findMatches}
                disabled={loading}
                style={{ width: '100%', backgroundColor: '#F97316', border: 'none', color: 'white', padding: '18px', borderRadius: '14px', fontWeight: '800', fontSize: '17px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Finding your matches...' : 'Find My Classes →'}
              </button>
              <button onClick={() => setStep('level')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '14px', cursor: 'pointer', marginTop: '16px', display: 'block' }}>← Back</button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {step === 'results' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ marginBottom: '40px' }}>
            <p style={{ color: '#F97316', fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Your matches</p>
            <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              We found {results.length} class{results.length !== 1 ? 'es' : ''} for you
            </h1>
            <p style={{ color: '#6B7280', fontSize: '15px' }}>
              Based on: {[ageGroup, category, subcategory, level].filter(Boolean).join(' · ')}
            </p>
          </div>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</p>
              <p style={{ color: '#6B7280', fontSize: '18px', fontWeight: '600' }}>No matches found</p>
              <p style={{ color: '#4B5563', fontSize: '14px', marginTop: '8px' }}>Try different preferences or browse all classes</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {results.map((c, i) => (
                <div key={c.id}>
                  {/* Match reason banner */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '10px 16px', backgroundColor: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '10px' }}>
                    <span style={{ color: '#F97316', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>#{i + 1} Match</span>
                    <span style={{ color: '#D1D5DB', fontSize: '14px' }}>{c.matchReason}</span>
                  </div>
                  <ClassCard {...c} />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '48px', flexWrap: 'wrap' }}>
            <button onClick={reset} style={{ backgroundColor: '#F97316', border: 'none', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
              Start Over
            </button>
            <Link href="/" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', textDecoration: 'none', display: 'inline-block' }}>
              Browse All Classes
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
