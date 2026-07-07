import { ImageResponse } from 'next/og'

// Dynamically generated 1200x630 social share card. Used for og:image and, via
// Next's fallback, the Twitter summary_large_image card too. No binary asset to
// maintain — it always reflects the current brand text below.
export const runtime = 'edge'
export const alt = 'Mivloc — World\'s Safest Secret Chat App'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #06152a 0%, #0a2540 55%, #072033 100%)',
          color: '#e6f4ff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              background: 'linear-gradient(135deg, #0ea5e9, #34d399)',
            }}
          >
            🛡️
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>Mivloc</div>
        </div>
        <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
          World&apos;s Safest
        </div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            background: 'linear-gradient(90deg, #34d399, #7dd3fc, #0ea5e9)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Secret Chat App
        </div>
        <div style={{ fontSize: 34, color: '#7dd3fc', marginTop: 36, maxWidth: 900 }}>
          Messages auto-encrypt in 60 seconds · One-time chats vanish forever
        </div>
        <div style={{ fontSize: 26, color: '#5b7a99', marginTop: 'auto' }}>
          mivloc.online · Chat Safely. Stay Protected.
        </div>
      </div>
    ),
    { ...size },
  )
}
