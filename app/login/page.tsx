'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Error logging in:', error.message)
      alert('Er ging iets mis bij het inloggen. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Beheerder Login
          </CardTitle>
          <CardDescription className="text-center">
            Log in met je Google account om bijdragen toe te voegen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Bezig...' : 'Inloggen met Google'}
          </Button>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Alleen beheerders kunnen inloggen. Viewers kunnen de tijdlijn direct bekijken zonder inlog.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}