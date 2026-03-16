'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const isStudios = pathname?.startsWith('/for-studios')
  const [customer, setCustomer] = useState<{ first_name: string } | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/customer/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setCustomer(d?.customer ?? null); setChecked(true) })
      .catch(() => setChecked(true))
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/customer/logout', { method: 'POST' })
    setCustomer(null)
    router.push('/')
  }

  return (
    <nav className="navbar">
      <div className="section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>
            Frolic
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Link
            href="/"
            style={{ padding: '7px 18px', borderRadius: '9px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.2s ease', backgroundColor: !isStudios ? '#F97316' : 'transparent', color: !isStudios ? 'white' : '#9CA3AF' }}
          >
            Search
          </Link>
          <Link
            href="/for-studios"
            style={{ padding: '7px 18px', borderRadius: '9px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.2s ease', backgroundColor: isStudios ? '#F97316' : 'transparent', color: isStudios ? 'white' : '#9CA3AF' }}
          >
            For Studios
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {checked && (
            customer ? (
              <>
                <Link
                  href="/account"
                  style={{ textDecoration: 'none', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', padding: '8px 16px', borderRadius: '9px', transition: 'color 0.2s' }}
                >
                  Hi, {customer.first_name}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#9CA3AF', padding: '8px 16px', borderRadius: '9px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{ textDecoration: 'none', fontSize: '14px', fontWeight: '600', color: '#9CA3AF', padding: '8px 16px', borderRadius: '9px' }}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  style={{ background: '#F97316', color: 'white', padding: '8px 18px', borderRadius: '9px', fontSize: '14px', fontWeight: '700', textDecoration: 'none' }}
                >
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
