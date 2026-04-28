import { useState, useEffect } from 'react'
import LoginScreen from './components/LoginScreen'
import Header from './components/Header'
import { useMembers } from './hooks/useMembers'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mode, setMode] = useState('number')
  const [searchQuery, setSearchQuery] = useState('')
  const [rankFilter, setRankFilter] = useState([])
  const [licenseFilter, setLicenseFilter] = useState([])

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
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
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

      {/* Main content placeholder */}
      <main className="p-6">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <p className="text-neutral-500 font-mono tracking-widest text-sm animate-pulse">
              LOADING MEMBERS...
            </p>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-400 font-mono tracking-widest text-sm">
              ERROR: {error}
            </p>
          </div>
        )}
        {!loading && !error && (
          <div className="flex items-center justify-center h-64">
            <p className="text-neutral-500 font-mono tracking-widest text-sm">
              {filteredMembers.length} MEMBERS LOADED · MAP COMING SOON
            </p>
          </div>
        )}
      </main>
    </div>
  )
}