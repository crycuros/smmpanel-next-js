import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'SMMFeeds - Best SMM Panel Philippines'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a0a1e 0%, #2d1233 50%, #1a0a1e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '-80px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,54,141,0.35) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #E8368D, #EC4899, #F472B6)' }} />

        {/* Title */}
        <div style={{ fontSize: '80px', fontWeight: 'bold', color: 'white', letterSpacing: '2px', marginBottom: '8px' }}>
          SMMFeeds
        </div>

        {/* Accent line */}
        <div style={{ width: '300px', height: '4px', borderRadius: '2px', background: 'linear-gradient(90deg, #E8368D, #EC4899, #F472B6)', marginBottom: '20px' }} />

        {/* Subtitle */}
        <div style={{ fontSize: '28px', color: '#d4a0b8', marginBottom: '40px' }}>
          Best SMM Panel in the Philippines
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 28px', borderRadius: '24px', border: '1px solid rgba(232,54,141,0.4)', background: 'rgba(232,54,141,0.15)' }}>
            <span style={{ fontSize: '20px', color: '#F472B6' }}>&#9889;</span>
            <span style={{ color: '#F472B6', fontSize: '18px', fontWeight: 500 }}>Instant Delivery</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 28px', borderRadius: '24px', border: '1px solid rgba(232,54,141,0.4)', background: 'rgba(232,54,141,0.15)' }}>
            <span style={{ fontSize: '20px', color: '#F472B6' }}>&#10024;</span>
            <span style={{ color: '#F472B6', fontSize: '18px', fontWeight: 500 }}>Affordable</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 28px', borderRadius: '24px', border: '1px solid rgba(232,54,141,0.4)', background: 'rgba(232,54,141,0.15)' }}>
            <span style={{ fontSize: '20px', color: '#F472B6' }}>&#128737;</span>
            <span style={{ color: '#F472B6', fontSize: '18px', fontWeight: 500 }}>24/7 Support</span>
          </div>
        </div>

        {/* Social icons - plain text symbols */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '36px' }}>
          {['Facebook', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Snapchat'].map((name) => (
            <div
              key={name}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(232,54,141,0.2)',
                border: '1px solid rgba(232,54,141,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#F472B6',
                fontWeight: 600,
              }}
            >
              {name.charAt(0)}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ fontSize: '24px', color: '#E8368D', fontWeight: 600, letterSpacing: '3px' }}>
          smmfeeds.com
        </div>

        {/* Bottom accent */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #E8368D, #EC4899, #F472B6)' }} />
      </div>
    ),
    { ...size }
  )
}
