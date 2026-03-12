'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const isStudios = pathname?.startsWith('/for-studios')

  return (
    <nav className="navbar">
      <div className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>
            Frolic
          </span>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F97316', display: 'inline-block', marginBottom: '2px' }} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Link
            href="/"
            style={{
              padding: '7px 18px',
              borderRadius: '9px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: !isStudios ? '#F97316' : 'transparent',
              color: !isStudios ? 'white' : '#9CA3AF',
            }}
          >
            Search
          </Link>
          <Link
            href="/for-studios"
            style={{
              padding: '7px 18px',
              borderRadius: '9px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: isStudios ? '#F97316' : 'transparent',
              color: isStudios ? 'white' : '#9CA3AF',
            }}
          >
            For Studios
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            href="/studio/login"
            className="btn-ghost"
            style={{ textDecoration: 'none', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', padding: '8px 16px', borderRadius: '9px', transition: 'color 0.2s' }}
          >
            Studio Login
          </Link>
          <Link
            href="/studio/signup"
            style={{
              background: 'rgba(249,115,22,0.12)',
              border: '1px solid rgba(249,115,22,0.3)',
              color: '#F97316',
              padding: '8px 18px',
              borderRadius: '9px',
              fontSize: '14px',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            List Your Studio
          </Link>
        </div>
      </div>
    </nav>
  )
}
