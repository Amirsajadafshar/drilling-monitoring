'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, ArrowLeft, MapPin, Gauge, Thermometer, Droplets, Calendar, Target } from 'lucide-react'
import { useWellsStore } from '@/store/wells-store'

interface WellFormData {
  name: string
  location: string
  status: 'drilling' | 'producing' | 'completed' | 'planned'
  depth: number
  targetDepth: number
  temperature: number
  pressure: number
  flowRate: number
  witsmlVersion: string
  spudDate: string
}

export default function AddWellPage() {
  const { addWell } = useWellsStore()
  
  const [formData, setFormData] = useState<WellFormData>({
    name: '',
    location: '',
    status: 'planned',
    depth: 0,
    targetDepth: 0,
    temperature: 0,
    pressure: 0,
    flowRate: 0,
    witsmlVersion: '2.1',
    spudDate: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (field: keyof WellFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate required fields
      if (!formData.name || !formData.location) {
        setError('نام و محل چاه الزامی هستند')
        return
      }

      if (formData.depth < 0 || formData.targetDepth < 0) {
        setError('عمق و عمق هدف نمی‌توانند منفی باشند')
        return
      }

      if (formData.targetDepth > 0 && formData.depth > formData.targetDepth) {
        setError('عمق فعلی نمی‌تواند از عمق هدف بیشتر باشد')
        return
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add the well using the store
      addWell({
        name: formData.name,
        location: formData.location,
        status: formData.status,
        depth: formData.depth,
        targetDepth: formData.targetDepth || undefined,
        temperature: formData.temperature,
        pressure: formData.pressure,
        flowRate: formData.flowRate,
        witsmlVersion: formData.witsmlVersion,
        spudDate: formData.spudDate || undefined
      })
      
      setSuccess('چاه جدید با موفقیت ثبت شد')
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          location: '',
          status: 'planned',
          depth: 0,
          targetDepth: 0,
          temperature: 0,
          pressure: 0,
          flowRate: 0,
          witsmlVersion: '2.1',
          spudDate: ''
        })
        setSuccess('')
        
        // Redirect to home page after successful submission
        window.location.href = '/'
      }, 2000)
      
    } catch (err) {
      setError('خطا در ثبت اطلاعات چاه')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: WellFormData['status']) => {
    switch (status) {
      case 'drilling': return 'bg-blue-500'
      case 'producing': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      case 'planned': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: WellFormData['status']) => {
    switch (status) {
      case 'drilling': return 'در حال حفاری'
      case 'producing': return 'در حال تولید'
      case 'completed': return 'تکمیل شده'
      case 'planned': return 'برنامه ریزی شده'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-right">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">ثبت چاه جدید</h1>
              <p className="text-sm sm:text-base text-gray-600">اطلاعات چاه جدید را وارد کنید</p>
            </div>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="self-center sm:self-auto"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              بازگشت به صفحه اصلی
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  اطلاعات چاه
                </CardTitle>
                <CardDescription>
                  لطفاً تمام اطلاعات مورد نیاز را با دقت وارد کنید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">اطلاعات پایه</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">نام چاه *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="مثال: Well-A-01"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">محل چاه *</Label>
                        <Input
                          id="location"
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="مثال: South Pars Field"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">وضعیت چاه</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => handleInputChange('status', value as WellFormData['status'])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="وضعیت چاه را انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">برنامه ریزی شده</SelectItem>
                          <SelectItem value="drilling">در حال حفاری</SelectItem>
                          <SelectItem value="producing">در حال تولید</SelectItem>
                          <SelectItem value="completed">تکمیل شده</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Depth Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">اطلاعات عمق</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="depth">عمق فعلی (متر)</Label>
                        <Input
                          id="depth"
                          type="number"
                          value={formData.depth || ''}
                          onChange={(e) => handleInputChange('depth', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="targetDepth">عمق هدف (متر)</Label>
                        <Input
                          id="targetDepth"
                          type="number"
                          value={formData.targetDepth || ''}
                          onChange={(e) => handleInputChange('targetDepth', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="spudDate">تاریخ شروع حفاری</Label>
                      <Input
                        id="spudDate"
                        type="date"
                        value={formData.spudDate}
                        onChange={(e) => handleInputChange('spudDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Technical Parameters */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">پارامترهای فنی</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="temperature">دما (سانتی‌گراد)</Label>
                        <Input
                          id="temperature"
                          type="number"
                          value={formData.temperature || ''}
                          onChange={(e) => handleInputChange('temperature', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pressure">فشار (PSI)</Label>
                        <Input
                          id="pressure"
                          type="number"
                          value={formData.pressure || ''}
                          onChange={(e) => handleInputChange('pressure', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="flowRate">نرخ جریان (بشکه در روز)</Label>
                        <Input
                          id="flowRate"
                          type="number"
                          value={formData.flowRate || ''}
                          onChange={(e) => handleInputChange('flowRate', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="witsmlVersion">نسخه WITSML</Label>
                      <Select 
                        value={formData.witsmlVersion} 
                        onValueChange={(value) => handleInputChange('witsmlVersion', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="نسخه WITSML را انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1.2">1.2</SelectItem>
                          <SelectItem value="1.3">1.3</SelectItem>
                          <SelectItem value="1.4">1.4</SelectItem>
                          <SelectItem value="2.0">2.0</SelectItem>
                          <SelectItem value="2.1">2.1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        در حال ثبت...
                      </div>
                    ) : (
                      'ثبت چاه جدید'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  پیش‌نمایش
                </CardTitle>
                <CardDescription>
                  اطلاعات وارد شده را در اینجا مشاهده کنید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.name ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{formData.name}</span>
                        <Badge className={`${getStatusColor(formData.status)} text-white`}>
                          {getStatusText(formData.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{formData.location || 'محل مشخص نشده'}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Gauge className="h-4 w-4" />
                            عمق فعلی:
                          </span>
                          <span>{formData.depth.toLocaleString()} متر</span>
                        </div>
                        
                        {formData.targetDepth > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              عمق هدف:
                            </span>
                            <span>{formData.targetDepth.toLocaleString()} متر</span>
                          </div>
                        )}
                        
                        {formData.spudDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              تاریخ شروع:
                            </span>
                            <span>{new Date(formData.spudDate).toLocaleDateString('fa-IR')}</span>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        {formData.temperature > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Thermometer className="h-4 w-4" />
                              دما:
                            </span>
                            <span>{formData.temperature}°C</span>
                          </div>
                        )}
                        
                        {formData.pressure > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Gauge className="h-4 w-4" />
                              فشار:
                            </span>
                            <span>{formData.pressure.toLocaleString()} PSI</span>
                          </div>
                        )}
                        
                        {formData.flowRate > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Droplets className="h-4 w-4" />
                              نرخ جریان:
                            </span>
                            <span>{formData.flowRate.toLocaleString()} bbl/day</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        WITSML نسخه: {formData.witsmlVersion}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>اطلاعاتی برای نمایش وجود ندارد</p>
                      <p className="text-xs">لطفاً فرم را پر کنید</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}