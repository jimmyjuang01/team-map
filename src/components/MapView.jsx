import { useRef, useEffect, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import Supercluster from 'supercluster'
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
      width:      '85vw',
      maxWidth:   300,
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
        <button
          onClick={function(e) { e.stopPropagation(); onClose() }}
          onTouchEnd={function(e) { e.stopPropagation(); e.preventDefault(); onClose() }}
          style={{
            background: 'none', border: 'none',
            color: '#525252', cursor: 'pointer',
            fontSize: 20, lineHeight: 1, padding: '4px 8px',
          }}
        >
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
        onClick={function(e) { e.stopPropagation(); onViewProfile(member) }}
        onTouchEnd={function(e) { e.stopPropagation(); e.preventDefault(); onViewProfile(member) }}
        style={{
          display: 'block', width: '100%', padding: '12px',
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

function buildClusterIndex(members, filteredIds) {
  var points      = []
  var cityCounter = {}

  members.forEach(function(member) {
    var key    = member.city + ',' + member.state
    var index  = cityCounter[key] || 0
    cityCounter[key] = index + 1

    var coords  = getMemberCoordinates(member, index)
    if (!coords) return

    var isMatch = !filteredIds || filteredIds.has(member.employeeId)
    points.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [coords.lng, coords.lat] },
      properties: { member: member, isMatch: isMatch },
    })
  })

  var idx = new Supercluster({ radius: 60, maxZoom: 16, minPoints: 2 })
  idx.load(points)
  return idx
}

function createClusterEl(count, hasMatchedMembers) {
  var baseSize = count < 5 ? 36 : count < 15 ? 44 : 56

  var wrapper = document.createElement('div')
  wrapper.style.width          = baseSize + 'px'
  wrapper.style.height         = baseSize + 'px'
  wrapper.style.display        = 'flex'
  wrapper.style.alignItems     = 'center'
  wrapper.style.justifyContent = 'center'
  wrapper.style.cursor         = 'pointer'

  var inner = document.createElement('div')
  inner.style.width           = baseSize + 'px'
  inner.style.height          = baseSize + 'px'
  inner.style.borderRadius    = '50%'
  inner.style.background      = hasMatchedMembers ? 'rgba(251,191,36,0.15)' : 'rgba(40,40,40,0.5)'
  inner.style.border          = '2px solid ' + (hasMatchedMembers ? '#fbbf24' : '#333333')
  inner.style.display         = 'flex'
  inner.style.alignItems      = 'center'
  inner.style.justifyContent  = 'center'
  inner.style.color           = hasMatchedMembers ? '#fef3c7' : '#555555'
  inner.style.fontSize        = (baseSize * 0.32) + 'px'
  inner.style.fontFamily      = 'Georgia, serif'
  inner.style.fontWeight      = '500'
  inner.style.boxShadow       = hasMatchedMembers ? '0 0 20px rgba(251,191,36,0.3)' : 'none'
  inner.style.transition      = 'width 0.15s, height 0.15s, font-size 0.15s'
  inner.textContent           = count

  wrapper.appendChild(inner)

  var expand = function() {
    var hoverSize        = baseSize * 1.35
    wrapper.style.width  = hoverSize + 'px'
    wrapper.style.height = hoverSize + 'px'
    inner.style.width    = hoverSize + 'px'
    inner.style.height   = hoverSize + 'px'
    inner.style.fontSize = (hoverSize * 0.32) + 'px'
  }
  var collapse = function() {
    wrapper.style.width  = baseSize + 'px'
    wrapper.style.height = baseSize + 'px'
    inner.style.width    = baseSize + 'px'
    inner.style.height   = baseSize + 'px'
    inner.style.fontSize = (baseSize * 0.32) + 'px'
  }

  wrapper.addEventListener('mouseenter', expand)
  wrapper.addEventListener('mouseleave', collapse)
  wrapper.addEventListener('touchstart', function(e) { e.stopPropagation(); expand() }, { passive: true })
  wrapper.addEventListener('touchend',   function(e) { e.stopPropagation(); collapse() }, { passive: true })

  return wrapper
}

function createPinEl(member, isMatch) {
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
  el.style.width          = pinSize + 'px'
  el.style.height         = pinSize + 'px'
  el.style.borderRadius   = '50%'
  el.style.border         = '1px solid ' + pinBorder
  el.style.background     = pinBg
  el.style.color          = pinColor
  el.style.display        = 'flex'
  el.style.alignItems     = 'center'
  el.style.justifyContent = 'center'
  el.style.fontSize       = (pinSize * 0.35) + 'px'
  el.style.fontWeight     = '600'
  el.style.fontFamily     = 'monospace'
  el.style.cursor         = isMatch ? 'pointer' : 'default'
  el.style.boxShadow      = pinShadow
  el.style.transition     = 'all 0.15s'
  el.style.userSelect     = 'none'
  el.style.pointerEvents  = 'all'
  el.textContent          = isMatch ? initials : ''
  el.title                = member.nameZh + ' · ' + member.rank

  wrapper.appendChild(el)

  if (isMatch) {
    var expand = function() {
      var newSize            = size * 1.35
      wrapper.style.width    = newSize + 'px'
      wrapper.style.height   = newSize + 'px'
      el.style.width         = newSize + 'px'
      el.style.height        = newSize + 'px'
      el.style.fontSize      = (newSize * 0.35) + 'px'
      el.style.boxShadow     = '0 0 14px ' + colors.border + '90'
    }
    var collapse = function() {
      wrapper.style.width    = size + 'px'
      wrapper.style.height   = size + 'px'
      el.style.width         = size + 'px'
      el.style.height        = size + 'px'
      el.style.fontSize      = (size * 0.35) + 'px'
      el.style.boxShadow     = '0 0 8px ' + colors.border + '60'
    }

    wrapper.addEventListener('mouseenter', expand)
    wrapper.addEventListener('mouseleave', collapse)
    wrapper.addEventListener('touchstart', function(e) {
      e.stopPropagation()
      expand()
    }, { passive: true })
  }

  return wrapper
}

export default function MapView({ members, filteredIds, onMemberClick }) {
  var mapContainerRef = useRef(null)
  var mapRef          = useRef(null)
  var markersRef      = useRef([])
  var clusterIndexRef = useRef(null)
  var popupState      = useState(null)
  var popupMember     = popupState[0]
  var setPopupMember  = popupState[1]

  useEffect(function() {
    if (mapRef.current) return

    var map = new maplibregl.Map({
      container:          mapContainerRef.current,
      style:              MAP_STYLE,
      center:             [-98.5, 39.5],
      zoom:               3.5,
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

  var renderMarkers = useCallback(function() {
    var map   = mapRef.current
    var index = clusterIndexRef.current
    if (!map || !index) return

    markersRef.current.forEach(function(m) { m.remove() })
    markersRef.current = []

    var zoom   = Math.floor(map.getZoom())
    var bounds = map.getBounds()
    var bbox   = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]
    var clusters = index.getClusters(bbox, zoom)

    clusters.sort(function(a, b) {
      var aMatch = a.properties.cluster ? true : (!filteredIds || filteredIds.has(a.properties.member.employeeId))
      var bMatch = b.properties.cluster ? true : (!filteredIds || filteredIds.has(b.properties.member.employeeId))
      return aMatch === bMatch ? 0 : aMatch ? 1 : -1
    })

    clusters.forEach(function(feature) {
      var lng = feature.geometry.coordinates[0]
      var lat = feature.geometry.coordinates[1]

      if (feature.properties.cluster) {
        var clusterId  = feature.properties.cluster_id
        var count      = feature.properties.point_count
        var leaves     = index.getLeaves(clusterId, Infinity)
        var hasMatched = leaves.some(function(leaf) {
          return !filteredIds || filteredIds.has(leaf.properties.member.employeeId)
        })

        if (filteredIds && !hasMatched) {
          var dot = document.createElement('div')
          dot.style.width        = '8px'
          dot.style.height       = '8px'
          dot.style.borderRadius = '50%'
          dot.style.background   = '#1a1a1a'
          dot.style.border       = '1px solid #2a2a2a'
          var dotMarker = new maplibregl.Marker({ element: dot, anchor: 'center' })
            .setLngLat([lng, lat]).addTo(map)
          markersRef.current.push(dotMarker)
          return
        }

        var displayCount = filteredIds
          ? leaves.filter(function(leaf) {
              return filteredIds.has(leaf.properties.member.employeeId)
            }).length
          : count

        var clusterEl = createClusterEl(displayCount, hasMatched)

        var handleClusterTap = function(e) {
          e.stopPropagation()
          if (e.cancelable) e.preventDefault()
          var expansionZoom = Math.min(index.getClusterExpansionZoom(clusterId), 18)
          map.easeTo({ center: [lng, lat], zoom: expansionZoom + 1 })
        }
        clusterEl.addEventListener('click',    handleClusterTap)
        clusterEl.addEventListener('touchend', handleClusterTap)

        var clusterMarker = new maplibregl.Marker({ element: clusterEl, anchor: 'center' })
          .setLngLat([lng, lat]).addTo(map)
        markersRef.current.push(clusterMarker)

      } else {
        var member  = feature.properties.member
        var isMatch = !filteredIds || filteredIds.has(member.employeeId)
        var pinEl   = createPinEl(member, isMatch)

        if (isMatch) {
          var handlePinTap = function(e) {
            e.stopPropagation()
            if (e.cancelable) e.preventDefault()
            setPopupMember(member)
          }
          pinEl.addEventListener('click',    handlePinTap)
          pinEl.addEventListener('touchend', handlePinTap)
        }

        var pinMarker = new maplibregl.Marker({ element: pinEl, anchor: 'center' })
          .setLngLat([lng, lat]).addTo(map)
        markersRef.current.push(pinMarker)
      }
    })
  }, [filteredIds, setPopupMember])

  useEffect(function() {
    var map = mapRef.current
    if (!map) return

    clusterIndexRef.current = buildClusterIndex(members, filteredIds)

    var doRender = function() { renderMarkers() }

    if (map.isStyleLoaded()) {
      doRender()
    } else {
      map.once('load', doRender)
    }

    map.on('moveend', doRender)

    return function() {
      map.off('moveend', doRender)
      markersRef.current.forEach(function(m) { m.remove() })
      markersRef.current = []
    }
  }, [members, filteredIds, renderMarkers])

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
