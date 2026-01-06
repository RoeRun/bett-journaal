'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { SubItem, Day } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import Link from 'next/link'

export function HighlightsSection() {
  const [highlightedItems, setHighlightedItems] = useState<SubItem[]>([])
  const [days, setDays] = useState<Day[]>([])
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadHighlights()
  }, [])

  const loadHighlights = async () => {
    try {
      // Load days with highlights
      const { data: daysData } = await supabase
        .from('days')
        .select('*')
        .order('day_number', { ascending: true })

      if (daysData) {
        setDays(daysData)
        
        // Get all highlighted sub item IDs
        const allHighlightIds: string[] = []
        daysData.forEach(day => {
          if (day.highlights && Array.isArray(day.highlights)) {
            allHighlightIds.push(...day.highlights)
          }
        })

        if (allHighlightIds.length > 0) {
          const { data: itemsData } = await supabase
            .from('sub_items')
            .select('*')
            .in('id', allHighlightIds)

          if (itemsData) {
            setHighlightedItems(itemsData)
          }
        }
      }
    } catch (error) {
      console.error('Error loading highlights:', error)
    }
  }

  if (highlightedItems.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
        <h2 className="text-2xl font-bold">Dag Highlights</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlightedItems.map((item) => {
          const day = days.find(d => 
            d.highlights && Array.isArray(d.highlights) && d.highlights.includes(item.id)
          )
          return (
            <Card key={item.id} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <Badge className="bg-yellow-400 text-yellow-900">
                  ⭐ Highlight
                </Badge>
                {day && (
                  <span className="text-xs text-muted-foreground">
                    {day.title}
                  </span>
                )}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              {item.text && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {item.text}
                </p>
              )}
              <Link href={`/#day-${day?.id}`}>
                <span className="text-sm text-primary hover:underline">
                  Bekijk volledig →
                </span>
              </Link>
            </Card>
          )
        })}
      </div>
    </div>
  )
}




