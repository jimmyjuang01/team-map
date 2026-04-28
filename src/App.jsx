import { useState, useEffect } from 'react'
import LoginScreen from './components/LoginScreen'
import Header from './components/Header'
import MapView from './components/MapView'
import { useMembers } from './hooks/useMembers'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mode, setMode]                       = useState('number')
  const [searchQuery, setSearchQuery]         = useState('')
  const [rankFilter, setRankFilter]           = useState([])
  const [licenseFilter, setLicenseFilter]     = useState([])
  const [selectedMember, setSelectedMember]   = useState(null)

  useEffect(() => {
    const auth = sessionStorage.getItem('team-map-auth')
    if (auth === 'true') setIsAuthenticated(true)
  }, [])

  const { members, filteredMembers, loading, error } = useMembers(
    searchQuery, rankFilter, licenseFilter
  )

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>

      <Header
        mode={mode}
        setMode={setMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        rankFilter={rankFilter}
        setRankFilter={setRankFilter}
        licenseFilter={licenseFilter}
        setLicenseFilter={setLicenseFilter}
        totalCount={members.length}
        filteredCount={filteredMembers.length}
      />

      {/* Map container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 10,
          }}>
            <p style={{ color: '#525252', fontFamily: 'monospace', letterSpacing: '0.2em', fontSize: 14 }}>
              LOADING MEMBERS...
            </p>
          </div>
        )}

        {error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 10,
          }}>
            <p style={{ color: '#f87171', fontFamily: 'monospace', letterSpacing: '0.2em', fontSize: 14 }}>
              ERROR: {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <MapView
            members={filteredMembers}
            onMemberClick={setSelectedMember}
          />
        )}

      </div>

      {/* Selected member bottom bar */}
      {selectedMember && (
        <div
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#171717', borderTop: '1px solid #262626',
            padding: '1rem', zIndex: 50, cursor: 'pointer',
          }}
          onClick={() => setSelectedMember(null)}
        >
          <div style={{
            maxWidth: 512, margin: '0 auto',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div>
              <p style={{ color: '#fef3c7', fontFamily: 'Georgia, serif', fontSize: 16 }}>
                {selectedMember.nameZh}
              </p>
              <p style={{ color: '#737373', fontFamily: 'monospace', fontSize: 12, marginTop: 4 }}>
                {selectedMember.nameEn} · {selectedMember.rank} · {selectedMember.city}, {selectedMember.state}
              </p>
            </div>
            <button style={{
              marginLeft: 'auto', color: '#525252', fontFamily: 'monospace',
              fontSize: 11, letterSpacing: '0.2em', background: 'none',
              border: 'none', cursor: 'pointer',
            }}>
              CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
  )
}