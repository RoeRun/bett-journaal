'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Poll, PollResponse } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BarChart3 } from 'lucide-react'

interface PollDisplayProps {
  subItemId: string
}

export function PollDisplay({ subItemId }: PollDisplayProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [responses, setResponses] = useState<PollResponse[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadPoll()
  }, [subItemId])

  const loadPoll = async () => {
    try {
      const { data: pollData } = await supabase
        .from('polls')
        .select('*')
        .eq('sub_item_id', subItemId)
        .single()

      if (pollData) {
        setPoll(pollData)
        loadResponses(pollData.id)
      }
    } catch (error) {
      // No poll found, that's okay
    }
  }

  const loadResponses = async (pollId: string) => {
    try {
      const { data } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('poll_id', pollId)

      if (data) setResponses(data)
    } catch (error) {
      console.error('Error loading responses:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!poll || !name.trim() || !role.trim() || !selectedAnswer) {
      alert('Vul alle velden in')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('poll_responses')
        .insert({
          poll_id: poll.id,
          name: name.trim(),
          role: role.trim(),
          answer: selectedAnswer,
        })

      if (error) throw error

      setName('')
      setRole('')
      setSelectedAnswer('')
      loadResponses(poll.id)
      setShowResults(true)
    } catch (error: any) {
      console.error('Error submitting response:', error)
      alert('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!poll) return null

  const calculateResults = () => {
    if (poll.type === 'multiple_choice' && poll.options) {
      const counts: Record<string, number> = {}
      poll.options.forEach(opt => counts[opt] = 0)
      responses.forEach(resp => {
        if (typeof resp.answer === 'string' && counts[resp.answer] !== undefined) {
          counts[resp.answer]++
        }
      })
      return counts
    }
    return null
  }

  const results = calculateResults()
  const totalResponses = responses.length

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-5 w-5 text-purple-600" />
        <h4 className="font-semibold text-purple-900">Poll</h4>
      </div>

      <p className="font-medium mb-4 text-gray-800">{poll.question}</p>

      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {poll.type === 'multiple_choice' && poll.options && (
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {poll.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {poll.type === 'open' && (
            <Textarea
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Jouw antwoord..."
              rows={3}
              required
            />
          )}

          {poll.type === 'rating' && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  type="button"
                  variant={selectedAnswer === rating.toString() ? 'default' : 'outline'}
                  onClick={() => setSelectedAnswer(rating.toString())}
                >
                  {rating}
                </Button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jouw naam"
              required
            />
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Jouw rol"
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Bezig...' : 'Stem'}
          </Button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {totalResponses} {totalResponses === 1 ? 'stem' : 'stemmen'}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResults(false)}
            >
              Opnieuw stemmen
            </Button>
          </div>

          {results && (
            <div className="space-y-2">
              {Object.entries(results).map(([option, count]) => {
                const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0
                return (
                  <div key={option} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{option}</span>
                      <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

