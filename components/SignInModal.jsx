"use client"
import React, { useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

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

  async function handleCredentialsSignIn(e) {
    e.preventDefault()
    setError(null)
    const res = await signIn('credentials', { redirect: false, email, password })
    if (res?.error) {
      setError(res.error || 'Sign in failed')
    } else {
      // store minimal user info locally (will also be available via NextAuth session)
      try {
        const toStore = { name: email.split('@')[0], email, image: null }
        localStorage.setItem('prepvault_user', JSON.stringify(toStore))
      } catch (err) {
        // ignore
      }
      // close modal on success
      onClose()
    }
  }

  // if user clicks Google sign in we open NextAuth popup - store user info from session
  async function handleGoogleSignIn() {
    await signIn('google')
    // NextAuth will redirect or populate session; attempt to read session and store locally
    try {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        if (data?.user) {
          const u = data.user
          const toStore = { name: u.name, email: u.email, image: u.image }
          localStorage.setItem('prepvault_user', JSON.stringify(toStore))
          onClose()
        }
      }
    } catch (err) {
      // ignore
      onClose()
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          <h3>Sign In</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="modal-body">
          <p>Continue with</p>
          <div className="modal-actions modal-grid">
            <div className="provider-column">
                <button
                  type="button"
                  className="nav-button nav-button--signin provider-button"
                  onClick={handleGoogleSignIn}
                >
                  Sign in with Google
                </button>
            </div>

            <div className="form-column">
              <form onSubmit={handleCredentialsSignIn} className="credentials-form">
                <label className="field">
                  <span className="field-label">Email</span>
                  <input aria-label="Email" type="email" placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>

                <label className="field">
                  <span className="field-label">Password</span>
                  <input aria-label="Password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>

                <div className="form-actions">
                  <button type="submit" className="nav-button nav-button--primary">Sign in</button>
                  <button type="button" className="nav-button nav-button--outline" onClick={switchToSignUp}>Create account</button>
                </div>

                {error && <div className="form-error">{error}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInModal
