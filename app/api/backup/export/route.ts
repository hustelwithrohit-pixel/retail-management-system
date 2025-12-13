import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // products, invoices, customers, db

    if (type === 'products') {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(products)
    }

    if (type === 'invoices') {
      const invoices = await prisma.invoice.findMany({
        include: {
          items: true,
          customer: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(invoices)
    }

    if (type === 'customers') {
      const customers = await prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(customers)
    }

    if (type === 'db') {
      // For SQLite, we can return the database file path
      // In production, you'd want to stream the file
      const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db'
      
      if (fs.existsSync(dbPath)) {
        const dbBuffer = fs.readFileSync(dbPath)
        return new NextResponse(dbBuffer, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.db"`,
          },
        })
      } else {
        return NextResponse.json(
          { error: 'Database file not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid export type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

