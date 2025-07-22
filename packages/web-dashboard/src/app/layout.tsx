import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../auth/AuthContext'

export const metadata: Metadata = {
  title: 'DevMind - AI-Powered Developer Assistant',
  description: 'Transform how you debug, review, and document code with AI-powered insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}