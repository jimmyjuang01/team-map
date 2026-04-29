import { useRef, useEffect, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { getMemberCoordinates } from '../data/cityCoordinates'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const RANK_COLORS = {
  SMD: { border: '#fbbf24', bg: '#451a03', label: '#fbbf24' },
  MD:  { border: '#d97706', bg: '#3b1f00', label: '#d97706' },
  A:   { border: '#a8a29e', bg: '#292524', label: '#a8a29e' },
  TA:  { border: '#57534e', bg: '#1c1917', label: '#57534e' },
}

const RANK_SIZE = {
  SMD: 32,
  MD:  26,
  A:   20,
  TA:  16,
}

const AVATAR_COLORS = [
  '#9f1239','#115e59','#3730a3','#9a3412',
  '#065f46','#5b21b6','#075985','#9d174d',
]

function getAvatarBg(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function MemberPopup({ member, onClose, onViewProfile }) {
  const colors   = RANK_COLORS[member.rank] || RANK_COLORS.TA
  const initials = member.nameEn?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'
  const avatarBg = getAvatarBg(member.nameEn || '')

  return (
    <div style={{
      position:   'absolute',
      bottom:     20,
      left:       '50%',
      transform:  'translateX(-50%)',
      width:      280,
      background: '#171717',
      border:     `1px solid ${colors.border}40`,
      boxShadow:  `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${colors.border}20`,
      zIndex:     100,
      fontFamily: 'sans-serif',
    }}>
      {/* Top bar with rank and close */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        padding:        '10px 12px 0',
      }}>
        <span style={{
          background: colors.border,
          color:      member.rank === 'MD' || member.rank === 'TA' ? 'white' : '#0a0a0a',
          fontSize:   10,
          fontWeight: 700,
          letterSpacing: '0.15em',
          padding:    '2px 8px',
          fontFamily: 'monospace',
        }}>
          {member.rank}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none',
            color: '#525252', cursor: 'pointer',
            fontSize: 16, lineHeight: 1, padding: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Member info */}
      <div style={{ padding: '12px', display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* Avatar */}
        <div style={{
          width:          52,
          height:         52,
          borderRadius:   '50%',
          background:     avatarBg,
          border:         `2px solid ${colors.border}`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          color:          'white',
          fontSize:       18,
          fontWeight:     600,
          fontFamily:     'monospace',
          flexShrink:     0,
        }}>
          {initials}
        </div>

        {/* Name + location */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color:      '#fef3c7',
            fontSize:   16,
            fontFamily: 'Georgia, serif',
            margin:     0,
            lineHeight: 1.2,
          }}>
            {member.nameZh}
          </p>
          <p style={{
            color:      '#737373',
            fontSize:   11,
            fontFamily: 'monospace',
            margin:     '4px 0 0',
          }}>
            {member.nameEn}
          </p>
          <p style={{
            color:      '#525252',
            fontSize:   10,
            fontFamily: 'monospace',
            margin:     '4px 0 0',
            letterSpacing: '0.1em',
          }}>
            {member.city}, {member.state}
          </p>
        </div>
      </div>

      {/* Licenses */}
      {member.licenses?.length > 0 && (
        <div style={{ padding: '0 12px 10px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {member.licenses.slice(0, 4).map(l => (
            <span key={l} style={{
              background:    'rgba(120,53,15,0.3)',
              border:        '1px solid #78350f',
              color:         '#fcd34d',
              fontSize:      10,
              padding:       '2px 6px',
              borderRadius:  3,
              fontFamily:    'monospace',
            }}>
              {l}
            </span>
          ))}
        </div>
      )}

      {/* View Profile button */}
      <button
        onClick={() => onViewProfile(member)}
        style={{
          display:       'block',
          width:         '100%',
          padding:       '10px',
          background:    colors.border,
          color:         member.rank === 'MD' || member.rank === 'TA' ? 'white' : '#0a0a0a',
          border:        'none',
          cursor:        'pointer',
          fontFamily:    'monospace',
          fontSize:      11,
          fontWeight:    600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        View Full Profile →
      </button>
    </div>
  )
}

export default function MapView({ members, onMemberClick }) {
  const mapContainerRef = useRef(null)
  const mapRef          = useRef(null)
  const markersRef      = useRef([])
  const [popupMember, setPopupMember] = useState(null)

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style:     MAP_STYLE,
      center:    [-98.5, 39.5],
      zoom:      3.5,
      attributionControl: false,
    })

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'bottom-right'
    )

    // Click on map background closes popup
    map.on('click', () => setPopupMember(null))

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers when members change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const addMarkers = () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      const cityCounter = {}
      members.forEach(member => {
        const key        = `${member.city},${member.state}`
        const index      = cityCounter[key] || 0
        cityCounter[key] = index + 1

        const coords = getMemberCoordinates(member, index)
        if (!coords) return

        const colors   = RANK_COLORS[member.rank] || RANK_COLORS.TA
        const size     = RANK_SIZE[member.rank]   || 20
        const initials = member.nameEn
          ?.split(' ')
          .map(n => n[0])
          .join('')
          .slice(0, 2) || '??'

        const wrapper = document.createElement('div')
        wrapper.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        `

        const el = document.createElement('div')
        el.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 2px solid ${colors.border};
          background: ${colors.bg};
          color: ${colors.border};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size * 0.35}px;
          font-weight: 600;
          font-family: monospace;
          cursor: pointer;
          box-shadow: 0 0 8px ${colors.border}60;
          transition: width 0.15s, height 0.15s, font-size 0.15s;
          user-select: none;
          pointer-events: all;
        `
        el.textContent = initials
        el.title = `${member.nameZh} · ${member.rank}`

        wrapper.appendChild(el)

        wrapper.addEventListener('mouseenter', () => {
          el.style.width     = `${size * 1.35}px`
          el.style.height    = `${size * 1.35}px`
          el.style.fontSize  = `${size * 1.35 * 0.35}px`
          el.style.boxShadow = `0 0 14px ${colors.border}90`
        })
        wrapper.addEventListener('mouseleave', () => {
          el.style.width     = `${size}px`
          el.style.height    = `${size}px`
          el.style.fontSize  = `${size * 0.35}px`
          el.style.boxShadow = `0 0 8px ${colors.border}60`
        })
        wrapper.addEventListener('click', e => {
          e.stopPropagation()
          setPopupMember(member)
        })

        const marker = new maplibregl.Marker({ element: wrapper, anchor: 'center' })
          .setLngLat([coords.lng, coords.lat])
          .addTo(map)

        markersRef.current.push(marker)
      })
    }

    if (map.isStyleLoaded()) {
      addMarkers()
    } else {
      map.once('load', addMarkers)
    }

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
    }
  }, [members, onMemberClick])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Popup */}
      {popupMember && (
        <MemberPopup
          member={popupMember}
          onClose={() => setPopupMember(null)}
          onViewProfile={(member) => {
            setPopupMember(null)
            onMemberClick(member)
          }}
        />
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 48, left: 16,
        background: 'rgba(10,10,10,0.85)',
        border: '1px solid #262626',
        padding: '8px 12px',
        backdropFilter: 'blur(8px)',
        zIndex: 1,
      }}>
        <p style={{
          color: '#525252', fontSize: 9, letterSpacing: '0.2em',
          marginBottom: 6, fontFamily: 'monospace', textTransform: 'uppercase',
        }}>
          Rank
        </p>
        {Object.entries(RANK_COLORS).map(([rank, colors]) => (
          <div key={rank} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              border: `2px solid ${colors.border}`,
              background: colors.bg,
            }} />
            <span style={{ color: '#a3a3a3', fontSize: 10, fontFamily: 'monospace' }}>
              {rank}
            </span>
          </div>
        ))}
      </div>

      {/* Attribution */}
      <div style={{
        position: 'absolute', bottom: 8, right: 48,
        color: '#404040', fontSize: 9, fontFamily: 'monospace', zIndex: 1,
      }}>
        © OpenStreetMap · © CARTO
      </div>
    </div>
  )
}