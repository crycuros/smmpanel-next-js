import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'SMMFeeds - Best SMM Panel Philippines'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function Icon({ path, size = 24, color = 'white' }: { path: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d={path} />
    </svg>
  )
}

const boltPath = "M13 2L3 14h9l-1 10 10-12h-9l1-10z"
const diamondPath = "M12 2L2 9l10 13L22 9l-10-7zm0 2.5L19 10l-7 9-7-9 7-5.5z"
const shieldCheckPath = "M12 2l8 4v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4zm-1 14l-3-3 1.41-1.41L11 13.17l5.59-5.58L18 9l-7 7z"

const fbPath = "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"
const igPath = "M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2zm4.5 5a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.25-3.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z"
const tiktokPath = "M16.6 5.82A4.28 4.28 0 0113.4 2h-3.1v13.42a2.6 2.6 0 01-2.6 2.52 2.6 2.6 0 01-2.6-2.6 2.6 2.6 0 012.6-2.6c.27 0 .53.04.78.1V9.67a5.77 5.77 0 00-.78-.05 5.73 5.73 0 00-5.73 5.73A5.73 5.73 0 007.37 21a5.73 5.73 0 005.73-5.73V9.08a7.4 7.4 0 004.33 1.39V7.32a4.28 4.28 0 01-.83-1.5z"
const ytPath = "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"
const twPath = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"
const scPath = "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24 18.635 24 24 18.633 24 12.013 24 5.393 18.635.026 12.017.026V0z"

const socialIcons = [
  { path: fbPath, label: 'Facebook' },
  { path: igPath, label: 'Instagram' },
  { path: tiktokPath, label: 'TikTok' },
  { path: ytPath, label: 'YouTube' },
  { path: twPath, label: 'Twitter' },
  { path: scPath, label: 'Snapchat' },
]

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

        {/* Rocket SVG */}
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px' }}>
          <path d="M12 2C12 2 7 7 7 12C7 14.5 8 16.5 9.5 18L12 22L14.5 18C16 16.5 17 14.5 17 12C17 7 12 2 12 2Z" fill="#E8368D" />
          <path d="M12 2C12 2 9 5 8 9C7.5 11 8 13 9 15L12 22" fill="#F472B6" opacity="0.6" />
          <circle cx="12" cy="11" r="2" fill="white" />
          <path d="M5 14L3 17L7 16L5 14Z" fill="#EC4899" />
          <path d="M19 14L21 17L17 16L19 14Z" fill="#EC4899" />
          <path d="M10.5 18.5L9 22L12 20L15 22L13.5 18.5" fill="#F472B6" opacity="0.5" />
        </svg>

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

        {/* Feature pills with SVG icons */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '50px' }}>
          {/* Instant Delivery */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '22px', border: '1px solid rgba(232,54,141,0.4)', background: 'rgba(232,54,141,0.15)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#F472B6" xmlns="http://www.w3.org/2000/svg">
              <path d={boltPath} />
            </svg>
            <span style={{ color: '#F472B6', fontSize: '18px', fontWeight: 500 }}>Instant Delivery</span>
          </div>
          {/* Affordable */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '22px', border: '1px solid rgba(232,54,141,0.4)', background: 'rgba(232,54,141,0.15)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#F472B6" xmlns="http://www.w3.org/2000/svg">
              <path d={diamondPath} />
            </svg>
            <span style={{ color: '#F472B6', fontSize: '18px', fontWeight: 500 }}>Affordable</span>
          </div>
          {/* 24/7 Support */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '22px', border: '1px solid rgba(232,54,141,0.4)', background: 'rgba(232,54,141,0.15)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#F472B6" xmlns="http://www.w3.org/2000/svg">
              <path d={shieldCheckPath} />
            </svg>
            <span style={{ color: '#F472B6', fontSize: '18px', fontWeight: 500 }}>24/7 Support</span>
          </div>
        </div>

        {/* Social platform icons */}
        <div style={{ display: 'flex', gap: '28px', marginBottom: '30px' }}>
          {socialIcons.map((icon) => (
            <div key={icon.label} style={{ opacity: 0.7 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d={icon.path} />
              </svg>
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ fontSize: '22px', color: '#E8368D', fontWeight: 600, letterSpacing: '3px' }}>
          smmfeeds.com
        </div>

        {/* Bottom accent */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #E8368D, #EC4899, #F472B6)' }} />
      </div>
    ),
    { ...size }
  )
}
