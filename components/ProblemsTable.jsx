"use client"

import React, { useState, useEffect } from 'react'
import styles from '../app/dashboard/dashboard.module.css'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'

export default function ProblemsTable({ problems = [] }) {
  const [openNote, setOpenNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [editProblem, setEditProblem] = useState(null)
  const [items, setItems] = useState(problems)
  const [loading, setLoading] = useState(false)
  const [openGen, setOpenGen] = useState(false)
  const [genCode, setGenCode] = useState('')
  const [genLoading, setGenLoading] = useState(false)

  // Keep internal items in sync when parent provides new problems
  useEffect(() => {
    setItems(problems || [])
  }, [problems])

  const openNoteModal = (note) => {
    setNoteText(note || '')
    setOpenNote(true)
  }
  const closeNoteModal = () => setOpenNote(false)

  const openEditModal = (problem) => {
    setEditProblem({
      id: problem._id,
      status: problem.status || 'Unsolved',
      note: problem.note || '',
    })
  }
  const closeEditModal = () => setEditProblem(null)

  const saveEdit = async () => {
    if (!editProblem) return
    setLoading(true)
    try {
      const res = await fetch(`/api/problems/${editProblem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editProblem.status, note: editProblem.note }),
        credentials: 'same-origin',
      })
      if (!res.ok) throw new Error('Failed')
      const updated = await res.json()
      setItems((prev) => prev.map((it) => (it._id === updated._id ? updated : it)))
      closeEditModal()
    } catch (err) {
      alert('Unable to save changes')
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openGenModal = () => setOpenGen(true)
  const closeGenModal = () => {
    setOpenGen(false)
    setGenCode('')
  }

  const generateNotes = async () => {
    if (!editProblem) return
    if (!genCode || genCode.trim().length === 0) {
      alert('Please paste code to generate notes from')
      return
    }
    setGenLoading(true)
    try {
      const res = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: genCode, problemId: editProblem.id }),
        credentials: 'same-origin',
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to generate notes')
      }
      const data = await res.json()
      // data should contain { notes }
      const notes = data.notes || data.result || data.text || ''
      setEditProblem(prev => ({ ...prev, note: notes }))
      // update items list locally as well
      setItems(prev => prev.map(it => (it._id === editProblem.id ? { ...it, note: notes } : it)))
      closeGenModal()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Generate notes failed', err)
      alert('Failed to generate notes')
    } finally {
      setGenLoading(false)
    }
  }

  const deleteProblem = async (id) => {
    if (!confirm('Delete this problem? This cannot be undone.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/problems/${id}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!res.ok) throw new Error('Failed')
      setItems((prev) => prev.filter((it) => it._id !== id))
      closeEditModal()
    } catch (err) {
      alert('Unable to delete')
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.problemsTable}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Topic</th>
              <th>Difficulty</th>
              <th>Platform</th>
              <th>Status</th>
              <th>Created</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const diffKey = 'diff' + ((p.difficulty || '').replace(/\s+/g, '')) || 'diffDefault'
              const statusKey = 'status' + ((p.status || '').replace(/\s+/g, '')) || 'statusDefault'
              return (
                <tr key={p._id}>
                  <td>
                    <a href={p.link} target="_blank" rel="noopener noreferrer">{p.title}</a>
                  </td>
                  <td>{p.topic || '-'}</td>
                  <td>
                    <span className={`${styles.diffTag} ${styles[diffKey] || styles.diffDefault}`}>
                      {p.difficulty || '-'}
                    </span>
                  </td>
                  <td>{p.platform || '-'}</td>
                  <td>
                    <span className={`${styles.statusTag} ${styles[statusKey] || styles.statusDefault}`}>
                      {p.status || '-'}
                    </span>
                  </td>
                  <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <IconButton size="small" color="primary" onClick={() => openNoteModal(p.note)} title="View note">
                      <VisibilityIcon />
                    </IconButton>
                  </td>
                  <td>
                    <IconButton size="small" onClick={() => openEditModal(p)} title="Edit">
                      <EditIcon />
                    </IconButton>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Note dialog */}
      <Dialog open={openNote} onClose={closeNoteModal} fullWidth maxWidth="sm">
        <DialogTitle>Notes</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ whiteSpace: 'pre-wrap' }}>{noteText || <em>No notes for this problem.</em>}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNoteModal}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editProblem} onClose={closeEditModal} fullWidth maxWidth="sm">
        <DialogTitle>Edit Problem</DialogTitle>
        <DialogContent dividers>
          {editProblem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Select value={editProblem.status} onChange={(e) => setEditProblem(prev => ({ ...prev, status: e.target.value }))}>
                <MenuItem value="Unsolved">Unsolved</MenuItem>
                <MenuItem value="Solved">Solved</MenuItem>
                <MenuItem value="Revision Pending">Revision Pending</MenuItem>
                <MenuItem value="Needs Review">Needs Review</MenuItem>
              </Select>

              <TextField
                label="Notes"
                multiline
                minRows={4}
                value={editProblem.note}
                onChange={(e) => setEditProblem(prev => ({ ...prev, note: e.target.value }))}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="error" startIcon={<DeleteIcon />} onClick={() => deleteProblem(editProblem?.id)} disabled={loading}>Delete</Button>
          <Box sx={{ flex: '1 0 auto' }} />
          <Button onClick={openGenModal} disabled={loading}>Generate notes</Button>
          <Button onClick={closeEditModal} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit} disabled={loading}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Generate notes dialog: paste code and call Perplexity */}
      <Dialog open={openGen} onClose={closeGenModal} fullWidth maxWidth="md">
        <DialogTitle>Generate Notes from Code</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Paste code here"
              multiline
              minRows={10}
              value={genCode}
              onChange={(e) => setGenCode(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGenModal} disabled={genLoading}>Cancel</Button>
          <Button variant="contained" onClick={generateNotes} disabled={genLoading}>{genLoading ? 'Generating...' : 'Generate'}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
