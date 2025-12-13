'use client'

import { useSession } from 'next-auth/react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Download, Database } from 'lucide-react'
import { exportToCSV } from '@/lib/utils'

export default function SettingsPage() {
  const { data: session } = useSession()

  const handleExportProducts = async () => {
    try {
      const response = await fetch('/api/backup/export?type=products')
      const data = await response.json()
      exportToCSV(data, `products-${Date.now()}.csv`)
    } catch (error) {
      console.error('Error exporting products:', error)
    }
  }

  const handleExportInvoices = async () => {
    try {
      const response = await fetch('/api/backup/export?type=invoices')
      const data = await response.json()
      exportToCSV(data, `invoices-${Date.now()}.csv`)
    } catch (error) {
      console.error('Error exporting invoices:', error)
    }
  }

  const handleExportCustomers = async () => {
    try {
      const response = await fetch('/api/backup/export?type=customers')
      const data = await response.json()
      exportToCSV(data, `customers-${Date.now()}.csv`)
    } catch (error) {
      console.error('Error exporting customers:', error)
    }
  }

  const handleDownloadDB = async () => {
    try {
      const response = await fetch('/api/backup/export?type=db')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${new Date().toISOString().split('T')[0]}.db`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading database:', error)
    }
  }

  if (session?.user?.role !== 'OWNER') {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-8 text-red-500">
            Access denied. Owner only.
          </div>
        </AppLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Backup & Export</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Export Products</p>
                  <p className="text-sm text-gray-600">Download products as CSV</p>
                </div>
                <Button onClick={handleExportProducts} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Export Invoices</p>
                  <p className="text-sm text-gray-600">Download invoices as CSV</p>
                </div>
                <Button onClick={handleExportInvoices} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Export Customers</p>
                  <p className="text-sm text-gray-600">Download customers as CSV</p>
                </div>
                <Button onClick={handleExportCustomers} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">Download Database Backup</p>
                  <p className="text-sm text-gray-600">Download SQLite database file</p>
                </div>
                <Button onClick={handleDownloadDB} variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Business Information</h2>
            <div className="space-y-4">
              <Input
                label="Business Name"
                defaultValue={process.env.NEXT_PUBLIC_BUSINESS_NAME || ''}
              />
              <Input
                label="Address"
                defaultValue={process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || ''}
              />
              <Input
                label="Phone"
                defaultValue={process.env.NEXT_PUBLIC_BUSINESS_PHONE || ''}
              />
              <Input
                label="Email"
                type="email"
                defaultValue={process.env.NEXT_PUBLIC_BUSINESS_EMAIL || ''}
              />
              <Input
                label="GSTIN"
                defaultValue={process.env.NEXT_PUBLIC_BUSINESS_GSTIN || ''}
              />
              <Button>Save Changes</Button>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}

