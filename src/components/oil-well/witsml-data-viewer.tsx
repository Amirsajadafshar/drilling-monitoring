'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Download, Database, Code, Eye } from 'lucide-react'

interface WitsmlData {
  id: string
  dataType: string
  version: string
  xmlData?: string
  jsonData?: string
  timestamp: string
}

interface WitsmlDataViewerProps {
  wellId: string
  witsmlData: WitsmlData[]
}

export function WitsmlDataViewer({ wellId, witsmlData }: WitsmlDataViewerProps) {
  const [selectedData, setSelectedData] = useState<WitsmlData | null>(
    witsmlData.length > 0 ? witsmlData[0] : null
  )
  const [viewFormat, setViewFormat] = useState<'xml' | 'json' | 'raw'>('xml')

  const formatDataType = (dataType: string) => {
    const typeMap: Record<string, string> = {
      'drilling': 'حفاری',
      'production': 'تولید',
      'geology': 'زمین‌شناسی',
      'completion': 'تکمیل چاه',
      'testing': 'آزمایش'
    }
    return typeMap[dataType] || dataType
  }

  const generateSampleWITSML = (dataType: string) => {
    const timestamp = new Date().toISOString()
    return `<?xml version="1.0" encoding="UTF-8"?>
<wells version="2.1" xmlns="http://www.witsml.org/schemas/1series">
  <well uid="${wellId}">
    <name>Well-${wellId}</name>
    <status>drilling</status>
    <commonData>
      <dTimStamp>${timestamp}</dTimStamp>
    </commonData>
    
    ${dataType === 'drilling' ? `
    <wellbore uid="WB001">
      <name>Main Wellbore</name>
      <commonData>
        <dTimStamp>${timestamp}</dTimStamp>
      </commonData>
      
      <log uid="LOG001">
        <name>Drilling Parameters</name>
        <indexType>measured depth</indexType>
        <startIndex uom="m">3250</startIndex>
        <endIndex uom="m">3255</endIndex>
        <logData>
          <mnemonic>ROP</mnemonic>
          <unit>m/h</unit>
          <value>25.5</value>
        </logData>
        <logData>
          <mnemonic>WOB</mnemonic>
          <unit>kN</unit>
          <value>125.3</value>
        </logData>
        <logData>
          <mnemonic>RPM</mnemonic>
          <unit>/min</unit>
          <value>120</value>
        </logData>
      </log>
    </wellbore>
    ` : ''}
    
    ${dataType === 'production' ? `
    <wellbore uid="WB001">
      <name>Main Wellbore</name>
      <commonData>
        <dTimStamp>${timestamp}</dTimStamp>
      </commonData>
      
      <production uid="PROD001">
        <name>Daily Production</name>
        <dTimProd>${timestamp}</dTimProd>
        <prodPeriod uom="d">1</prodPeriod>
        <fluidType>oil</fluidType>
        <volOil uom="m3">1250</volOil>
        <volGas uom="m3">85000</volGas>
        <volWater uom="m3">150</volWater>
      </production>
    </wellbore>
    ` : ''}
  </well>
</wells>`
  }

  const generateSampleJSON = (dataType: string) => {
    const timestamp = new Date().toISOString()
    return JSON.stringify({
      wells: {
        version: "2.1",
        well: {
          uid: wellId,
          name: `Well-${wellId}`,
          status: "drilling",
          commonData: {
            dTimStamp: timestamp
          },
          ...(dataType === 'drilling' && {
            wellbore: {
              uid: "WB001",
              name: "Main Wellbore",
              log: {
                uid: "LOG001",
                name: "Drilling Parameters",
                indexType: "measured depth",
                startIndex: { value: 3250, uom: "m" },
                endIndex: { value: 3255, uom: "m" },
                logData: [
                  { mnemonic: "ROP", unit: "m/h", value: 25.5 },
                  { mnemonic: "WOB", unit: "kN", value: 125.3 },
                  { mnemonic: "RPM", unit: "/min", value: 120 }
                ]
              }
            }
          }),
          ...(dataType === 'production' && {
            wellbore: {
              uid: "WB001",
              name: "Main Wellbore",
              production: {
                uid: "PROD001",
                name: "Daily Production",
                dTimProd: timestamp,
                prodPeriod: { value: 1, uom: "d" },
                fluidType: "oil",
                volOil: { value: 1250, uom: "m3" },
                volGas: { value: 85000, uom: "m3" },
                volWater: { value: 150, uom: "m3" }
              }
            }
          })
        }
      }
    }, null, 2)
  }

  const downloadData = (format: 'xml' | 'json') => {
    if (!selectedData) return
    
    const content = format === 'xml' 
      ? selectedData.xmlData || generateSampleWITSML(selectedData.dataType)
      : selectedData.jsonData || generateSampleJSON(selectedData.dataType)
    
    const blob = new Blob([content], { 
      type: format === 'xml' ? 'application/xml' : 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${wellId}_${selectedData.dataType}_${selectedData.id}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getDisplayContent = () => {
    if (!selectedData) return ''

    if (viewFormat === 'xml') {
      return selectedData.xmlData || generateSampleWITSML(selectedData.dataType)
    } else if (viewFormat === 'json') {
      return selectedData.jsonData || generateSampleJSON(selectedData.dataType)
    } else {
      return JSON.stringify(selectedData, null, 2)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center justify-center sm:justify-start gap-2 text-base sm:text-lg">
          <Database className="h-4 w-4 sm:h-5 sm:w-5" />
          داده‌های WITSML
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-center sm:text-right">
          نمایش و مدیریت داده‌های استاندارد WITSML برای چاه {wellId}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 sm:space-y-4">
          {/* Data Selection */}
          <div className="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start">
            {witsmlData.map((data) => (
              <Button
                key={data.id}
                variant={selectedData?.id === data.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedData(data)}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                {formatDataType(data.dataType)}
                <Badge variant="secondary" className="text-xs">
                  v{data.version}
                </Badge>
              </Button>
            ))}
          </div>

          {selectedData && (
            <Tabs defaultValue="viewer" className="space-y-3 sm:space-y-4">
              <TabsList className="grid w-full grid-cols-2 gap-1 sm:gap-2">
                <TabsTrigger value="viewer" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">مشاهده داده</TabsTrigger>
                <TabsTrigger value="info" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">اطلاعات فایل</TabsTrigger>
              </TabsList>

              <TabsContent value="viewer" className="space-y-3 sm:space-y-4">
                {/* Format Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
                  <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                    <Button
                      variant={viewFormat === 'xml' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewFormat('xml')}
                      className="text-xs sm:text-sm"
                    >
                      XML
                    </Button>
                    <Button
                      variant={viewFormat === 'json' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewFormat('json')}
                      className="text-xs sm:text-sm"
                    >
                      JSON
                    </Button>
                    <Button
                      variant={viewFormat === 'raw' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewFormat('raw')}
                      className="text-xs sm:text-sm"
                    >
                      Raw
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadData('xml')}
                      className="text-xs sm:text-sm"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      XML
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadData('json')}
                      className="text-xs sm:text-sm"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      JSON
                    </Button>
                  </div>
                </div>

                {/* Data Display */}
                <ScrollArea className="h-[300px] sm:h-[400px] w-full border rounded-lg">
                  <pre className="p-2 sm:p-4 text-xs sm:text-sm overflow-x-auto bg-gray-50">
                    <code>{getDisplayContent()}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="info" className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-xs sm:text-sm font-medium">شناسه داده</label>
                      <p className="text-sm sm:text-lg font-mono">{selectedData.id}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium">نوع داده</label>
                      <p className="text-sm sm:text-lg">{formatDataType(selectedData.dataType)}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium">نسخه WITSML</label>
                      <p className="text-sm sm:text-lg">{selectedData.version}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <label className="text-xs sm:text-sm font-medium">تاریخ ایجاد</label>
                      <p className="text-sm sm:text-lg">
                        {new Date(selectedData.timestamp).toLocaleString('fa-IR')}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium">فرمت‌های موجود</label>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          XML
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          JSON
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium">اندازه تقریبی</label>
                      <p className="text-sm sm:text-lg">~2.5 KB</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!selectedData && (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <Database className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-400" />
              <p className="text-sm sm:text-base">هیچ داده WITSML برای نمایش وجود ندارد</p>
              <p className="text-xs sm:text-sm">لطفاً یک داده از لیست بالا انتخاب کنید</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}