import { useState, useEffect, useMemo } from 'react'

export function useMembers(searchQuery, rankFilter, licenseFilter) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch members data from GitHub Private Repo
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

  // Filter members based on search and filter criteria
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Name search (Chinese or English)
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchZh = m.nameZh?.toLowerCase().includes(q)
        const matchEn = m.nameEn?.toLowerCase().includes(q)
        if (!matchZh && !matchEn) return false
      }

      // Rank filter (AND logic with other filters)
      if (rankFilter.length > 0 && !rankFilter.includes(m.rank)) return false

      // License filter (OR logic — match any selected license)
      if (licenseFilter.length > 0 && !licenseFilter.some(l => m.licenses?.includes(l))) return false

      return true
    })
  }, [members, searchQuery, rankFilter, licenseFilter])

  return { members, filteredMembers, loading, error }
}