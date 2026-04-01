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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', gap: '8px' }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: '20px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>Frolic</span>
        </Link>

        {/* Center toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '3px', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <Link href="/" style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap', backgroundColor: !isStudios ? '#F97316' : 'transparent', color: !isStudios ? 'white' : '#9CA3AF' }}>
            Search
          </Link>
          <Link href="/for-studios" style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap', backgroundColor: isStudios ? '#F97316' : 'transparent', color: isStudios ? 'white' : '#9CA3AF' }}>
            For Studios
          </Link>
        </div>

        {/* Right buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <a href="mailto:hello@joinfrolic.com" style={{ textDecoration: 'none', fontSize: '13px', fontWeight: '600', color: '#9CA3AF', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
            Contact
          </a>
          {isStudios ? (
            <>
              <Link href="/studio/login" style={{ textDecoration: 'none', fontSize: '13px', fontWeight: '600', color: '#9CA3AF', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                Log In
              </Link>
              <Link href="/studio/signup" style={{ background: '#F97316', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Sign Up
              </Link>
            </>
          ) : checked && (
            customer ? (
              <>
                <Link href="/account" style={{ textDecoration: 'none', fontSize: '13px', fontWeight: '600', color: '#9CA3AF', padding: '6px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                  Hi, {customer.first_name}
                </Link>
                <button onClick={handleLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#9CA3AF', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ textDecoration: 'none', fontSize: '13px', fontWeight: '600', color: '#9CA3AF', padding: '6px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                  Log In
                </Link>
                <Link href="/signup" style={{ background: '#F97316', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', whiteSpace: 'nowrap' }}>
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
