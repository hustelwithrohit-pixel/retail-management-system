import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const groupBy = searchParams.get('groupBy') || 'day' // day, week, month

    const where: any = {}
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        items: true,
      },
    })

    // Group by day/week/month
    const grouped: Record<string, any> = {}
    invoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt)
      let key: string

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0]
      } else if (groupBy === 'week') {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          count: 0,
          subtotal: 0,
          gst: 0,
          discount: 0,
          total: 0,
        }
      }

      grouped[key].count += 1
      grouped[key].subtotal += invoice.subtotal
      grouped[key].gst += invoice.totalGst
      grouped[key].discount += invoice.discount
      grouped[key].total += invoice.total
    })

    const summary = Object.values(grouped)

    // Calculate totals
    const totals = invoices.reduce(
      (acc, inv) => ({
        count: acc.count + 1,
        subtotal: acc.subtotal + inv.subtotal,
        cgst: acc.cgst + inv.cgst,
        sgst: acc.sgst + inv.sgst,
        totalGst: acc.totalGst + inv.totalGst,
        discount: acc.discount + inv.discount,
        total: acc.total + inv.total,
      }),
      {
        count: 0,
        subtotal: 0,
        cgst: 0,
        sgst: 0,
        totalGst: 0,
        discount: 0,
        total: 0,
      }
    )

    return NextResponse.json({
      summary,
      totals,
    })
  } catch (error) {
    console.error('Error generating sales report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

