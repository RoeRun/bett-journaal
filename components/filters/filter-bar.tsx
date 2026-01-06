'use client'

import { Theme } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface FilterBarProps {
  themes: Theme[]
  selectedThemes: string[]
  onThemesChange: (themes: string[]) => void
}

export function FilterBar({ themes, selectedThemes, onThemesChange }: FilterBarProps) {
  const toggleTheme = (themeId: string) => {
    if (selectedThemes.includes(themeId)) {
      onThemesChange(selectedThemes.filter(id => id !== themeId))
    } else {
      onThemesChange([...selectedThemes, themeId])
    }
  }

  const clearFilters = () => {
    onThemesChange([])
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-2">
          Filter op thema:
        </span>
        {themes.map((theme) => (
          <Badge
            key={theme.id}
            variant={selectedThemes.includes(theme.id) ? 'default' : 'outline'}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: selectedThemes.includes(theme.id) ? theme.color : undefined,
              borderColor: theme.color,
            }}
            onClick={() => toggleTheme(theme.id)}
          >
            {theme.name}
          </Badge>
        ))}
        {selectedThemes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Wis filters
          </Button>
        )}
      </div>
    </div>
  )
}




