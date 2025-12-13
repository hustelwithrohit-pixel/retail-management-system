import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'

const templates = [
  {
    id: '1',
    name: 'Festival Sale',
    message: '🎉 Special Festival Sale! Get {{discount}}% off on all products. Valid till {{date}}. Visit us now!',
    variables: ['discount', 'date'],
  },
  {
    id: '2',
    name: 'New Arrival',
    message: '🆕 New products just arrived! Check out our latest collection. Limited stock available!',
    variables: [],
  },
  {
    id: '3',
    name: 'Customer Appreciation',
    message: 'Thank you {{customerName}} for being a valued customer! Here\'s a special {{discount}}% discount on your next purchase. Use code: {{code}}',
    variables: ['customerName', 'discount', 'code'],
  },
  {
    id: '4',
    name: 'Clearance Sale',
    message: '🔥 Clearance Sale! Up to {{discount}}% off on selected items. Hurry, limited time offer!',
    variables: ['discount'],
  },
  {
    id: '5',
    name: 'Birthday Wish',
    message: '🎂 Happy Birthday {{customerName}}! Enjoy a special {{discount}}% discount on your birthday. Visit us today!',
    variables: ['customerName', 'discount'],
  },
  {
    id: '6',
    name: 'Low Stock Alert',
    message: '⏰ Limited stock available on {{productName}}. Order now before it\'s gone!',
    variables: ['productName'],
  },
]

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

