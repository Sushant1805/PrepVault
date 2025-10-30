"use client"

import React, { useState, useEffect, useRef } from 'react'
import ProblemsTable from './ProblemsTable'

export default function SearchableProblems({ initialProblems = [] }) {
  const [problems, setProblems] = useState(initialProblems)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  // Keep in sync if parent changes initialProblems
  useEffect(() => {
    setProblems(initialProblems || [])
  }, [initialProblems])

  useEffect(() => {
    // simple debounce
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchProblems(query)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  async function fetchProblems(q) {
    setLoading(true)
    try {
      const url = `/api/problems${q ? '?name=' + encodeURIComponent(q) : ''}`
      const res = await fetch(url)
      if (!res.ok) {
        setProblems([])
        return
      }
      const json = await res.json()
      setProblems(json.problems || [])
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching problems for search', err)
      setProblems([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search problems by name..."
          style={{ flex: 1, maxWidth: 400, padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white' }}
        />
        {loading ? <span style={{ color: '#64748b' }}>Searching…</span> : null}
      </div>

      <ProblemsTable problems={problems} />
    </div>
  )
}
