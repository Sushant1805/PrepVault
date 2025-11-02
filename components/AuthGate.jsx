"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import SignInModal from './SignInModal'
import SignUpModal from './SignUpModal'

// Small client-side gate that shows the sign in / sign up modal when there's no session.
// Usage: wrap protected UI with <AuthGate>{children}</AuthGate>
export default function AuthGate({ children }) {
  const { data: session, status } = useSession()
  const [showSignIn, setShowSignIn] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    // When loading finishes, open the modal for unauthenticated users
    if (status === 'loading') return
    if (!session) {
      setModalOpen(true)
      setShowSignIn(true)
    } else {
      setModalOpen(false)
    }
  }, [status, session])

  const closeModal = () => setModalOpen(false)
  const switchToSignUp = () => setShowSignIn(false)
  const switchToSignIn = () => setShowSignIn(true)

  return (
    <>
      {children}

      {modalOpen && showSignIn && (
        <SignInModal onClose={closeModal} switchToSignUp={switchToSignUp} />
      )}

      {modalOpen && !showSignIn && (
        <SignUpModal onClose={closeModal} switchToSignIn={switchToSignIn} />
      )}
    </>
  )
}
