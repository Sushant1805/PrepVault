"use client"
// app/layout.js
import React from 'react'

import '@/styles/global.css'
import Navbar from '@/components/Navbar'
import MuiProvider from '@/components/MuiProvider'
import { usePathname } from "next/navigation";
import { SessionProvider } from 'next-auth/react'

export default function Layout({ children }) {
        const pathname = usePathname();
    const hideNavbar = pathname.startsWith("/dashboard");
        return (
                <html lang="en">
                        <body>
                                {/* puter.js client removed; server uses Gemini only */}
                                <SessionProvider>
                                    <MuiProvider>
                                            {!hideNavbar && <Navbar />}
                                        <main>{children}</main>
                                    </MuiProvider>
                                </SessionProvider>
                        </body>
                </html>
        )
}
