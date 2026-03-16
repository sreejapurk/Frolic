import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Frolic — Find Classes You\'ll Love, Near You'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0F1A',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            backgroundColor: '#F97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          <span style={{ fontSize: '60px', fontWeight: '900', color: 'white' }}>F</span>
        </div>
        <div style={{ fontSize: '72px', fontWeight: '900', color: 'white', letterSpacing: '-2px', marginBottom: '16px' }}>
          Frolic
        </div>
        <div style={{ fontSize: '28px', color: '#9CA3AF' }}>
          Find Classes You'll Love, Near You
        </div>
      </div>
    ),
    { ...size }
  )
}
