"use client"

import React, { useState, useEffect, useRef } from 'react'
import TopicsGrid from './TopicsGrid'

export default function SearchableTopics({ initialTopics = [] }) {
  const [topics, setTopics] = useState(initialTopics)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    setTopics(initialTopics || [])
  }, [initialTopics])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchTopics(query)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  async function fetchTopics(q) {
    setLoading(true)
    try {
      const url = `/api/topics${q ? '?name=' + encodeURIComponent(q) : ''}`
      const res = await fetch(url)
      if (!res.ok) {
        setTopics([])
        return
      }
      const json = await res.json()
      setTopics(json.topics || [])
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching topics for search', err)
      setTopics([])
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
          placeholder="Search topics by title..."
          style={{ flex: 1, maxWidth: 400, padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white' }}
        />
        {loading ? <span style={{ color: '#64748b' }}>Searching…</span> : null}
      </div>

      <TopicsGrid topics={topics} />
    </div>
  )
}
