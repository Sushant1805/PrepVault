"use client";
import React, { useState, useEffect, useRef } from "react";

export default function AddProblemButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    link: "",
    topic: "",
    subtopics: "",
    difficulty: "Medium",
    platform: "LeetCode",
    status: "Unsolved",
    note: "",
    tags: "",
  });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // prepare payload
      const payload = {
        title: form.title,
        link: form.link,
        topic: form.topic,
        subtopics: form.subtopics ? form.subtopics.split(",").map(s => s.trim()).filter(Boolean) : [],
        difficulty: form.difficulty,
        platform: form.platform,
        status: form.status,
        note: form.note,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      };

      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || res.statusText || 'Failed to create problem');
      }

      // success
      setOpen(false);
      setForm({ title: "", link: "", topic: "", subtopics: "", difficulty: "Medium", platform: "LeetCode", status: "Unsolved", note: "", tags: "" });
      // show toast instead of alert
      showToast('Problem added successfully', 'success');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Add problem failed:', err);
      showToast('Failed to add problem: ' + (err?.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }

  // Toast state and helpers
  const [toast, setToast] = useState({ open: false, message: '', tone: 'info' });
  const toastTimer = useRef(null);

  function showToast(message, tone = 'info') {
    // clear existing timer
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast({ open: true, message, tone });
    // auto-dismiss
    toastTimer.current = setTimeout(() => setToast({ open: false, message: '', tone: 'info' }), 4200);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  return (
    <div style={{ display: 'inline-block' }}>
      <button className="nav-button nav-button--primary" onClick={() => setOpen(true)} aria-haspopup="dialog">+ Add Problem</button>

      {open && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          {/* Outside-close button (right side of screen) */}
          <button className="modal-exit" aria-label="Close modal" onClick={() => setOpen(false)}>×</button>

          <div className="modal">
            <div className="modal-header">
              <strong style={{ fontSize: '1.05rem' }}>Add Problem</strong>
              <button className="modal-close" aria-label="Close" onClick={() => setOpen(false)}>&times;</button>
            </div>

            <div className="modal-body">
              <form className="credentials-form" onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field-label">Title *</label>
                  <input name="title" value={form.title} onChange={onChange} required />
                </div>

                <div className="field">
                  <label className="field-label">Link *</label>
                  <input name="link" value={form.link} onChange={onChange} required placeholder="https://" />
                </div>

                <div className="field">
                  <label className="field-label">Topic *</label>
                  <input name="topic" value={form.topic} onChange={onChange} required placeholder="Array, DP, Graph..." />
                </div>

                <div className="field">
                  <label className="field-label">Subtopics (comma separated)</label>
                  <input name="subtopics" value={form.subtopics} onChange={onChange} placeholder="Sliding Window, Two Pointers" />
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label className="field-label">Difficulty</label>
                    <select name="difficulty" value={form.difficulty} onChange={onChange}>
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>

                  <div className="field">
                    <label className="field-label">Platform</label>
                    <select name="platform" value={form.platform} onChange={onChange}>
                      <option>LeetCode</option>
                      <option>CodeStudio</option>
                      <option>GFG</option>
                      <option>CSES</option>
                      <option>Custom</option>
                    </select>
                  </div>

                  <div className="field">
                    <label className="field-label">Status</label>
                    <select name="status" value={form.status} onChange={onChange}>
                      <option>Unsolved</option>
                      <option>Solved</option>
                      <option>Revision Pending</option>
                      <option>Needs Review</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Note</label>
                  <textarea name="note" value={form.note} onChange={onChange} />
                </div>

                <div className="field">
                  <label className="field-label">Tags (comma separated)</label>
                  <input name="tags" value={form.tags} onChange={onChange} placeholder="Important, Amazon" />
                </div>

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" className="modal-action--outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</button>
                  <button type="submit" className="modal-action--primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
          )}

          {/* Toast container (bottom-right) */}
          <div aria-live="polite" aria-atomic="true">
            {toast.open && (
              <div className={`toast ${toast.tone === 'success' ? 'toast--success' : toast.tone === 'error' ? 'toast--error' : 'toast--info'}`} role="status">
                <div className="toast-message">{toast.message}</div>
                <button className="toast-close" aria-label="Close" onClick={() => setToast({ open: false, message: '', tone: 'info' })}>&times;</button>
              </div>
            )}
          </div>
    </div>
  );
}
