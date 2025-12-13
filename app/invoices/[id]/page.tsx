'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { formatCurrency, formatDateTime, buildWhatsAppMessage } from '@/lib/utils'
import { useInvoicePDF } from '@/components/invoices/InvoicePDF'
import { Button } from '@/components/ui/Button'
import { Download, Share2 } from 'lucide-react'

interface InvoiceItem {
  productName: string
  quantity: number
  price: number
  gstRate: number
  subtotal: number
  totalGst: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  customerAddress: string | null
  customerGstin: string | null
  subtotal: number
  cgst: number
  sgst: number
  totalGst: number
  discount: number
  total: number
  paymentMethod: string | null
  notes: string | null
  createdAt: string
  items: InvoiceItem[]
}

export default function InvoiceViewPage() {
  const params = useParams()
  const invoiceId = params.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const { generatePDF } = useInvoicePDF()

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      const data = await response.json()
      setInvoice(data)
    } catch (error) {
      console.error('Error fetching invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    if (invoice) {
      generatePDF(invoice, {
        name: process.env.NEXT_PUBLIC_BUSINESS_NAME,
        address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS,
        phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE,
        email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
        gstin: process.env.NEXT_PUBLIC_BUSINESS_GSTIN,
      })
    }
  }

  const handleShareWhatsApp = () => {
    if (!invoice || !invoice.customerPhone) return

    const message = buildWhatsAppMessage(
      `Invoice {{invoiceNumber}} - Total: ₹{{total}}. Thank you for your business!`,
      {
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total.toFixed(2),
      }
    )
    const url = `https://wa.me/${invoice.customerPhone.replace(/[^0-9]/g, '')}?text=${message}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-8 text-gray-500">Loading...</div>
        </AppLayout>
      </ProtectedRoute>
    )
  }

  if (!invoice) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-8 text-red-500">Invoice not found</div>
        </AppLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Invoice #{invoice.invoiceNumber}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDateTime(invoice.createdAt)}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleDownloadPDF} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                {invoice.customerPhone && (
                  <Button onClick={handleShareWhatsApp} variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share WhatsApp
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
                <p className="text-gray-800">{invoice.customerName}</p>
                {invoice.customerAddress && (
                  <p className="text-gray-600 text-sm">{invoice.customerAddress}</p>
                )}
                {invoice.customerPhone && (
                  <p className="text-gray-600 text-sm">Phone: {invoice.customerPhone}</p>
                )}
                {invoice.customerGstin && (
                  <p className="text-gray-600 text-sm">GSTIN: {invoice.customerGstin}</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Payment:</h3>
                <p className="text-gray-800 capitalize">
                  {invoice.paymentMethod || 'Cash'}
                </p>
              </div>
            </div>

            <div className="border-t border-b py-4 mb-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="pb-2">Item</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Rate</th>
                    <th className="pb-2 text-right">GST%</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.productName}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.price)}</td>
                      <td className="py-3 text-right">{item.gstRate}%</td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">CGST:</span>
                  <span className="font-medium">{formatCurrency(invoice.cgst)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SGST:</span>
                  <span className="font-medium">{formatCurrency(invoice.sgst)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium">
                      -{formatCurrency(invoice.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Notes:</strong> {invoice.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}

