'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Gauge, Target, Clock, TrendingUp } from 'lucide-react'

interface DepthProgressChartProps {
  wellId: string
  currentDepth: number
  targetDepth: number
  spudDate?: string
}

export function DepthProgressChart({ 
  wellId, 
  currentDepth, 
  targetDepth, 
  spudDate 
}: DepthProgressChartProps) {
  const [progressData, setProgressData] = useState<any[]>([])
  const [dailyProgress, setDailyProgress] = useState<any[]>([])

  useEffect(() => {
    // Generate mock depth progress data
    const generateProgressData = () => {
      const data = []
      const days = Math.min(30, Math.floor((currentDepth / targetDepth) * 60)) // Max 60 days
      const spud = spudDate ? new Date(spudDate) : new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      
      let accumulatedDepth = 0
      for (let i = 0; i <= days; i++) {
        const date = new Date(spud.getTime() + i * 24 * 60 * 60 * 1000)
        // Simulate varying drilling speeds
        const dailyProgress = Math.random() * 150 + 50 // 50-200 meters per day
        accumulatedDepth = Math.min(accumulatedDepth + dailyProgress, currentDepth)
        
        data.push({
          date: date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }),
          depth: Math.round(accumulatedDepth),
          progress: (accumulatedDepth / targetDepth) * 100
        })
      }
      return data
    }

    // Generate daily progress for the last 7 days
    const generateDailyProgress = () => {
      const data = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const progress = Math.random() * 200 + 100 // 100-300 meters per day
        
        data.push({
          day: date.toLocaleDateString('fa-IR', { weekday: 'short' }),
          progress: Math.round(progress)
        })
      }
      return data
    }

    setProgressData(generateProgressData())
    setDailyProgress(generateDailyProgress())
  }, [currentDepth, targetDepth, spudDate])

  const progressPercentage = (currentDepth / targetDepth) * 100
  const remainingDepth = targetDepth - currentDepth
  const estimatedDays = Math.ceil(remainingDepth / 150) // Assuming 150m/day average

  const progressChartConfig = {
    depth: {
      label: 'عمق حفاری',
      color: '#2563eb'
    }
  }

  const dailyChartConfig = {
    progress: {
      label: 'پیشرفت روزانه',
      color: '#16a34a'
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Gauge className="h-4 w-4 sm:h-5 sm:w-5" />
            پیشرفت کلی حفاری
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            وضعیت پیشرفت حفاری چاه {wellId}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 sm:space-y-6">
            {/* Progress Overview */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>پیشرفت کلی</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="w-full h-2 sm:h-4" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>عمق فعلی: {currentDepth.toLocaleString()} متر</span>
                <span>عمیت هدف: {targetDepth.toLocaleString()} متر</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {remainingDepth.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">متر باقیمانده</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {estimatedDays}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">روز تخمینی</div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium">وضعیت:</span>
              <Badge className="bg-blue-500 text-white text-xs sm:text-sm">
                <TrendingUp className="h-3 w-3 mr-1" />
                در حال پیشرفت
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Depth Progress Chart */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Target className="h-4 w-4 sm:h-5 sm:w-5" />
            نمودار پیشرفت عمق
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            پیشرفت عمق حفاری در طول زمان
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ChartContainer config={progressChartConfig} className="h-[250px] sm:h-[300px]">
            <AreaChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                interval={Math.ceil(progressData.length / 6)}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="depth"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Daily Progress */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            پیشرفت روزانه
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            پیشرفت حفاری در 7 روز گذشته
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ChartContainer config={dailyChartConfig} className="h-[250px] sm:h-[300px]">
            <AreaChart data={dailyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 10 }}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="progress"
                stroke="#16a34a"
                fill="#22c55e"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Well Information */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">اطلاعات چاه</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            جزئیات فنی چاه {wellId}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium">شناسه چاه</label>
                <p className="text-sm sm:text-lg font-mono">{wellId}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium">تاریخ شروع</label>
                <p className="text-sm sm:text-lg">
                  {spudDate ? new Date(spudDate).toLocaleDateString('fa-IR') : 'نامشخص'}
                </p>
              </div>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>میانگین سرعت حفاری</span>
                <span className="font-medium">142 متر/روز</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>بیشترین سرعت ثبت شده</span>
                <span className="font-medium">285 متر/روز</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>کل زمان فعالیت</span>
                <span className="font-medium">{Math.floor(currentDepth / 142)} روز</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}