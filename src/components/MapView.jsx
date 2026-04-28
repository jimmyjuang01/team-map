import { useRef, useCallback } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import { getMemberCoordinates } from '../data/cityCoordinates'
import 'maplibre-gl/dist/maplibre-gl.css'

// Carto Dark Matter - free, no API key required
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const INITIAL_VIEW = {
  longitude: -98.5,
  latitude:  39.5,
  zoom:      3.5,
}

const RANK_COLORS = {
  SMD: { border: '#fbbf24', bg: '#451a03' }, // amber
  MD:  { border: '#d97706', bg: '#3b1f00' }, // orange-amber
  A:   { border: '#a8a29e', bg: '#292524' }, // stone
  TA:  { border: '#57534e', bg: '#1c1917' }, // dark stone
}

const RANK_SIZE = {
  SMD: 28,
  MD:  24,
  A:   20,
  TA:  16,
}

function MemberPin({ member, onClick }) {
  const coords = getMemberCoordinates(member)
  if (!coords) return null

  const colors = RANK_COLORS[member.rank] || RANK_COLORS.TA
  const size   = RANK_SIZE[member.rank]   || 20

  // Get initials from English name
  const initials = member.nameEn
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2) || '??'

  return (
    <Marker
      longitude={coords.lng}
      latitude={coords.lat}
      anchor="center"
      onClick={e => {
        e.originalEvent.stopPropagation()
        onClick(member)
      }}
    >
      <div
        title={`${member.nameZh} · ${member.rank}`}
        style={{
          width:           size,
          height:          size,
          borderRadius:    '50%',
          border:          `2px solid ${colors.border}`,
          background:      colors.bg,
          color:           colors.border,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          fontSize:        size * 0.35,
          fontWeight:      600,
          fontFamily:      'monospace',
          cursor:          'pointer',
          boxShadow:       `0 0 8px ${colors.border}40`,
          transition:      'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {initials}
      </div>
    </Marker>
  )
}

export default function MapView({ members, onMemberClick }) {
  const mapRef = useRef(null)

  const handleMapClick = useCallback(() => {
    // Click on empty map area — can be used to deselect
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        onClick={handleMapClick}
        attributionControl={false}
      >
        {/* Navigation controls (zoom in/out) */}
        <NavigationControl position="bottom-right" showCompass={false} />

        {/* Member pins */}
        {members.map(member => (
          <MemberPin
            key={member.employeeId}
            member={member}
            onClick={onMemberClick}
          />
        ))}
      </Map>

      {/* Legend */}
      <div style={{
        position:   'absolute',
        bottom:     48,
        left:       16,
        background: 'rgba(10,10,10,0.85)',
        border:     '1px solid #262626',
        padding:    '8px 12px',
        backdropFilter: 'blur(8px)',
      }}>
        <p style={{ color: '#525252', fontSize: 9, letterSpacing: '0.2em', marginBottom: 6, fontFamily: 'monospace' }}>
          RANK
        </p>
        {Object.entries(RANK_COLORS).map(([rank, colors]) => (
          <div key={rank} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              border: `2px solid ${colors.border}`,
              background: colors.bg,
            }} />
            <span style={{ color: '#a3a3a3', fontSize: 10, fontFamily: 'monospace' }}>{rank}</span>
          </div>
        ))}
      </div>

      {/* Attribution */}
      <div style={{
        position: 'absolute', bottom: 8, right: 8,
        color: '#404040', fontSize: 9, fontFamily: 'monospace',
      }}>
        © OpenStreetMap · © CARTO
      </div>
    </div>
  )
}