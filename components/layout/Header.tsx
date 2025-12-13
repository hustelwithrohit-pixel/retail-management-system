'use client'

import { useSession } from 'next-auth/react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Welcome back!</h2>
          <p className="text-sm text-gray-600">
            {session?.user?.name || 'User'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {session?.user?.role === 'OWNER' ? 'Owner' : 'Staff'}
          </span>
        </div>
      </div>
    </header>
  )
}

