"use client"
import React, { useEffect, useState, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FcGoogle } from "react-icons/fc";

const SignUpModal = ({ onClose, switchToSignIn }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', tone: 'info' })
  const toastTimer = useRef(null)

  const router = useRouter()

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Registration failed')
        setIsLoading(false)
        return
      }

      // sign in the user after successful registration
      const signInResult = await signIn('credentials', { redirect: false, email, password })
      if (signInResult?.error) {
        setError(signInResult.error || 'Sign in after register failed')
        setIsLoading(false)
      } else {
        // show success toast briefly then navigate so the toast is visible
        showToast('Account created — signed in', 'success')
        setTimeout(() => {
          onClose()
          router.push('/dashboard')
          setIsLoading(false)
        }, 700)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Register error:', err)
      setError('Server error')
      setIsLoading(false)
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
          <h3>Create an account</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="modal-body">
      
          <div className="modal-actions modal-grid">
    

            <div className="form-column">
              <form onSubmit={handleRegister} className="credentials-form">
                <label className="field">
                  <span className="field-label">Name</span>
                  <input aria-label="Name" type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                </label>

                <label className="field">
                  <span className="field-label">Email</span>
                  <input aria-label="Email" type="email" placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>

                <label className="field">
                  <span className="field-label">Password</span>
                  <input aria-label="Password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>

                <div className="form-actions">
                  <button type="submit" className="nav-button nav-button--primary" disabled={isLoading} aria-busy={isLoading}>
                    {isLoading ? (
                      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                        <span className="spinner" aria-hidden>
                          <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4"/></svg>
                        </span>
                        Creating...
                      </span>
                    ) : 'Create account'}
                  </button>
                  <button type="button" className="nav-button nav-button--outline" onClick={switchToSignIn} disabled={isLoading}>Have an account? Sign in</button>
                </div>

                {error && <div className="form-error">{error}</div>}
              </form>
            </div>
            <div className="provider-column">
              <button
                type="button"
                className="nav-button nav-button--signin provider-button"
                onClick={() => { setIsLoading(true); signIn('google') }}
                disabled={isLoading}
                aria-busy={isLoading}
              >
               <FcGoogle/>{isLoading ? (
                 <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                   <span className="spinner" aria-hidden>
                     <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4"/></svg>
                   </span>
                   Signing up...
                 </span>
               ) : ' Sign up with Google'}
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

export default SignUpModal
