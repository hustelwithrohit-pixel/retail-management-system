'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  total: number
  createdAt: string
}

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  gstin: string | null
  invoices: Invoice[]
  _count?: {
    invoices: number
  }
}

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomer()
  }, [customerId])

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      const data = await response.json()
      setCustomer(data)
    } catch (error) {
      console.error('Error fetching customer:', error)
    } finally {
      setLoading(false)
    }
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

  if (!customer) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-8 text-red-500">Customer not found</div>
        </AppLayout>
      </ProtectedRoute>
    )
  }

  const totalSpent = customer.invoices.reduce((sum, inv) => sum + inv.total, 0)

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <Link
            href="/customers"
            className="flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Link>

          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {customer.name}
            </h1>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Contact Information</h3>
                <p className="text-gray-600">{customer.phone || '-'}</p>
                <p className="text-gray-600">{customer.email || '-'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Address</h3>
                <p className="text-gray-600">
                  {customer.address || '-'}
                  {customer.city && `, ${customer.city}`}
                  {customer.state && `, ${customer.state}`}
                  {customer.pincode && ` - ${customer.pincode}`}
                </p>
                {customer.gstin && (
                  <p className="text-gray-600 mt-2">GSTIN: {customer.gstin}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{customer.invoices.length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Average Order</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    customer.invoices.length > 0
                      ? totalSpent / customer.invoices.length
                      : 0
                  )}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Recent Invoices</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Invoice #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invoice.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          {formatCurrency(invoice.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {customer.invoices.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No invoices found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}

