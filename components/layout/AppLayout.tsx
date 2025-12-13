'use client'

import { useSession } from 'next-auth/react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={session.user.role as 'OWNER' | 'STAFF'} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

