'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MediaUpload } from '@/components/media/media-upload'
import { ThemeSelector } from '@/components/admin/theme-selector'
import { PollForm } from '@/components/admin/poll-form'
import { Day, Theme, Poll, SubItem, Media } from '@/types/database'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface MediaFile {
  file: File
  preview?: string
  type: 'image' | 'video' | 'audio'
  uploading: boolean
  progress: number
  url?: string
  error?: string
}

export default function EditSubItemPage() {
  const router = useRouter()
  const params = useParams()
  const subItemId = params.id as string
  const supabase = createSupabaseClient()
  
  const [days, setDays] = useState<Day[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [existingMedia, setExistingMedia] = useState<Media[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [pollData, setPollData] = useState<Partial<Poll> | null>(null)
  const [existingPoll, setExistingPoll] = useState<Poll | null>(null)
  
  const [formData, setFormData] = useState({
    day_id: '',
    title: '',
    text: '',
    audio_url: '',
    action_field_text: '',
    action_field_owner: '',
    selectedThemes: [] as string[],
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAdmin()
    loadData()
  }, [subItemId])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role !== 'admin') {
        router.push('/')
        return
      }

      setIsAdmin(true)
    } catch (error) {
      console.error('Error checking admin:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async () => {
    try {
      // Load days and themes
      const { data: daysData } = await supabase
        .from('days')
        .select('*')
        .order('day_number', { ascending: true })

      const { data: themesData } = await supabase
        .from('themes')
        .select('*')
        .order('name', { ascending: true })

      if (daysData) setDays(daysData)
      if (themesData) setThemes(themesData)

      // Load existing sub item
      const { data: subItemData } = await supabase
        .from('sub_items')
        .select('*')
        .eq('id', subItemId)
        .single()

      if (subItemData) {
        setFormData({
          day_id: subItemData.day_id,
          title: subItemData.title || '',
          text: subItemData.text || '',
          audio_url: subItemData.audio_url || '',
          action_field_text: subItemData.action_field_text || '',
          action_field_owner: subItemData.action_field_owner || '',
          selectedThemes: [],
        })

        // Load existing themes
        const { data: themeLinks } = await supabase
          .from('sub_item_themes')
          .select('theme_id')
          .eq('sub_item_id', subItemId)

        if (themeLinks) {
          setFormData(prev => ({
            ...prev,
            selectedThemes: themeLinks.map(t => t.theme_id),
          }))
        }

        // Load existing media
        const { data: mediaData } = await supabase
          .from('media')
          .select('*')
          .eq('sub_item_id', subItemId)
          .order('"order"', { ascending: true })

        if (mediaData) setExistingMedia(mediaData)

        // Load existing poll
        const { data: pollData } = await supabase
          .from('polls')
          .select('*')
          .eq('sub_item_id', subItemId)
          .single()

        if (pollData) {
          setExistingPoll(pollData)
          setPollData({
            question: pollData.question,
            type: pollData.type,
            options: pollData.options,
          })
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Er ging iets mis bij het laden van de gegevens.')
    } finally {
      setIsLoading(false)
    }
  }

  const uploadMediaToStorage = async (file: File, type: 'image' | 'video' | 'audio'): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${type}s/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.day_id || !formData.title.trim()) {
      alert('Vul minimaal een dag en titel in')
      return
    }

    setIsSubmitting(true)
    try {
      // Update sub item
      const { error: updateError } = await supabase
        .from('sub_items')
        .update({
          day_id: formData.day_id,
          title: formData.title.trim(),
          text: formData.text.trim() || null,
          action_field_text: formData.action_field_text.trim() || null,
          action_field_owner: formData.action_field_owner.trim() || null,
        })
        .eq('id', subItemId)

      if (updateError) throw updateError

      // Update audio if new file uploaded
      if (audioFile) {
        try {
          const audioUrl = await uploadMediaToStorage(audioFile, 'audio')
          await supabase
            .from('sub_items')
            .update({ audio_url: audioUrl })
            .eq('id', subItemId)
        } catch (error) {
          console.error('Error uploading audio:', error)
        }
      }

      // Update themes
      // First remove all existing theme links
      await supabase
        .from('sub_item_themes')
        .delete()
        .eq('sub_item_id', subItemId)

      // Then add new ones
      if (formData.selectedThemes.length > 0) {
        const themeLinks = formData.selectedThemes.map(themeId => ({
          sub_item_id: subItemId,
          theme_id: themeId,
        }))

        const { error: themesError } = await supabase
          .from('sub_item_themes')
          .insert(themeLinks)

        if (themesError) throw themesError
      }

      // Upload new media files
      if (mediaFiles.length > 0) {
        for (let i = 0; i < mediaFiles.length; i++) {
          const mediaFile = mediaFiles[i]
          if (mediaFile.file) {
            try {
              const url = await uploadMediaToStorage(mediaFile.file, mediaFile.type)
              await supabase
                .from('media')
                .insert({
                  sub_item_id: subItemId,
                  type: mediaFile.type,
                  url,
                  filename: mediaFile.file.name,
                  "order": existingMedia.length + i,
                })
            } catch (error) {
              console.error('Error uploading media:', error)
            }
          }
        }
      }

      // Update poll if changed
      if (pollData && pollData.question) {
        if (existingPoll) {
          // Update existing poll
          const { error: pollError } = await supabase
            .from('polls')
            .update({
              question: pollData.question,
              type: pollData.type || 'multiple_choice',
              options: pollData.options || null,
            })
            .eq('id', existingPoll.id)

          if (pollError) {
            console.error('Error updating poll:', pollError)
          }
        } else {
          // Create new poll
          const { error: pollError } = await supabase
            .from('polls')
            .insert({
              sub_item_id: subItemId,
              question: pollData.question,
              type: pollData.type || 'multiple_choice',
              options: pollData.options || null,
            })

          if (pollError) {
            console.error('Error creating poll:', pollError)
          }
        }
      }

      router.push('/')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating sub item:', error)
      alert('Er ging iets mis bij het bijwerken. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Weet je zeker dat je deze media wilt verwijderen?')) return

    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId)

      if (error) throw error

      setExistingMedia(prev => prev.filter(m => m.id !== mediaId))
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('Er ging iets mis bij het verwijderen.')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar tijdlijn
        </Link>
        <h1 className="text-3xl font-bold">Bewerk Item</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Day Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Dag</label>
          <select
            value={formData.day_id}
            onChange={(e) => setFormData(prev => ({ ...prev, day_id: e.target.value }))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="">Selecteer een dag</option>
            {days.map((day) => (
              <option key={day.id} value={day.id}>
                {day.title}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium mb-2 block">Titel</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Titel van het item"
            required
          />
        </div>

        {/* Text */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tekst</label>
          <Textarea
            value={formData.text}
            onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Beschrijving..."
            rows={4}
          />
        </div>

        {/* Existing Media */}
        {existingMedia.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Bestaande Media</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {existingMedia.map((media) => (
                <div key={media.id} className="relative group">
                  {media.type === 'image' && (
                    <img
                      src={media.url}
                      alt={media.filename}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  {media.type === 'video' && (
                    <video
                      src={media.url}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteMedia(media.id)}
                  >
                    Verwijder
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Upload */}
        <div>
          <label className="text-sm font-medium mb-2 block">Nieuwe Foto&apos;s en Video&apos;s</label>
          <MediaUpload onFilesChange={setMediaFiles} />
        </div>

        {/* Audio Upload */}
        <div>
          <label className="text-sm font-medium mb-2 block">Audio</label>
          {formData.audio_url && (
            <div className="mb-2">
              <audio src={formData.audio_url} controls className="w-full" />
            </div>
          )}
          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setAudioFile(file)
            }}
          />
        </div>

        {/* Action Field */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Actieveld Tekst</label>
            <Textarea
              value={formData.action_field_text}
              onChange={(e) => setFormData(prev => ({ ...prev, action_field_text: e.target.value }))}
              placeholder="SMART-doel..."
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Actieveld Eigenaar</label>
            <Input
              value={formData.action_field_owner}
              onChange={(e) => setFormData(prev => ({ ...prev, action_field_owner: e.target.value }))}
              placeholder="Naam eigenaar"
            />
          </div>
        </div>

        {/* Themes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Thema&apos;s</label>
          <ThemeSelector
            themes={themes}
            selectedThemes={formData.selectedThemes}
            onThemesChange={(themeIds) => setFormData(prev => ({ ...prev, selectedThemes: themeIds }))}
          />
        </div>

        {/* Poll */}
        <div>
          <label className="text-sm font-medium mb-2 block">Poll</label>
          <PollForm
            subItemId={subItemId}
            onPollDataChange={setPollData}
            initialPoll={existingPoll || null}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Bezig...' : 'Opslaan'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
          >
            Annuleren
          </Button>
        </div>
      </form>
    </div>
  )
}

