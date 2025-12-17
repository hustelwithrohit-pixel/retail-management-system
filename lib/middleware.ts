import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth"
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function requireOwner() {
  const session = await requireAuth()
  if (session.user.role !== 'OWNER') {
    redirect('/dashboard')
  }
  return session
}

