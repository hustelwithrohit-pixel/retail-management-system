import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { getUserByEmail } from "@/lib/user"
import { hashPassword, verifyPassword } from "@/lib/password"

/* ============================
   USER CREATION (USED BY APIs)
============================ */
export async function createUser({
  email,
  password,
  name,
  role,
}: {
  email: string
  password: string
  name: string
  role: "OWNER" | "STAFF"
}) {
  const hashedPassword = await hashPassword(password)

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
  })
}

/* ============================
   NEXT-AUTH CONFIG
============================ */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const user = await getUserByEmail(credentials.email)
        if (!user) return null

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
