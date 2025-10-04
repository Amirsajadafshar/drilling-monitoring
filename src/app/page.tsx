'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Activity, Gauge, Thermometer, Droplets, Zap, TrendingUp, Clock, MapPin } from 'lucide-react'
import { DrillingParametersChart } from '@/components/oil-well/drilling-parameters-chart'
import { DepthProgressChart } from '@/components/oil-well/depth-progress-chart'
import { WitsmlDataViewer } from '@/components/oil-well/witsml-data-viewer'

interface WellData {
  id: string
  name: string
  location: string
  status: 'drilling' | 'producing' | 'completed' | 'planned'
  depth: number
  temperature: number
  pressure: number
  flowRate: number
  witsmlVersion: string
  lastUpdate: string
  targetDepth?: number
  spudDate?: string
}

interface DrillingParameter {
  name: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  timestamp: string
}

interface WitsmlData {
  id: string
  dataType: string
  version: string
  xmlData?: string
  jsonData?: string
  timestamp: string
}

export default function Home() {
  const [wellData, setWellData] = useState<WellData[]>([])
  const [selectedWell, setSelectedWell] = useState<WellData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demonstration
    const mockWellData: WellData[] = [
      {
        id: '1',
        name: 'Well-A-01',
        location: 'South Pars Field',
        status: 'drilling',
        depth: 3250,
        targetDepth: 4100,
        temperature: 85,
        pressure: 4500,
        flowRate: 0,
        witsmlVersion: '2.1',
        lastUpdate: '2024-01-15T10:30:00Z',
        spudDate: '2023-10-15T00:00:00Z'
      },
      {
        id: '2',
        name: 'Well-B-02',
        location: 'North Dome Field',
        status: 'producing',
        depth: 2800,
        targetDepth: 2800,
        temperature: 78,
        pressure: 3800,
        flowRate: 1250,
        witsmlVersion: '2.1',
        lastUpdate: '2024-01-15T10:45:00Z',
        spudDate: '2023-08-20T00:00:00Z'
      },
      {
        id: '3',
        name: 'Well-C-03',
        location: 'West Oil Field',
        status: 'completed',
        depth: 4100,
        targetDepth: 4100,
        temperature: 92,
        pressure: 5200,
        flowRate: 980,
        witsmlVersion: '2.0',
        lastUpdate: '2024-01-14T16:20:00Z',
        spudDate: '2023-05-10T00:00:00Z'
      }
    ]
    
    setWellData(mockWellData)
    setSelectedWell(mockWellData[0])
    setLoading(false)
  }, [])

  const getStatusColor = (status: WellData['status']) => {
    switch (status) {
      case 'drilling': return 'bg-blue-500'
      case 'producing': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      case 'planned': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: WellData['status']) => {
    switch (status) {
      case 'drilling': return 'در حال حفاری'
      case 'producing': return 'در حال تولید'
      case 'completed': return 'تکمیل شده'
      case 'planned': return 'برنامه ریزی شده'
      default: return status
    }
  }

  const drillingParameters: DrillingParameter[] = selectedWell ? [
    { name: 'سرعت حفاری', value: 25, unit: 'متر/ساعت', status: 'normal', timestamp: new Date().toISOString() },
    { name: 'فشار گل حفاری', value: 4500, unit: 'PSI', status: 'normal', timestamp: new Date().toISOString() },
    { name: 'دبی گل', value: 450, unit: 'گالن/دقیقه', status: 'warning', timestamp: new Date().toISOString() },
    { name: 'گشتاور', value: 15000, unit: 'فوت-پوند', status: 'normal', timestamp: new Date().toISOString() },
    { name: 'سرعت چرخش', value: 120, unit: 'دور بر دقیقه', status: 'normal', timestamp: new Date().toISOString() },
    { name: 'وزن روی مته', value: 25000, unit: 'پوند', status: 'critical', timestamp: new Date().toISOString() }
  ] : []

  const mockWitsmlData: WitsmlData[] = selectedWell ? [
    {
      id: 'witsml-1',
      dataType: 'drilling',
      version: '2.1',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'witsml-2',
      dataType: 'production',
      version: '2.1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'witsml-3',
      dataType: 'geology',
      version: '2.0',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    }
  ] : []

  const getParameterStatusColor = (status: DrillingParameter['status']) => {
    switch (status) {
      case 'normal': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">در حال بارگذاری اطلاعات چاه‌های نفتی...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">سیستم مانیتورینگ چاه‌های نفتی</h1>
          <p className="text-gray-600">دریافت و نمایش اطلاعات مهندسی نفت با استاندارد WITSML</p>
        </div>

        {/* Well Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">انتخاب چاه</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wellData.map((well) => (
              <Card 
                key={well.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedWell?.id === well.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedWell(well)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{well.name}</CardTitle>
                    <Badge className={`${getStatusColor(well.status)} text-white`}>
                      {getStatusText(well.status)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {well.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>عمق:</span>
                      <span className="font-medium">{well.depth.toLocaleString()} متر</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>آخرین به‌روزرسانی:</span>
                      <span className="font-medium">
                        {new Date(well.lastUpdate).toLocaleString('fa-IR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Selected Well Details */}
        {selectedWell && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">نمای کلی</TabsTrigger>
              <TabsTrigger value="parameters">پارامترهای حفاری</TabsTrigger>
              <TabsTrigger value="witsml">داده‌های WITSML</TabsTrigger>
              <TabsTrigger value="history">تاریخچه</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {selectedWell && (
                <DepthProgressChart
                  wellId={selectedWell.id}
                  currentDepth={selectedWell.depth}
                  targetDepth={selectedWell.targetDepth || 4100}
                  spudDate={selectedWell.spudDate}
                />
              )}
            </TabsContent>

            <TabsContent value="parameters" className="space-y-6">
              {selectedWell && (
                <DrillingParametersChart
                  wellId={selectedWell.id}
                  parameters={drillingParameters}
                  timeRange="1h"
                />
              )}
            </TabsContent>

            <TabsContent value="witsml" className="space-y-6">
              {selectedWell && (
                <WitsmlDataViewer
                  wellId={selectedWell.id}
                  witsmlData={mockWitsmlData}
                />
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>تاریخچه عملیات</CardTitle>
                  <CardDescription>تاریخچه فعالیت‌های چاه {selectedWell.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-2 border-blue-500 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">شروع حفاری</span>
                        <span className="text-sm text-gray-500">1402-10-15</span>
                      </div>
                      <p className="text-sm text-gray-600">شروع عملیات حفاری چاه</p>
                    </div>
                    <div className="border-l-2 border-green-500 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="font-medium">رسیدن به عمیت 2000 متر</span>
                        <span className="text-sm text-gray-500">1402-11-20</span>
                      </div>
                      <p className="text-sm text-gray-600">تکمیل مرحله اول حفاری</p>
                    </div>
                    <div className="border-l-2 border-yellow-500 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Thermometer className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">تغییر مته حفاری</span>
                        <span className="text-sm text-gray-500">1402-12-01</span>
                      </div>
                      <p className="text-sm text-gray-600">تعویض مته برای ادامه حفاری</p>
                    </div>
                    <div className="border-l-2 border-purple-500 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">وضعیت فعلی</span>
                        <span className="text-sm text-gray-500">1403-01-15</span>
                      </div>
                      <p className="text-sm text-gray-600">در حال حفاری در عمیت {selectedWell.depth} متر</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}