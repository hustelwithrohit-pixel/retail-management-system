import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Today's sales
    const todayInvoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const todayCount = todayInvoices.length

    // This month's sales
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthInvoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    })

    const monthSales = monthInvoices.reduce((sum, inv) => sum + inv.total, 0)

    // Stock alerts
    const products = await prisma.product.findMany({
      where: { isActive: true },
    })

    const lowStockCount = products.filter((p) => {
      if (p.lowStockAlert === null) return false
      return p.currentStock <= p.lowStockAlert
    }).length

    const overStockCount = products.filter((p) => {
      if (p.overStockAlert === null) return false
      return p.currentStock >= p.overStockAlert
    }).length

    // Pending reminders
    const pendingReminders = await prisma.reminder.count({
      where: {
        status: 'PENDING',
      },
    })

    // Total products
    const totalProducts = await prisma.product.count({
      where: { isActive: true },
    })

    // Total customers
    const totalCustomers = await prisma.customer.count()

    return NextResponse.json({
      todaySales: Math.round(todaySales * 100) / 100,
      todayCount,
      monthSales: Math.round(monthSales * 100) / 100,
      lowStockCount,
      overStockCount,
      pendingReminders,
      totalProducts,
      totalCustomers,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

