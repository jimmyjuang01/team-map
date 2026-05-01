import { useState, useEffect, useMemo } from 'react'

const DEFAULT_STATS = {
  totalMembers: 0,
  totalStates:  0,
  totalCities:  0,
}

export function useMembers(searchQuery, rankFilter, licenseFilter) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const url = import.meta.env.VITE_DATA_URL
    const pat = import.meta.env.VITE_GITHUB_PAT

    fetch(url, {
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/vnd.github.v3.raw',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setMembers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch members:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchZh = m.nameZh?.toLowerCase().includes(q)
        const matchEn = m.nameEn?.toLowerCase().includes(q)
        if (!matchZh && !matchEn) return false
      }
      if (rankFilter.length > 0 && !rankFilter.includes(m.rank)) return false
      if (licenseFilter.length > 0 && !licenseFilter.some(l => m.licenses?.includes(l))) return false
      return true
    })
  }, [members, searchQuery, rankFilter, licenseFilter])

  // Stats — always returns an object, never undefined
  const stats = useMemo(() => {
    if (members.length === 0) return DEFAULT_STATS

    const states = new Set()
    const cities = new Set()
    members.forEach(m => {
      if (m.state) states.add(m.state)
      if (m.city && m.state) cities.add(`${m.city},${m.state}`)
    })

    return {
      totalMembers: members.length,
      totalStates:  states.size,
      totalCities:  cities.size,
    }
  }, [members])

  return { members, filteredMembers, loading, error, stats }
}
