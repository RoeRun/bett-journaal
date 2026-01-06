'use client'

import { Theme } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface ThemeSelectorProps {
  themes: Theme[]
  selectedThemes: string[]
  onThemesChange: (themeIds: string[]) => void
}

export function ThemeSelector({ themes, selectedThemes, onThemesChange }: ThemeSelectorProps) {
  const [showNewTheme, setShowNewTheme] = useState(false)
  const [newThemeName, setNewThemeName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const supabase = createSupabaseClient()

  const toggleTheme = (themeId: string) => {
    if (selectedThemes.includes(themeId)) {
      onThemesChange(selectedThemes.filter(id => id !== themeId))
    } else {
      onThemesChange([...selectedThemes, themeId])
    }
  }

  const handleCreateTheme = async () => {
    if (!newThemeName.trim()) return

    setIsCreating(true)
    try {
      const { data, error } = await supabase
        .from('themes')
        .insert({
          name: newThemeName.trim(),
          color: '#3B82F6', // Default blue
          is_custom: true,
        })
        .select()
        .single()

      if (error) throw error

      // Add to selected themes
      onThemesChange([...selectedThemes, data.id])
      setNewThemeName('')
      setShowNewTheme(false)
    } catch (error: any) {
      console.error('Error creating theme:', error)
      alert('Er ging iets mis bij het aanmaken van het thema. Probeer het opnieuw.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {themes.map((theme) => (
          <Badge
            key={theme.id}
            variant={selectedThemes.includes(theme.id) ? 'default' : 'outline'}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: selectedThemes.includes(theme.id) ? theme.color : undefined,
              borderColor: theme.color,
              color: selectedThemes.includes(theme.id) ? 'white' : theme.color,
            }}
            onClick={() => toggleTheme(theme.id)}
          >
            {theme.name}
          </Badge>
        ))}
      </div>

      {showNewTheme ? (
        <div className="flex gap-2">
          <Input
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            placeholder="Nieuw thema naam"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreateTheme()
              }
              if (e.key === 'Escape') {
                setShowNewTheme(false)
                setNewThemeName('')
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleCreateTheme}
            disabled={isCreating || !newThemeName.trim()}
          >
            {isCreating ? '...' : 'Toevoegen'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowNewTheme(false)
              setNewThemeName('')
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowNewTheme(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuw thema toevoegen
        </Button>
      )}
    </div>
  )
}

