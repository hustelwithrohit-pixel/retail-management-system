'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency, exportToCSV } from '@/lib/utils'
import { Download, BarChart3 } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [salesData, setSalesData] = useState<any>(null)
  const [gstData, setGstData] = useState<any>(null)
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSalesReport = async () => {
    setLoading(true)
    try {
      const url = `/api/reports/sales?startDate=${startDate}&endDate=${endDate}`
      const response = await fetch(url)
      const data = await response.json()
      setSalesData(data)
    } catch (error) {
      console.error('Error fetching sales report:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGSTReport = async () => {
    setLoading(true)
    try {
      const url = `/api/reports/gst?startDate=${startDate}&endDate=${endDate}`
      const response = await fetch(url)
      const data = await response.json()
      setGstData(data)
    } catch (error) {
      console.error('Error fetching GST report:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTopProducts = async () => {
    setLoading(true)
    try {
      const url = `/api/reports/top-products?startDate=${startDate}&endDate=${endDate}`
      const response = await fetch(url)
      const data = await response.json()
      setTopProducts(data)
    } catch (error) {
      console.error('Error fetching top products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = () => {
    if (activeTab === 'sales') fetchSalesReport()
    if (activeTab === 'gst') fetchGSTReport()
    if (activeTab === 'products') fetchTopProducts()
  }

  const handleExport = () => {
    if (activeTab === 'sales' && salesData) {
      exportToCSV(salesData.summary, `sales-report-${Date.now()}.csv`)
    } else if (activeTab === 'gst' && gstData) {
      exportToCSV(gstData.summary, `gst-report-${Date.now()}.csv`)
    } else if (activeTab === 'products' && topProducts) {
      exportToCSV(topProducts, `top-products-${Date.now()}.csv`)
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4 mb-4">
              <Input
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Button onClick={handleGenerate} disabled={loading}>
                Generate Report
              </Button>
              {(salesData || gstData || topProducts.length > 0) && (
                <Button onClick={handleExport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>

            <div className="flex space-x-2 border-b">
              {['sales', 'gst', 'products'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'sales' && salesData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Sales Report</h2>
              {salesData.summary && salesData.summary.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData.summary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#0ea5e9" />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {salesData.totals && (
                <div className="mt-6 grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Total Invoices</p>
                    <p className="text-2xl font-bold">{salesData.totals.count}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(salesData.totals.subtotal)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Total GST</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(salesData.totals.totalGst)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Grand Total</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(salesData.totals.total)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'gst' && gstData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">GST Report</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        GST Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Taxable Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        CGST
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        SGST
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total GST
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gstData.summary.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item.gstRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(item.taxableAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(item.cgst)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(item.sgst)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(item.totalGst)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && topProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topProducts.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}

