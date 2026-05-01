import { useState, useEffect } from 'react'
import LoginScreen from './components/LoginScreen'
import Header from './components/Header'
import MapView from './components/MapView'
import ProfileModal from './components/ProfileModal'
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

  const {
    members,
    filteredMembers,
    loading,
    error,
    stats,
  } = useMembers(searchQuery, rankFilter, licenseFilter)

  const hasActiveFilters = searchQuery || rankFilter.length > 0 || licenseFilter.length > 0

  const filteredIds = hasActiveFilters
    ? new Set(filteredMembers.map(m => m.employeeId))
    : null

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
        stats={stats}
      />

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
            members={members}
            filteredIds={filteredIds}
            onMemberClick={setSelectedMember}
          />
        )}

      </div>

      {selectedMember && (
        <ProfileModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

    </div>
  )
}
