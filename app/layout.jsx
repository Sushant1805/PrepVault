// app/layout.js
import React from 'react'
import '@/styles/global.css'
import Navbar from '@/components/Navbar'

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
        <main>{children}</main>
      </body>
    </html>
  )
}
