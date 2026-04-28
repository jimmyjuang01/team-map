import { Hash, Users, Search, Filter, X } from 'lucide-react'
import { useState } from 'react'

export default function Header({
  mode, setMode,
  searchQuery, setSearchQuery,
  rankFilter, setRankFilter,
  licenseFilter, setLicenseFilter,
  totalCount, filteredCount,
}) {
  const [showFilters, setShowFilters] = useState(false)

  const RANKS = ['SMD', 'MD', 'A', 'TA']
  const RANK_COLORS = {
    SMD: 'bg-amber-400 text-neutral-900',
    MD:  'bg-amber-600 text-white',
    A:   'bg-stone-400 text-neutral-900',
    TA:  'bg-stone-600 text-white',
  }

  const toggleRank = (rank) => {
    setRankFilter(prev =>
      prev.includes(rank) ? prev.filter(r => r !== rank) : [...prev, rank]
    )
  }

  const toggleLicense = (license) => {
    setLicenseFilter(prev =>
      prev.includes(license) ? prev.filter(l => l !== license) : [...prev, license]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setRankFilter([])
    setLicenseFilter([])
  }

  const hasFilters = searchQuery || rankFilter.length > 0 || licenseFilter.length > 0
  const filterCount = rankFilter.length + licenseFilter.length

  const ALL_LICENSES = [
    'Life', 'P&C', 'Investment',
    'Series 6', 'Series 7', 'Series 63', 'Series 65', 'Series 66',
    'CFP', 'RFC', 'IARFC', 'ChFC', 'CLU',
  ]

  return (
    <header className="border-b border-neutral-900 px-4 md:px-8 py-4 bg-neutral-950 sticky top-0 z-40">

      {/* Top row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-400 rotate-45 flex-shrink-0" />
          <div>
            <h1
              className="text-lg text-amber-50 tracking-wide leading-none"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Team Map
            </h1>
            <p className="text-[9px] text-neutral-600 tracking-[0.3em] uppercase mt-1 font-mono">
              US · City Level
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex border border-neutral-800">
          <button
            onClick={() => setMode('number')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-widest font-mono transition-colors
              ${mode === 'number'
                ? 'bg-amber-400 text-neutral-900'
                : 'text-neutral-500 hover:text-amber-400'
              }`}
          >
            <Hash size={12} /> NUM
          </button>
          <button
            onClick={() => setMode('avatar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-widest font-mono transition-colors
              ${mode === 'avatar'
                ? 'bg-amber-400 text-neutral-900'
                : 'text-neutral-500 hover:text-amber-400'
              }`}
          >
            <Users size={12} /> AVATAR
          </button>
        </div>
      </div>

      {/* Search + Filter row */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">

        {/* Search */}
        <div className="flex items-center gap-2 border border-neutral-800 px-3 py-1.5 flex-1 min-w-[160px]">
          <Search size={14} className="text-neutral-600 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="bg-transparent outline-none text-sm text-neutral-200 placeholder:text-neutral-600 flex-1 min-w-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={12} className="text-neutral-500 hover:text-amber-400" />
            </button>
          )}
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs tracking-widest font-mono transition-colors
            ${showFilters
              ? 'border-amber-400 text-amber-400'
              : 'border-neutral-800 text-neutral-500 hover:text-amber-400'
            }`}
        >
          <Filter size={12} /> FILTER
          {filterCount > 0 && (
            <span className="bg-amber-400 text-neutral-900 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
              {filterCount}
            </span>
          )}
        </button>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-neutral-500 hover:text-amber-400 tracking-widest font-mono"
          >
            CLEAR
          </button>
        )}

        {/* Count */}
        <div className="ml-auto text-xs text-neutral-500 font-mono">
          {filteredCount}/{totalCount}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mt-3 p-3 border border-neutral-800 bg-neutral-900/30 space-y-3">

          {/* Rank */}
          <div>
            <p className="text-[10px] text-neutral-500 tracking-widest mb-2 font-mono">RANK</p>
            <div className="flex gap-1.5 flex-wrap">
              {RANKS.map(r => (
                <button
                  key={r}
                  onClick={() => toggleRank(r)}
                  className={`px-3 py-1 text-xs border font-mono transition-colors
                    ${rankFilter.includes(r)
                      ? `${RANK_COLORS[r]} border-transparent`
                      : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* License */}
          <div>
            <p className="text-[10px] text-neutral-500 tracking-widest mb-2 font-mono">LICENSE</p>
            <div className="flex gap-1 flex-wrap">
              {ALL_LICENSES.map(l => (
                <button
                  key={l}
                  onClick={() => toggleLicense(l)}
                  className={`px-2 py-0.5 text-xs border transition-colors
                    ${licenseFilter.includes(l)
                      ? 'bg-amber-400 text-neutral-900 border-transparent'
                      : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </header>
  )
}