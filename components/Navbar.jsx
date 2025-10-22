"use client"
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { signOut as nextAuthSignOut } from 'next-auth/react'

const SignInModal = dynamic(() => import('./SignInModal'), { ssr: false })
const SignUpModal = dynamic(() => import('./SignUpModal'), { ssr: false })

const LOCAL_KEY = 'prepvault_user'

const Navbar = () => {
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [user, setUser] = useState(null)

  // read from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch (e) {
      // ignore
    }

    // Also try to sync with NextAuth session if available
    ;(async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (data?.user) {
            const u = data.user
            const toStore = { name: u.name, email: u.email, image: u.image }
            localStorage.setItem(LOCAL_KEY, JSON.stringify(toStore))
            setUser(toStore)
          }
        }
      } catch (err) {
        // ignore
      }
    })()
  }, [])

  function handleSignOut() {
    // clear local info and sign out from NextAuth
    localStorage.removeItem(LOCAL_KEY)
    setUser(null)
    nextAuthSignOut({ redirect: false })
  }

  return (
    <>
      <div className='navbar-container'>
        <h2>PrepVault</h2>

        <div className='navbar-actions'>
          {user ? (
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name || 'profile'} style={{width: 36, height: 36, borderRadius: 999}} />
              ) : (
                <div style={{width: 36, height: 36, borderRadius: 999, background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <span style={{color: 'var(--secondary-color)', marginRight: 8}}>{user.name || user.email}</span>
              <button type="button" className="nav-button nav-button--signup" onClick={handleSignOut}>Sign out</button>
            </div>
          ) : (
            <>
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
            </>
          )}
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