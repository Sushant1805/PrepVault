"use client"
import '@/styles/global.css'

import React, { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import SignInModal from '../components/SignInModal'
import SignUpModal from '../components/SignUpModal'

const Page = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  const handleGetStarted = async () => {
    if (status === 'loading') return
    if (session) {
      // already signed in -> go to dashboard
      router.push('/dashboard')
    } else {
      // not signed in -> show sign-in modal instead of redirect
      setShowSignIn(true)
    }
  }

  return (
    <div className="flex items-center justify-center" style={{ color: 'white',marginTop:"80px"}}>
      <main className="max-w-6xl w-full px-6 py-24">
        <div className="bg-white/5 backdrop-blur-md  rounded-2xl shadow-2xl p-12 text-center max-w-3xl mx-auto" style={{
          width: "650px",
          display: "flex",
          flexDirection: "column",
          gap: "25px"
        }}>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4">
            PrepVault
            <span className="ml-2 font-semibold" style={{ color: 'var(--secondary-color)' }}> — Study with intent</span>
          </h1>

          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            A focused workspace to organize topics and problems, track progress, and sharpen your problem-solving skills — designed for clarity and speed.
          </p>

          <div className=" flex items-center justify-center gap-4 mb-4">
            <button onClick={handleGetStarted} className="get-started-button px-6 py-3 rounded-lg font-semibold text-sm" style={{ background: 'var(--secondary-color)', color: 'white', boxShadow: '0 6px 18px rgba(0,0,0,0.28)', padding: '0.5rem', border: 'none', borderRadius: '15px', fontSize: 'small' }}>Get Started</button>
          </div>

          <div className="text-xs text-gray-400">Secure · Fast · Private — built for learners.</div>

        </div>
      </main>

      {/* Sign-in / Sign-up modals */}
      {showSignIn && (
        <SignInModal onClose={() => setShowSignIn(false)} switchToSignUp={() => { setShowSignIn(false); setShowSignUp(true) }} />
      )}
      {showSignUp && (
        <SignUpModal onClose={() => setShowSignUp(false)} switchToSignIn={() => { setShowSignUp(false); setShowSignIn(true) }} />
      )}
    </div>
  )
}

export default Page