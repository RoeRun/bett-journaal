'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ReactionFormProps {
  subItemId: string
  onSuccess?: () => void
}

export function ReactionForm({ subItemId, onSuccess }: ReactionFormProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !role.trim() || !text.trim()) {
      alert('Vul alle velden in (naam, rol en reactie zijn verplicht)')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('reactions')
        .insert({
          sub_item_id: subItemId,
          name: name.trim(),
          role: role.trim(),
          text: text.trim(),
        })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Reset form
      setName('')
      setRole('')
      setText('')
      
      if (onSuccess) {
        onSuccess()
      } else {
        // Refresh page to show new reaction
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Error submitting reaction:', error)
      alert(`Er ging iets mis bij het plaatsen van je reactie: ${error.message || 'Onbekende fout'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-4 bg-white">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Naam <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jouw naam"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Rol <span className="text-red-500">*</span>
            </label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Bijv. Docent, Directeur"
              required
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">
            Reactie <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Schrijf je reactie..."
            rows={3}
            required
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Bezig...' : 'Reactie plaatsen'}
        </Button>
      </form>
    </Card>
  )
}




