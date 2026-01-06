'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MediaUpload } from '@/components/media/media-upload'
import { ThemeSelector } from '@/components/admin/theme-selector'
import { PollForm } from '@/components/admin/poll-form'
import { Day, Theme, Poll } from '@/types/database'
import { Upload, Loader2 } from 'lucide-react'

interface MediaFile {
  file: File
  preview?: string
  type: 'image' | 'video' | 'audio'
  uploading: boolean
  progress: number
  url?: string
  error?: string
}

export default function CreateSubItemPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  
  const [days, setDays] = useState<Day[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [pollData, setPollData] = useState<Partial<Poll> | null>(null)
  
  const [formData, setFormData] = useState({
    day_id: '',
    title: '',
    text: '',
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
  }, [])

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
      if (daysData && daysData.length > 0) {
        setFormData(prev => ({ ...prev, day_id: daysData[0].id }))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const uploadMediaToStorage = async (file: File, type: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${type}/${fileName}`

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.day_id || !formData.title.trim()) {
      alert('Vul ten minste dag en titel in')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Niet ingelogd')

      // Create sub item
      const { data: subItem, error: subItemError } = await supabase
        .from('sub_items')
        .insert({
          day_id: formData.day_id,
          title: formData.title.trim(),
          text: formData.text.trim() || null,
          action_field_text: formData.action_field_text.trim() || null,
          action_field_owner: formData.action_field_owner.trim() || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (subItemError) throw subItemError
      if (!subItem) throw new Error('Sub item niet aangemaakt')

      // Upload media files
      const mediaPromises = mediaFiles.map(async (mediaFile, index) => {
        try {
          const url = await uploadMediaToStorage(mediaFile.file, mediaFile.type)
          return {
            sub_item_id: subItem.id,
            type: mediaFile.type,
            url,
            filename: mediaFile.file.name,
            order: index,
          }
        } catch (error) {
          console.error('Error uploading media:', error)
          throw error
        }
      })

      const mediaData = await Promise.all(mediaPromises)

      if (mediaData.length > 0) {
        const { error: mediaError } = await supabase
          .from('media')
          .insert(mediaData)

        if (mediaError) throw mediaError
      }

      // Upload audio if present
      if (audioFile) {
        try {
          const audioUrl = await uploadMediaToStorage(audioFile, 'audio')
          await supabase
            .from('sub_items')
            .update({ audio_url: audioUrl })
            .eq('id', subItem.id)
        } catch (error) {
          console.error('Error uploading audio:', error)
        }
      }

      // Link themes
      if (formData.selectedThemes.length > 0) {
        const themeLinks = formData.selectedThemes.map(themeId => ({
          sub_item_id: subItem.id,
          theme_id: themeId,
        }))

        const { error: themesError } = await supabase
          .from('sub_item_themes')
          .insert(themeLinks)

        if (themesError) throw themesError
      }

      // Create poll if provided
      if (pollData && pollData.question) {
        const { error: pollError } = await supabase
          .from('polls')
          .insert({
            sub_item_id: subItem.id,
            question: pollData.question,
            type: pollData.type || 'multiple_choice',
            options: pollData.options || null,
          })

        if (pollError) {
          console.error('Error creating poll:', pollError)
          // Don't fail the whole operation if poll creation fails
        }
      }

      router.push('/')
      router.refresh()
    } catch (error: any) {
      console.error('Error creating sub item:', error)
      alert('Er ging iets mis bij het aanmaken. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
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
      <Card>
        <CardHeader>
          <CardTitle>Nieuw Journaal Item Aanmaken</CardTitle>
          <CardDescription>
            Voeg een nieuwe bijdrage toe aan het Bett journaal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Day Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Dag <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.day_id}
                onChange={(e) => setFormData(prev => ({ ...prev, day_id: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <label className="text-sm font-medium mb-2 block">
                Titel <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Bijv. Workshop over VR in onderwijs"
                required
              />
            </div>

            {/* Text */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tekst</label>
              <Textarea
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Beschrijf je ervaring..."
                rows={4}
              />
            </div>

            {/* Media Upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">Foto&apos;s en Video&apos;s</label>
              <MediaUpload onFilesChange={setMediaFiles} />
            </div>

            {/* Audio Upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">Audio (optioneel)</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAudioFile(e.target.files[0])
                  }
                }}
                className="w-full"
              />
              {audioFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Geselecteerd: {audioFile.name}
                </p>
              )}
            </div>

            {/* Themes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Thema&apos;s</label>
              <ThemeSelector
                themes={themes}
                selectedThemes={formData.selectedThemes}
                onThemesChange={(themes) => setFormData(prev => ({ ...prev, selectedThemes: themes }))}
              />
            </div>

            {/* Action Field */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="text-sm font-medium block">Actieveld (SMART-doel)</label>
              <Textarea
                value={formData.action_field_text}
                onChange={(e) => setFormData(prev => ({ ...prev, action_field_text: e.target.value }))}
                placeholder="Beschrijf het actiepunt of SMART-doel..."
                rows={3}
              />
              <Input
                value={formData.action_field_owner}
                onChange={(e) => setFormData(prev => ({ ...prev, action_field_owner: e.target.value }))}
                placeholder="Eigenaar (wie gaat dit oppakken?)"
              />
            </div>

            {/* Poll (optional) */}
            <PollForm 
              subItemId={null} 
              onPollDataChange={setPollData}
            />

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Annuleren
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Bezig met opslaan...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Item Aanmaken
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}




