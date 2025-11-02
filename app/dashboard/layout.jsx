"use client"
import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import SignInModal from '../../components/SignInModal'
import SignUpModal from '../../components/SignUpModal'

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const [showSignUp, setShowSignUp] = useState(false)

  // while loading session, avoid flashing protected UI
  if (status === 'loading') return null

  // if not authenticated, show sign-in modal (do not render dashboard children)
  if (!session) {
    return (
      <>
        <SignInModal onClose={() => {}} switchToSignUp={() => setShowSignUp(true)} />
        {showSignUp && <SignUpModal onClose={() => setShowSignUp(false)} switchToSignIn={() => setShowSignUp(false)} />}
      </>
    )
  }

  // authenticated — render dashboard
  return (
    <section>
      {children}
    </section>
  )
}
