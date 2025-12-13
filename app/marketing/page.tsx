'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { buildWhatsAppMessage } from '@/lib/utils'
import { Share2, MessageSquare } from 'lucide-react'

interface Template {
  id: string
  name: string
  message: string
  variables: string[]
}

export default function MarketingPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templateData, setTemplateData] = useState<Record<string, string>>({})
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/marketing/templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleShareWhatsApp = () => {
    if (!selectedTemplate) return

    const message = buildWhatsAppMessage(selectedTemplate.message, templateData)
    const phone = phoneNumber.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${phone}?text=${message}`
    window.open(url, '_blank')
  }

  const handleShareInstagram = () => {
    // Instagram doesn't have a direct share API, so we'll copy to clipboard
    if (!selectedTemplate) return

    const message = buildWhatsAppMessage(selectedTemplate.message, templateData)
    navigator.clipboard.writeText(decodeURIComponent(message))
    alert('Message copied to clipboard! You can paste it in Instagram.')
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Marketing</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Templates</h2>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template)
                      const data: Record<string, string> = {}
                      template.variables.forEach((v) => {
                        data[v] = ''
                      })
                      setTemplateData(data)
                    }}
                    className={`w-full text-left p-3 rounded-lg border ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {template.message}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selectedTemplate && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Customize Message</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {variable.charAt(0).toUpperCase() + variable.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={templateData[variable] || ''}
                        onChange={(e) =>
                          setTemplateData({
                            ...templateData,
                            [variable]: e.target.value,
                          })
                        }
                        placeholder={`Enter ${variable}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  ))}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preview:
                    </p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {buildWhatsAppMessage(selectedTemplate.message, templateData)
                        .split('%20')
                        .join(' ')
                        .split('%0A')
                        .join('\n')}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleShareWhatsApp}
                      disabled={!phoneNumber}
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share WhatsApp
                    </Button>
                    <Button
                      onClick={handleShareInstagram}
                      variant="outline"
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Copy for Instagram
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}

