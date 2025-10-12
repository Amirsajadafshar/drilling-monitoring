'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Activity, Gauge, Thermometer, Droplets, Zap, TrendingUp, Clock, MapPin, LogOut, Plus } from 'lucide-react'
import { DrillingParametersChart } from '@/components/oil-well/drilling-parameters-chart'
import { DepthProgressChart } from '@/components/oil-well/depth-progress-chart'
import { WitsmlDataViewer } from '@/components/oil-well/witsml-data-viewer'
import { useWellsStore, WellData } from '@/store/wells-store'

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
  const { wells, selectedWell, setSelectedWell } = useWellsStore()

  useEffect(() => {
    // Auto-select the first well if none is selected
    if (wells.length > 0 && !selectedWell) {
      setSelectedWell(wells[0])
    }
  }, [wells, selectedWell, setSelectedWell])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
          {/* Header */}
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-right">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">سیستم مانیتورینگ چاه‌های نفتی</h1>
            <p className="text-sm sm:text-base text-gray-600">دریافت و نمایش اطلاعات مهندسی نفت با استاندارد WITSML</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 self-center sm:self-auto">
            <Button 
              onClick={() => window.location.href = '/add-well'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 ml-2" />
              افزودن چاه جدید
            </Button>
            <Button 
              onClick={() => window.location.href = '/login'}
              variant="outline"
            >
              <LogOut className="h-4 w-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>

        {/* Well Selection */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center sm:text-right">انتخاب چاه</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {wells.map((well) => (
              <Card 
                key={well.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedWell?.id === well.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedWell(well)}
              >
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg text-center sm:text-right">{well.name}</CardTitle>
                    <Badge className={`${getStatusColor(well.status)} text-white text-xs sm:text-sm`}>
                      {getStatusText(well.status)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 text-xs sm:text-sm text-center sm:text-right">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{well.location}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 sm:space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>عمق:</span>
                      <span className="font-medium">{well.depth.toLocaleString()} متر</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>آخرین به‌روزرسانی:</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {new Date(well.lastUpdate).toLocaleString('fa-IR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">نمای کلی</TabsTrigger>
              <TabsTrigger value="parameters" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">پارامترها</TabsTrigger>
              <TabsTrigger value="witsml" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">WITSML</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">تاریخچه</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              {selectedWell && (
                <DepthProgressChart
                  wellId={selectedWell.id}
                  currentDepth={selectedWell.depth}
                  targetDepth={selectedWell.targetDepth || 4100}
                  spudDate={selectedWell.spudDate}
                />
              )}
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4 sm:space-y-6">
              {selectedWell && (
                <DrillingParametersChart
                  wellId={selectedWell.id}
                  parameters={drillingParameters}
                  timeRange="1h"
                />
              )}
            </TabsContent>

            <TabsContent value="witsml" className="space-y-4 sm:space-y-6">
              {selectedWell && (
                <WitsmlDataViewer
                  wellId={selectedWell.id}
                  witsmlData={mockWitsmlData}
                />
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl text-center sm:text-right">تاریخچه عملیات</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-center sm:text-right">تاریخچه فعالیت‌های چاه {selectedWell.name}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="border-l-2 border-blue-500 pl-3 sm:pl-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
                        <Zap className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">شروع حفاری</span>
                        <span className="text-xs sm:text-sm text-gray-500">1402-10-15</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">شروع عملیات حفاری چاه</p>
                    </div>
                    <div className="border-l-2 border-green-500 pl-3 sm:pl-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
                        <Activity className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">رسیدن به عمیت 2000 متر</span>
                        <span className="text-xs sm:text-sm text-gray-500">1402-11-20</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">تکمیل مرحله اول حفاری</p>
                    </div>
                    <div className="border-l-2 border-yellow-500 pl-3 sm:pl-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
                        <Thermometer className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">تغییر مته حفاری</span>
                        <span className="text-xs sm:text-sm text-gray-500">1402-12-01</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">تعویض مته برای ادامه حفاری</p>
                    </div>
                    <div className="border-l-2 border-purple-500 pl-3 sm:pl-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">وضعیت فعلی</span>
                        <span className="text-xs sm:text-sm text-gray-500">1403-01-15</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">در حال حفاری در عمیت {selectedWell.depth} متر</p>
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