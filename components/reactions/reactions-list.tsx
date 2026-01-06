'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Reaction } from '@/types/database'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface ReactionsListProps {
  subItemId: string
  onReactionAdded?: () => void
}

export function ReactionsList({ subItemId }: ReactionsListProps) {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadReactions()
    
    // Subscribe to new reactions
    const channel = supabase
      .channel(`reactions:${subItemId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reactions',
          filter: `sub_item_id=eq.${subItemId}`,
        },
        () => {
          loadReactions()
          if (onReactionAdded) onReactionAdded()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [subItemId, onReactionAdded])

  const loadReactions = async () => {
    try {
      const { data } = await supabase
        .from('reactions')
        .select('*')
        .eq('sub_item_id', subItemId)
        .order('created_at', { ascending: false })

      if (data) setReactions(data)
    } catch (error) {
      console.error('Error loading reactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Reacties laden...</p>
  }

  if (reactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nog geen reacties. Wees de eerste!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {reactions.map((reaction) => (
        <Card key={reaction.id} className="p-3 bg-gray-50">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{reaction.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({reaction.role})
                </span>
              </div>
              <p className="text-sm text-gray-700">{reaction.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(reaction.created_at), 'd MMM yyyy, HH:mm', { locale: nl })}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}




