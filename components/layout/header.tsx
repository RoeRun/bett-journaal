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

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUser()
      } else {
        setIsAdmin(false)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const user = session.user
        
        // Wait a bit for trigger to create user if needed
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Check if user exists in users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (userError && userError.code === 'PGRST116') {
          // User doesn't exist yet, wait a bit more and try again
          await new Promise(resolve => setTimeout(resolve, 500))
          const { data: retryUserData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
          
          if (retryUserData?.role === 'admin') {
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
          }
        } else if (userData?.role === 'admin') {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setIsAdmin(false)
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




