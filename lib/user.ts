import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(data: {
  email: string
  password: string
  role?: string
}) {
  const hashedPassword = await hashPassword(data.password)

  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: data.role ?? "USER",
    },
  })
}
