"use client"
import React, { useEffect, useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { FcGoogle } from "react-icons/fc";
import { useRouter } from 'next/navigation'

const SignInModal = ({ onClose, switchToSignUp }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', tone: 'info' })
  const toastTimer = useRef(null)

  const router = useRouter()

  async function handleCredentialsSignIn(e) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    const res = await signIn('credentials', { redirect: false, email, password })
    if (res?.error) {
      setError(res.error || 'Sign in failed')
      setIsLoading(false)
    } else {
      // show toast, allow it to be visible briefly, then navigate
      showToast('Signed in successfully', 'success')
      // give the toast a moment to be seen
      setTimeout(() => {
        onClose()
        router.push('/dashboard')
        setIsLoading(false)
      }, 700)
    }
  }

  function showToast(message, tone = 'info') {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current)
      toastTimer.current = null
    }
    setToast({ open: true, message, tone })
    toastTimer.current = setTimeout(() => setToast({ open: false, message: '', tone: 'info' }), 4200)
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          <h3>Sign In</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="modal-body">
          <div className="modal-actions modal-grid">
      

            <div className="form-column">
              <form onSubmit={handleCredentialsSignIn} className="credentials-form">
                <label className="field">
                  <span className="field-label">Email</span>
                  <input aria-label="Email" type="email" placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
                </label>

                <label className="field">
                  <span className="field-label">Password</span>
                  <input aria-label="Password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                </label>

                <div className="form-actions">
                  <button type="submit" className="nav-button nav-button--primary" disabled={isLoading} aria-busy={isLoading}>
                    {isLoading ? (
                      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                        <span className="spinner" aria-hidden>
                          <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4"/></svg>
                        </span>
                        Signing in...
                      </span>
                    ) : 'Sign in'}
                  </button>
                  <button type="button" className="nav-button nav-button--outline" onClick={switchToSignUp} disabled={isLoading}>Create account</button>
                </div>

                {error && <div className="form-error">{error}</div>}
              </form>
            </div>
            <div className="provider-column">
              <button
                type="button"
                className="nav-button nav-button--signin provider-button"
                onClick={() => { setIsLoading(true); signIn('google', { callbackUrl: '/dashboard' }) }}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                < FcGoogle style={{height:"20px",textAlign:"center"}}/>
                {isLoading ? (
                  <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                    <span className="spinner" aria-hidden>
                      <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4"/></svg>
                    </span>
                    Signing in...
                  </span>
                ) : ' Sign in with Google'}
              </button>
            </div>
          </div>
        </div>
      </div>
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
  )
}

export default SignInModal
