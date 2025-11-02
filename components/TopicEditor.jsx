"use client"

import React, { useState } from 'react'
import styles from '../app/dashboard/dashboard.module.css'

export default function TopicEditor({ topic: initialTopic }) {
  const [topic, setTopic] = useState(initialTopic)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function changesFromForm(form) {
    const fd = new FormData(form)
    return {
      title: fd.get('title') || '',
      description: fd.get('description') || '',
      subtopics: (fd.get('subtopics') || '').split(',').map(s => s.trim()).filter(Boolean),
      resources: (fd.get('resources') || '').split(',').map(s => s.trim()).filter(Boolean),
      importance: fd.get('importance') || 'Normal',
      tags: (fd.get('tags') || '').split(',').map(s => s.trim()).filter(Boolean),
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = changesFromForm(e.target)
      const res = await fetch(`/api/topics/${topic._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json?.error || 'Failed to save')
      }
      const json = await res.json()
      setTopic(json.topic)
      setEditing(false)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Save failed', err)
      alert('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this topic? This cannot be undone.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/topics/${topic._id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json?.error || 'Failed to delete')
      }
      // redirect to topics list
      window.location.href = '/dashboard/topics'
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete failed', err)
      alert('Failed to delete: ' + err.message)
      setDeleting(false)
    }
  }

  return (
    <div className={styles.topicDetailCard}>
      <div className={styles.topicDetailHeader}>
        <div>
          <h2 className={styles.topicTitleLarge}>{topic.title}</h2>
          <div className={styles.topicSubtitle}>Last updated: <span className={styles.muted}>{new Date(topic.updatedAt).toLocaleString()}</span></div>
        </div>

        <div className={styles.topicHeaderActions}>
          <div className={styles.importanceBadge}>{topic.importance || 'Normal'}</div>
          <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => setEditing(true)} disabled={editing}>Edit</button>
          <button className={`${styles.actionBtn} ${styles.actionBtnGhost}`} onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button>
        </div>
      </div>

      <div className={styles.topicDetailContent}>
        <div className={styles.topicMain}>
          {!editing ? (
            <>
              <div style={{ marginBottom: 12 }}>{topic.description || <em className={styles.muted}>No description</em>}</div>

              {topic.subtopics && topic.subtopics.length > 0 && (
                <div style={{ marginBottom: 12 }}><strong>Subtopics:</strong> <span className={styles.muted}>{topic.subtopics.join(', ')}</span></div>
              )}

              {topic.resources && topic.resources.length > 0 && (
                <div className="resourceList">
                  <strong>Resources:</strong>
                  <ul>
                    {topic.resources.map((r, i) => <li key={i}><a href={r} target="_blank" rel="noreferrer">{r}</a></li>)}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Title</label>
                <input name="title" placeholder="E.g. Deadlocks in DBMS" defaultValue={topic.title} className={`${styles.topicFormInput} ${styles.topicTitleInput}`} />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Description</label>
                <textarea name="description" placeholder="Short summary. Example: A deadlock occurs when two or more transactions..." defaultValue={topic.description} className={styles.topicFormInput} rows={5} cols={50} />
              </div>

              <div className={styles.topicFormRow}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Subtopics (comma separated)</label>
                  <input name="subtopics" placeholder="e.g. detection, prevention" defaultValue={(topic.subtopics || []).join(', ')} className={styles.topicFormInput} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Resources (comma separated)</label>
                  <input name="resources" placeholder="e.g. https://example.com" defaultValue={(topic.resources || []).join(', ')} className={styles.topicFormInput} />
                </div>
              </div>

              <div className={styles.topicFormRow} style={{ marginTop: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Importance</label>
                  <select name="importance" defaultValue={topic.importance || 'Normal'} className={styles.topicFormInput}>
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>Tags (comma separated)</label>
                  <input name="tags" placeholder="e.g. dbms, concurrency" defaultValue={(topic.tags || []).join(', ')} className={styles.topicFormInput} />
                </div>
              </div>

              <div className={styles.topicActionRow}>
                <button type="submit" disabled={saving} className={styles.btnPrimary}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={() => setEditing(false)} className={styles.btnGhost}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        <aside className={styles.revisionsPanel}>
          <h4>Revisions</h4>
          <div className={styles.muted} style={{ marginBottom: 8 }}>{(topic.revisionCount || (topic.revisions && topic.revisions.length) || 0)} total</div>
          {topic.revisions && topic.revisions.length > 0 ? (
            topic.revisions.slice(0, 10).map((r, i) => (
              <div className={styles.revisionItem} key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{r.title || '(untitled)'}</div>
                  <small className={styles.muted}>{new Date(r.updatedAt).toLocaleString()}</small>
                </div>
                {r.description ? <div className={styles.muted} style={{ marginTop: 6 }}>{r.description}</div> : null}
              </div>
            ))
          ) : (
            <div className={styles.muted}>No revisions yet</div>
          )}
        </aside>
      </div>
    </div>
  )
}
