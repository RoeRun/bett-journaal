'use client'

import { Day, SubItem, Media, Theme } from '@/types/database'
import { SubItemCard } from './sub-item-card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { ScrollAnimation } from '@/components/animations/scroll-animation'

interface TimelineDayProps {
  day: Day
  subItems: SubItem[]
  media: Media[]
  themes: Theme[]
}

export function TimelineDay({ day, subItems, media, themes }: TimelineDayProps) {
  const isHighlight = day.highlights && day.highlights.length > 0

  return (
    <ScrollAnimation delay={0.1}>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 opacity-30" />
        
        <Card className="relative bg-white/90 backdrop-blur-sm shadow-lg border-2 hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-xl shadow-lg">
                {day.day_number}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-800">{day.title}</h2>
                  {isHighlight && (
                    <Badge className="bg-yellow-400 text-yellow-900">
                      ⭐ Highlight
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(day.date), 'EEEE d MMMM yyyy', { locale: nl })}
                  </span>
                </div>
              </div>
            </div>

            {subItems.length > 0 ? (
              <div className="space-y-4">
                {subItems.map((subItem) => {
                  const itemMedia = media.filter(m => m.sub_item_id === subItem.id)
                  return (
                    <SubItemCard
                      key={subItem.id}
                      subItem={subItem}
                      media={itemMedia}
                      themes={themes}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nog geen items voor deze dag</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </ScrollAnimation>
  )
}

