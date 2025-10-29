"use client"
import React from 'react'
import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      style={{ padding: '8px 12px', borderRadius: 6, background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}
    >
      Sign out
    </button>
  )
}
