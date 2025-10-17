"use client"
import React, { useEffect } from 'react'
import { signIn } from 'next-auth/react'

const SignInModal = ({ onClose, switchToSignUp }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal-header">
          <h3>Sign In</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="modal-body">
          <p>Continue with</p>
          <div className="modal-actions">
            <button
              type="button"
              className="nav-button nav-button--signin"
              onClick={() => signIn('google')}
            >
              Sign in with Google
            </button>

            <button
              type="button"
              className="nav-button nav-button--signup"
              onClick={switchToSignUp}
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInModal
