import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'SMMFeeds - Best SMM Panel Philippines'
export const size = {
  width: 1200,
  height: 630,
}
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
            top: '-100px',
            left: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,54,141,0.35) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #E8368D, #EC4899, #F472B6)',
          }}
        />

        {/* Rocket emoji */}
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚀</div>

        {/* Main title */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            color: 'white',
            letterSpacing: '2px',
            marginBottom: '8px',
          }}
        >
          SMMFeeds
        </div>

        {/* Accent line */}
        <div
          style={{
            width: '300px',
            height: '4px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #E8368D, #EC4899, #F472B6)',
            marginBottom: '20px',
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#d4a0b8',
            marginBottom: '40px',
          }}
        >
          Best SMM Panel in the Philippines
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '50px',
          }}
        >
          {['⚡ Instant Delivery', '💰 Affordable', '🛡️ 24/7 Support'].map(
            (text) => (
              <div
                key={text}
                style={{
                  padding: '10px 24px',
                  borderRadius: '22px',
                  border: '1px solid rgba(232,54,141,0.4)',
                  background: 'rgba(232,54,141,0.15)',
                  color: '#F472B6',
                  fontSize: '18px',
                  fontWeight: 500,
                }}
              >
                {text}
              </div>
            )
          )}
        </div>

        {/* Social icons */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            fontSize: '32px',
            opacity: 0.7,
            marginBottom: '30px',
          }}
        >
          <span>📘</span>
          <span>📸</span>
          <span>🎵</span>
          <span>▶️</span>
          <span>🐦</span>
          <span>👻</span>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: '22px',
            color: '#E8368D',
            fontWeight: 600,
            letterSpacing: '3px',
          }}
        >
          smmfeeds.com
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #E8368D, #EC4899, #F472B6)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
