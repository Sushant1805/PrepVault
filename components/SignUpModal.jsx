"use client"
import React, { useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

  const router = useRouter()

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Registration failed')
        return
      }

      // sign in the user after successful registration
      const signInResult = await signIn('credentials', { redirect: false, email, password })
      if (signInResult?.error) {
        setError(signInResult.error || 'Sign in after register failed')
      } else {
        onClose()
        router.push('/dashboard')
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Register error:', err)
      setError('Server error')
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          <h3>Create an account</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="modal-body">
          <p>Continue with</p>
          <div className="modal-actions modal-grid">
            <div className="provider-column">
              <button
                type="button"
                className="nav-button nav-button--signin provider-button"
                onClick={() => signIn('google')}
              >
                Sign up with Google
              </button>
            </div>

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
                  <button type="submit" className="nav-button nav-button--primary">Create account</button>
                  <button type="button" className="nav-button nav-button--outline" onClick={switchToSignIn}>Have an account? Sign in</button>
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

export default SignUpModal
