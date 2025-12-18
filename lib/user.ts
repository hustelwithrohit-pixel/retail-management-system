import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { UserRole } from "@prisma/client"

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function createUser(data: {
  email: string
  password: string
  name: string
  role?: UserRole
}) {
  const hashedPassword = await hashPassword(data.password)

  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role ?? UserRole.STAFF,
    },
  })
}
