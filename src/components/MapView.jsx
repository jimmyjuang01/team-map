import { useRef, useEffect, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { getMemberCoordinates } from '../data/cityCoordinates'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const RANK_COLORS = {
  SMD: { border: '#fbbf24', bg: '#451a03' },
  MD:  { border: '#d97706', bg: '#3b1f00' },
  A:   { border: '#a8a29e', bg: '#292524' },
  TA:  { border: '#57534e', bg: '#1c1917' },
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
      border:     '1px solid ' + colors.border + '40',
      boxShadow:  '0 8px 32px rgba(0,0,0,0.6)',
      zIndex:     100,
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '10px 12px 0',
      }}>
        <span style={{
          background:    colors.border,
          color:         member.rank === 'MD' || member.rank === 'TA' ? 'white' : '#0a0a0a',
          fontSize:      10, fontWeight: 700,
          letterSpacing: '0.15em', padding: '2px 8px', fontFamily: 'monospace',
        }}>
          {member.rank}
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none',
          color: '#525252', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0,
        }}>
          {'\u2715'}
        </button>
      </div>

      <div style={{ padding: '12px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: avatarBg, border: '2px solid ' + colors.border,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 18, fontWeight: 600,
          fontFamily: 'monospace', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#fef3c7', fontSize: 16, fontFamily: 'Georgia, serif', margin: 0 }}>
            {member.nameZh}
          </p>
          <p style={{ color: '#737373', fontSize: 11, fontFamily: 'monospace', margin: '4px 0 0' }}>
            {member.nameEn}
          </p>
          <p style={{ color: '#525252', fontSize: 10, fontFamily: 'monospace', margin: '4px 0 0', letterSpacing: '0.1em' }}>
            {member.city}, {member.state}
          </p>
        </div>
      </div>

      {member.licenses && member.licenses.length > 0 && (
        <div style={{ padding: '0 12px 10px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {member.licenses.slice(0, 4).map(function(l) {
            return (
              <span key={l} style={{
                background: 'rgba(120,53,15,0.3)', border: '1px solid #78350f',
                color: '#fcd34d', fontSize: 10, padding: '2px 6px',
                borderRadius: 3, fontFamily: 'monospace',
              }}>{l}</span>
            )
          })}
        </div>
      )}

      <button
        onClick={function() { onViewProfile(member) }}
        style={{
          display: 'block', width: '100%', padding: '10px',
          background: colors.border,
          color: member.rank === 'MD' || member.rank === 'TA' ? 'white' : '#0a0a0a',
          border: 'none', cursor: 'pointer', fontFamily: 'monospace',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
        }}
      >
        View Full Profile
      </button>
    </div>
  )
}

function createPin(member, isMatch, cityCounter, onClickFn) {
  var key    = member.city + ',' + member.state
  var index  = cityCounter[key] || 0
  cityCounter[key] = index + 1

  var coords = getMemberCoordinates(member, index)
  if (!coords) return null

  var colors    = RANK_COLORS[member.rank] || RANK_COLORS.TA
  var size      = RANK_SIZE[member.rank]   || 20
  var nameParts = (member.nameEn || '').split(' ')
  var initials  = nameParts.map(function(n) { return n[0] }).join('').slice(0, 2) || '??'

  var pinBorder = isMatch ? colors.border : '#2a2a2a'
  var pinBg     = isMatch ? colors.bg     : '#1a1a1a'
  var pinColor  = isMatch ? colors.border : '#2a2a2a'
  var pinShadow = isMatch ? ('0 0 8px ' + colors.border + '60') : 'none'
  var pinSize   = isMatch ? size : 8

  var wrapper = document.createElement('div')
  wrapper.style.width          = pinSize + 'px'
  wrapper.style.height         = pinSize + 'px'
  wrapper.style.display        = 'flex'
  wrapper.style.alignItems     = 'center'
  wrapper.style.justifyContent = 'center'
  wrapper.style.cursor         = isMatch ? 'pointer' : 'default'
  wrapper.style.zIndex         = isMatch ? '10' : '1'

  var el = document.createElement('div')
  el.style.width           = pinSize + 'px'
  el.style.height          = pinSize + 'px'
  el.style.borderRadius    = '50%'
  el.style.border          = '1px solid ' + pinBorder
  el.style.background      = pinBg
  el.style.color           = pinColor
  el.style.display         = 'flex'
  el.style.alignItems      = 'center'
  el.style.justifyContent  = 'center'
  el.style.fontSize        = (pinSize * 0.35) + 'px'
  el.style.fontWeight      = '600'
  el.style.fontFamily      = 'monospace'
  el.style.cursor          = isMatch ? 'pointer' : 'default'
  el.style.boxShadow       = pinShadow
  el.style.transition      = 'all 0.15s'
  el.style.userSelect      = 'none'
  el.style.pointerEvents   = 'all'
  el.textContent           = isMatch ? initials : ''
  el.title                 = member.nameZh + ' · ' + member.rank

  wrapper.appendChild(el)

  if (isMatch) {
    wrapper.addEventListener('mouseenter', function() {
      var newSize            = size * 1.35
      wrapper.style.width    = newSize + 'px'
      wrapper.style.height   = newSize + 'px'
      el.style.width         = newSize + 'px'
      el.style.height        = newSize + 'px'
      el.style.fontSize      = (newSize * 0.35) + 'px'
      el.style.boxShadow     = '0 0 14px ' + colors.border + '90'
    })
    wrapper.addEventListener('mouseleave', function() {
      wrapper.style.width    = size + 'px'
      wrapper.style.height   = size + 'px'
      el.style.width         = size + 'px'
      el.style.height        = size + 'px'
      el.style.fontSize      = (size * 0.35) + 'px'
      el.style.boxShadow     = '0 0 8px ' + colors.border + '60'
    })
    wrapper.addEventListener('click', function(e) {
      e.stopPropagation()
      onClickFn(member)
    })
  }

  return { wrapper: wrapper, coords: coords }
}

export default function MapView({ members, filteredIds, onMemberClick }) {
  var mapContainerRef = useRef(null)
  var mapRef          = useRef(null)
  var markersRef      = useRef([])
  var popupState      = useState(null)
  var popupMember     = popupState[0]
  var setPopupMember  = popupState[1]

  useEffect(function() {
    if (mapRef.current) return

    var map = new maplibregl.Map({
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

    map.on('click', function() { setPopupMember(null) })
    mapRef.current = map

    return function() {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(function() {
    var map = mapRef.current
    if (!map) return

    function addMarkers() {
      markersRef.current.forEach(function(m) { m.remove() })
      markersRef.current = []

      // Draw dimmed pins first, matched pins on top
      var dimmed  = members.filter(function(m) {
        return filteredIds && !filteredIds.has(m.employeeId)
      })
      var matched = members.filter(function(m) {
        return !filteredIds || filteredIds.has(m.employeeId)
      })
      var ordered = dimmed.concat(matched)

      // cityCounter is shared so offset logic stays consistent
      var cityCounter = {}

      ordered.forEach(function(member) {
        var isMatch = !filteredIds || filteredIds.has(member.employeeId)
        var result  = createPin(member, isMatch, cityCounter, setPopupMember)
        if (!result) return

        var marker = new maplibregl.Marker({ element: result.wrapper, anchor: 'center' })
          .setLngLat([result.coords.lng, result.coords.lat])
          .addTo(map)

        markersRef.current.push(marker)
      })
    }

    if (map.isStyleLoaded()) {
      addMarkers()
    } else {
      map.once('load', addMarkers)
    }

    return function() {
      markersRef.current.forEach(function(m) { m.remove() })
      markersRef.current = []
    }
  }, [members, filteredIds])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {popupMember && (
        <MemberPopup
          member={popupMember}
          onClose={function() { setPopupMember(null) }}
          onViewProfile={function(m) {
            setPopupMember(null)
            onMemberClick(m)
          }}
        />
      )}

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
        {Object.entries(RANK_COLORS).map(function(entry) {
          var rank   = entry[0]
          var colors = entry[1]
          return (
            <div key={rank} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                border: '2px solid ' + colors.border,
                background: colors.bg,
              }} />
              <span style={{ color: '#a3a3a3', fontSize: 10, fontFamily: 'monospace' }}>
                {rank}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{
        position: 'absolute', bottom: 8, right: 48,
        color: '#404040', fontSize: 9, fontFamily: 'monospace', zIndex: 1,
      }}>
        © OpenStreetMap · © CARTO
      </div>
    </div>
  )
}
