'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, TrendingUp, AlertTriangle, Play, Pause, Wifi, WifiOff } from 'lucide-react'
import { useWellSocket } from '@/hooks/use-well-socket'

interface DrillingParameter {
  name: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  timestamp: string
}

interface DrillingParametersChartProps {
  wellId: string
  parameters: DrillingParameter[]
  timeRange?: '1h' | '6h' | '24h' | '7d'
}

export function DrillingParametersChart({ wellId, parameters, timeRange = '1h' }: DrillingParametersChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [selectedParameters, setSelectedParameters] = useState<string[]>(['سرعت حفاری', 'فشار گل حفاری'])
  const [simulationRunning, setSimulationRunning] = useState(false)
  
  const { 
    isConnected, 
    latestData, 
    parameterUpdates, 
    startSimulation, 
    stopSimulation 
  } = useWellSocket(wellId)

  useEffect(() => {
    // Generate initial time series data
    const generateTimeSeriesData = () => {
      const data = []
      const now = new Date()
      const intervals = timeRange === '1h' ? 12 : timeRange === '6h' ? 24 : timeRange === '24h' ? 48 : 168
      const intervalMs = timeRange === '1h' ? 5 * 60 * 1000 : timeRange === '6h' ? 15 * 60 * 1000 : timeRange === '24h' ? 30 * 60 * 1000 : 60 * 60 * 1000

      for (let i = intervals - 1; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * intervalMs)
        const dataPoint: any = {
          time: timestamp.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          timestamp: timestamp.toISOString()
        }

        selectedParameters.forEach(paramName => {
          const baseParam = parameters.find(p => p.name === paramName)
          if (baseParam) {
            const variation = (Math.random() - 0.5) * 0.2
            dataPoint[paramName] = Math.round(baseParam.value * (1 + variation))
          }
        })

        data.push(dataPoint)
      }
      return data
    }

    setChartData(generateTimeSeriesData())
  }, [parameters, selectedParameters, timeRange])

  useEffect(() => {
    // Update chart data with real-time updates
    if (parameterUpdates.length > 0) {
      const latestUpdate = parameterUpdates[parameterUpdates.length - 1]
      
      setChartData(prev => {
        const newData = [...prev]
        const lastDataPoint = { ...newData[newData.length - 1] }
        
        if (selectedParameters.includes(latestUpdate.name)) {
          lastDataPoint[latestUpdate.name] = latestUpdate.value
          lastDataPoint.time = new Date(latestUpdate.timestamp).toLocaleTimeString('fa-IR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
          lastDataPoint.timestamp = latestUpdate.timestamp
          
          // Keep only last 20 data points for real-time view
          if (newData.length >= 20) {
            newData.shift()
          }
          newData[newData.length - 1] = lastDataPoint
        }
        
        return newData
      })
    }
  }, [parameterUpdates, selectedParameters])

  useEffect(() => {
    // Update parameters with latest data from WebSocket
    if (latestData) {
      // Here you could update the parameters state if needed
      console.log('Latest data received:', latestData)
    }
  }, [latestData])

  const chartConfig = selectedParameters.reduce((config, paramName, index) => {
    const colors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea']
    config[paramName] = {
      label: paramName,
      color: colors[index % colors.length]
    }
    return config
  }, {} as any)

  const getStatusColor = (status: DrillingParameter['status']) => {
    switch (status) {
      case 'normal': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: DrillingParameter['status']) => {
    switch (status) {
      case 'normal': return 'عادی'
      case 'warning': return 'هشدار'
      case 'critical': return 'بحرانی'
      default: return status
    }
  }

  const toggleParameter = (paramName: string) => {
    setSelectedParameters(prev => 
      prev.includes(paramName) 
        ? prev.filter(p => p !== paramName)
        : [...prev, paramName]
    )
  }

  const handleSimulationToggle = () => {
    if (simulationRunning) {
      stopSimulation()
      setSimulationRunning(false)
    } else {
      startSimulation()
      setSimulationRunning(true)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
          <div className="text-center sm:text-right">
            <CardTitle className="flex items-center justify-center sm:justify-start gap-2 text-base sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              پارامترهای حفاری
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              نمایش پارامترهای زنده حفاری برای چاه {wellId}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1 text-xs sm:text-sm">
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? 'متصل' : 'قطع'}
            </Badge>
            <Button
              variant={simulationRunning ? "destructive" : "default"}
              size="sm"
              onClick={handleSimulationToggle}
              disabled={!isConnected}
              className="text-xs sm:text-sm"
            >
              {simulationRunning ? <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
              {simulationRunning ? 'توقف شبیه‌سازی' : 'شروع شبیه‌سازی'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 sm:space-y-4">
          {/* Parameter Selection */}
          <div className="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start">
            {parameters.map((param) => (
              <button
                key={param.name}
                onClick={() => toggleParameter(param.name)}
                className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  selectedParameters.includes(param.name)
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {param.name}
                {param.status !== 'normal' && (
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                )}
              </button>
            ))}
          </div>

          {/* Chart */}
          {selectedParameters.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] sm:h-[400px]">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  interval={Math.ceil(chartData.length / 6)}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {selectedParameters.map((paramName) => (
                  <Line
                    key={paramName}
                    type="monotone"
                    dataKey={paramName}
                    stroke={chartConfig[paramName]?.color || '#2563eb'}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] sm:h-[400px] flex items-center justify-center text-gray-500 text-sm">
              لطفاً حداقل یک پارامتر را برای نمایش انتخاب کنید
            </div>
          )}

          {/* Real-time Updates Indicator */}
          {simulationRunning && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="text-sm text-green-700">در حال دریافت داده‌های زنده</span>
              <span className="text-xs text-green-600">
                ({parameterUpdates.length} به‌روزرسانی دریافت شده)
              </span>
            </div>
          )}

          {/* Current Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {parameters.map((param) => {
              const latestUpdate = parameterUpdates
                .filter(update => update.name === param.name)
                .pop()
              
              const currentValue = latestUpdate?.value || param.value
              const currentStatus = latestUpdate?.status || param.status
              
              return (
                <div key={param.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-2 sm:gap-0">
                  <div className="text-center sm:text-right">
                    <div className="font-medium text-sm sm:text-base">{param.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {currentValue.toLocaleString()} {param.unit}
                      {latestUpdate && (
                        <span className="text-xs text-green-600 mr-2 block sm:inline">
                          (زنده)
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(currentStatus)} text-white text-xs sm:text-sm`}>
                    {getStatusText(currentStatus)}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}