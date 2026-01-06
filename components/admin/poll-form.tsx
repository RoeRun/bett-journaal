'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Plus, X, BarChart3 } from 'lucide-react'
import { Poll } from '@/types/database'

interface PollFormProps {
  subItemId: string | null // null when creating new item
  onPollCreated?: (pollId: string) => void
  onPollDataChange?: (pollData: Partial<Poll> | null) => void
  initialPoll?: Poll | null
}

export function PollForm({ subItemId, onPollCreated, onPollDataChange, initialPoll }: PollFormProps) {
  const [showPollForm, setShowPollForm] = useState(!!initialPoll)
  const [pollType, setPollType] = useState<'multiple_choice' | 'open' | 'rating'>(
    initialPoll?.type || 'multiple_choice'
  )
  const [question, setQuestion] = useState(initialPoll?.question || '')
  const [options, setOptions] = useState<string[]>(
    initialPoll?.options && Array.isArray(initialPoll.options) 
      ? initialPoll.options 
      : ['', '']
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) {
      alert('Vul een vraag in')
      return
    }

    if (pollType === 'multiple_choice' && options.filter(o => o.trim()).length < 2) {
      alert('Voeg minimaal 2 opties toe')
      return
    }

    const pollData: Partial<Poll> = {
      question: question.trim(),
      type: pollType,
      options: pollType === 'multiple_choice' ? options.filter(o => o.trim()) : undefined,
    }

    // Store poll data for parent component
    if (onPollDataChange) {
      onPollDataChange(pollData)
    }

    // If subItemId exists, create poll immediately
    if (subItemId) {
      // This would be handled by the parent component
      if (onPollCreated) {
        onPollCreated('') // Placeholder
      }
    }

    // Reset form
    setQuestion('')
    setOptions(['', ''])
    setShowPollForm(false)
  }

  if (!showPollForm) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowPollForm(true)}
        className="w-full"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Poll toevoegen (optioneel)
      </Button>
    )
  }

  return (
    <Card className="p-4 bg-purple-50 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Poll Aanmaken
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setShowPollForm(false)
            setQuestion('')
            setOptions(['', ''])
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Vraag</Label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Stel je vraag..."
            rows={2}
            required
          />
        </div>

        <div>
          <Label>Type</Label>
          <RadioGroup value={pollType} onValueChange={(v) => setPollType(v as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiple_choice" id="mc" />
              <Label htmlFor="mc" className="cursor-pointer">Meerkeuze</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="open" id="open" />
              <Label htmlFor="open" className="cursor-pointer">Open vraag</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rating" id="rating" />
              <Label htmlFor="rating" className="cursor-pointer">Beoordeling (1-5)</Label>
            </div>
          </RadioGroup>
        </div>

        {pollType === 'multiple_choice' && (
          <div className="space-y-2">
            <Label>Opties</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Optie ${index + 1}`}
                  required={index < 2}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
            >
              <Plus className="h-4 w-4 mr-2" />
              Optie toevoegen
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowPollForm(false)
              setQuestion('')
              setOptions(['', ''])
            }}
          >
            Annuleren
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Bezig...' : 'Poll Opslaan'}
          </Button>
        </div>
      </form>
    </Card>
  )
}




