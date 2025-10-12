'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Shield, Lock, User } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simple validation (in real app, this would be an API call)
      if (username === 'admin' && password === 'admin') {
        // Redirect to main page
        window.location.href = '/'
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است')
      }
    } catch (err) {
      setError('خطا در اتصال به سرور')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            سیستم مانیتورینگ چاه‌های نفتی
          </CardTitle>
          <CardDescription className="text-gray-600">
            برای ورود به سیستم، نام کاربری و رمز عبور خود را وارد کنید
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  placeholder="نام کاربری را وارد کنید"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12"
                  placeholder="رمز عبور را وارد کنید"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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
                  در حال ورود...
                </div>
              ) : (
                'ورود به سیستم'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>برای ورود آزمایشی:</p>
            <p className="font-medium text-gray-700">نام کاربری: admin | رمز عبور: admin</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}