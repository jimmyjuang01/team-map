import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

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
    async function fetchMembers() {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('status', 'active')
          .order('agent_id', { ascending: true })

        if (error) throw error

        const converted = data.map(m => ({
          agentId:        m.agent_id,
          nameZh:         m.name_zh,
          nameEn:         m.name_en,
          photoUrl:       m.photo_url,
          gender:         m.gender,
          state:          m.state,
          city:           m.city,
          zipCode:        m.zip_code,
          uplineSmdName:  m.upline_smd_name,
          uplineSmdEmail: m.upline_smd_email,
          rank:           m.rank,
          email:          m.email,
          phone:          m.phone,
          lineId:         m.line_id,
          whatsapp:       m.whatsapp,
          facebook:       m.facebook,
          licenses:       m.licenses      || [],
          licensesOther:  m.licenses_other,
          highestDegree:  m.highest_degree,
          degreeOther:    m.degree_other,
          skills:         m.skills        || [],
          intro:          m.intro,
          joinDate:       m.join_date,
          status:         m.status,
          lastUpdated:    m.last_updated,
        }))

        setMembers(converted)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch members:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

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
