import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
    })

    const lowStockAlerts = products.filter((product) => {
      if (product.lowStockAlert === null) return false
      return product.currentStock <= product.lowStockAlert
    })

    const overStockAlerts = products.filter((product) => {
      if (product.overStockAlert === null) return false
      return product.currentStock >= product.overStockAlert
    })

    return NextResponse.json({
      lowStock: lowStockAlerts,
      overStock: overStockAlerts,
    })
  } catch (error) {
    console.error('Error fetching stock alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

