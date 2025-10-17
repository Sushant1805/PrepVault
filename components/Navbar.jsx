"use client"
import React, { useState } from 'react'
import dynamic from 'next/dynamic'

const SignInModal = dynamic(() => import('./SignInModal'), { ssr: false })
const SignUpModal = dynamic(() => import('./SignUpModal'), { ssr: false })

const Navbar = () => {
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  return (
    <>
      <div className='navbar-container'>
        <h2>PrepVault</h2>

        <div className='navbar-actions'>
          <button
            type="button"
            className="nav-button nav-button--signin"
            aria-label="Sign in"
            onClick={() => setShowSignIn(true)}
          >
            Sign In
          </button>

          <button
            type="button"
            className="nav-button nav-button--signup"
            aria-label="Sign up"
            onClick={() => setShowSignUp(true)}
          >
            Sign Up
          </button>
        </div>
      </div>

      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          switchToSignUp={() => {
            setShowSignIn(false)
            setShowSignUp(true)
          }}
        />
      )}

      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          switchToSignIn={() => {
            setShowSignUp(false)
            setShowSignIn(true)
          }}
        />
      )}
    </>
  )
}

export default Navbar