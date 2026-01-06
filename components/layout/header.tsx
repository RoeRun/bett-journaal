'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function Header() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (userData?.role === 'admin') {
          setIsAdmin(true)
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Bett Journaal
          </span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Tijdlijn
          </Link>
          
          {!isLoading && (
            <>
              {isAdmin ? (
                <>
                  <Link href="/admin/create">
                    <Button size="sm" variant="outline">
                      Nieuw Item
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={handleLogout}>
                    Uitloggen
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm" variant="outline">
                    Inloggen
                  </Button>
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

