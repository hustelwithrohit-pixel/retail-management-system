import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/user"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const userCount = await prisma.user.count()
    const role: UserRole = userCount === 0 ? "OWNER" : "STAFF"

    const user = await createUser({
      email,
      password,
      name,
      role,
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
