'use client'

import { SubItem, Media, Theme } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Image, Video, Music, Target, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { MediaViewer } from '../media/media-viewer'
import { ReactionsList } from '../reactions/reactions-list'
import { ReactionForm } from '../reactions/reaction-form'
import { PollDisplay } from '../polls/poll-display'
import { createSupabaseClient } from '@/lib/supabase/client'

interface SubItemCardProps {
  subItem: SubItem
  media: Media[]
  themes: Theme[]
}

export function SubItemCard({ subItem, media, themes }: SubItemCardProps) {
  const [showMediaViewer, setShowMediaViewer] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  const [itemThemes, setItemThemes] = useState<Theme[]>([])
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadItemThemes()
  }, [subItem.id])

  const loadItemThemes = async () => {
    try {
      const { data } = await supabase
        .from('sub_item_themes')
        .select('theme_id')
        .eq('sub_item_id', subItem.id)

      if (data) {
        const themeIds = data.map(d => d.theme_id)
        const matchedThemes = themes.filter(t => themeIds.includes(t.id))
        setItemThemes(matchedThemes)
      }
    } catch (error) {
      console.error('Error loading item themes:', error)
    }
  }

  const images = media.filter(m => m.type === 'image')
  const videos = media.filter(m => m.type === 'video')
  const audio = media.filter(m => m.type === 'audio')

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            {subItem.title}
          </h3>
          {subItem.text && (
            <p className="text-gray-600 mb-3">{subItem.text}</p>
          )}
        </div>

        {/* Themes */}
        {itemThemes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {itemThemes.map((theme) => (
              <Badge
                key={theme.id}
                variant="outline"
                style={{ borderColor: theme.color, color: theme.color }}
              >
                {theme.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Media Preview */}
        {media.length > 0 && (
          <div className="space-y-3">
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {images.slice(0, 3).map((img, index) => (
                  <div
                    key={img.id}
                    className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-100"
                    onClick={() => {
                      setSelectedMediaIndex(images.findIndex(m => m.id === img.id))
                      setShowMediaViewer(true)
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 3 && index === 2 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                        +{images.length - 3}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {videos.length > 0 && (
              <div className="space-y-2">
                {videos.map((video) => (
                  <div key={video.id} className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                    <video
                      src={video.url}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}

            {audio.length > 0 && (
              <div className="space-y-2">
                {audio.map((aud) => (
                  <div key={aud.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Music className="h-5 w-5 text-purple-500" />
                    <audio src={aud.url} controls className="flex-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audio URL */}
        {subItem.audio_url && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Music className="h-5 w-5 text-purple-500" />
            <audio src={subItem.audio_url} controls className="flex-1" />
          </div>
        )}

        {/* Action Field (SMART-doel) */}
        {subItem.action_field_text && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 mb-1">Actiepunt:</p>
                <p className="text-sm text-blue-800">{subItem.action_field_text}</p>
                {subItem.action_field_owner && (
                  <p className="text-xs text-blue-600 mt-1">
                    Eigenaar: {subItem.action_field_owner}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Polls */}
        <PollDisplay subItemId={subItem.id} />

        {/* Reactions */}
        <div className="border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReactions(!showReactions)}
            className="w-full"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Reacties {showReactions ? 'verbergen' : 'bekijken'}
          </Button>
          
          {showReactions && (
            <div className="mt-3 space-y-3">
              <ReactionsList subItemId={subItem.id} />
              <ReactionForm subItemId={subItem.id} />
            </div>
          )}
        </div>
      </div>

      {/* Media Viewer Modal */}
      {showMediaViewer && images.length > 0 && (
        <MediaViewer
          media={images}
          initialIndex={selectedMediaIndex}
          onClose={() => setShowMediaViewer(false)}
        />
      )}
    </Card>
  )
}

