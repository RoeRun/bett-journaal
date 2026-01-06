'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Day, SubItem, Media, Theme } from '@/types/database'
import { TimelineDay } from '@/components/timeline/timeline-day'
import { FilterBar } from '@/components/filters/filter-bar'
import { Button } from '@/components/ui/button'
import { HighlightsSection } from '@/components/highlights/highlights-section'
import { PDFExport } from '@/components/pdf/pdf-export'

export default function Home() {
  const [days, setDays] = useState<Day[]>([])
  const [subItems, setSubItems] = useState<SubItem[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [subItemThemes, setSubItemThemes] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadData()
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('timeline-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sub_items',
        },
        () => {
          loadData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media',
        },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (subItems.length > 0) {
      loadSubItemThemes()
    }
  }, [subItems])

  const loadData = async () => {
    try {
      // Load days
      const { data: daysData } = await supabase
        .from('days')
        .select('*')
        .order('day_number', { ascending: true })

      // Load themes
      const { data: themesData } = await supabase
        .from('themes')
        .select('*')
        .order('name', { ascending: true })

      // Load sub items
      const { data: subItemsData } = await supabase
        .from('sub_items')
        .select('*')
        .order('created_at', { ascending: false })

      // Load media
      const { data: mediaData } = await supabase
        .from('media')
        .select('*')
        .order('order', { ascending: true })

      if (daysData) setDays(daysData)
      if (themesData) setThemes(themesData)
      if (subItemsData) setSubItems(subItemsData)
      if (mediaData) setMedia(mediaData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSubItemThemes = async () => {
    try {
      const { data } = await supabase
        .from('sub_item_themes')
        .select('sub_item_id, theme_id')

      if (data) {
        const themeMap: Record<string, string[]> = {}
        data.forEach((item) => {
          if (!themeMap[item.sub_item_id]) {
            themeMap[item.sub_item_id] = []
          }
          themeMap[item.sub_item_id].push(item.theme_id)
        })
        setSubItemThemes(themeMap)
      }
    } catch (error) {
      console.error('Error loading sub item themes:', error)
    }
  }

  const filteredSubItems = selectedThemes.length > 0
    ? subItems.filter(item => {
        const itemThemes = subItemThemes[item.id] || []
        return itemThemes.some(themeId => selectedThemes.includes(themeId))
      })
    : subItems

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Bett Journaal
          </h1>
          <p className="text-muted-foreground">
            Interactief visueel journaal van de Bett beurs - Stichting Chrono
          </p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <FilterBar
              themes={themes}
              selectedThemes={selectedThemes}
              onThemesChange={setSelectedThemes}
            />
          </div>
          <div className="w-full md:w-80">
            <PDFExport days={days} themes={themes} />
          </div>
        </div>

        <HighlightsSection />

        <div className="space-y-12 mt-8">
          {days.map((day) => {
            const daySubItems = filteredSubItems.filter(
              item => item.day_id === day.id
            )
            return (
              <TimelineDay
                key={day.id}
                day={day}
                subItems={daySubItems}
                media={media}
                themes={themes}
              />
            )
          })}
        </div>

        {days.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nog geen dagen beschikbaar. Beheerders kunnen items toevoegen.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
