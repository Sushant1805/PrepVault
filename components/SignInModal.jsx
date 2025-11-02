"use client"
import React, { useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { FcGoogle } from "react-icons/fc";
import { useState } from 'react'
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

  const router = useRouter()

  async function handleCredentialsSignIn(e) {
    e.preventDefault()
    setError(null)
    const res = await signIn('credentials', { redirect: false, email, password })
    if (res?.error) {
      setError(res.error || 'Sign in failed')
    } else {
      // close modal on success and navigate to dashboard
      onClose()
      router.push('/dashboard')
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
          <div className="modal-actions modal-grid">
      

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
            <div className="provider-column">
              <button
                type="button"
                className="nav-button nav-button--signin provider-button"
                onClick={() => signIn('google')}
              >
                < FcGoogle style={{height:"20px",textAlign:"center"}}/> Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInModal
