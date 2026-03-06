'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const isStudios = pathname?.startsWith('/for-studios')

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#0F1624', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <Link href="/" style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', textDecoration: 'none' }}>Frolic</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/" style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', backgroundColor: !isStudios ? '#F97316' : 'transparent', color: 'white' }}>Search</Link>
        <Link href="/for-studios" style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', backgroundColor: isStudios ? '#F97316' : 'transparent', color: 'white' }}>For Studios</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Log In</button>
        <button style={{ backgroundColor: '#F97316', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Sign Up</button>
      </div>
    </nav>
  )
}
