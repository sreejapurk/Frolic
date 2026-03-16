import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Frolic — Find Classes You\'ll Love, Near You',
  description: 'Find and book sports, music, and dance classes in your community.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#0F1624', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}