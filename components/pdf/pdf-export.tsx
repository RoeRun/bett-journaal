'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, FileText } from 'lucide-react'
import { Day, Theme } from '@/types/database'
import jsPDF from 'jspdf'

interface PDFExportProps {
  days: Day[]
  themes: Theme[]
}

export function PDFExport({ days, themes }: PDFExportProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(days.map(d => d.id))
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [includeReactions, setIncludeReactions] = useState(true)
  const [includePolls, setIncludePolls] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const pdf = new jsPDF()
      let yPos = 20

      // Title
      pdf.setFontSize(20)
      pdf.text('Bett Journaal - Stichting Chrono', 20, yPos)
      yPos += 10

      pdf.setFontSize(12)
      pdf.text('Interactief visueel journaal van de Bett beurs', 20, yPos)
      yPos += 15

      // Filter info
      if (selectedThemes.length > 0) {
        const themeNames = themes
          .filter(t => selectedThemes.includes(t.id))
          .map(t => t.name)
          .join(', ')
        pdf.setFontSize(10)
        pdf.text(`Gefilterd op thema's: ${themeNames}`, 20, yPos)
        yPos += 10
      }

      // Days
      const filteredDays = days.filter(d => selectedDays.includes(d.id))
      
      for (const day of filteredDays) {
        // Check if we need a new page
        if (yPos > 250) {
          pdf.addPage()
          yPos = 20
        }

        // Day header
        pdf.setFontSize(16)
        pdf.text(day.title, 20, yPos)
        yPos += 10

        pdf.setFontSize(10)
        pdf.text(`Datum: ${day.date}`, 20, yPos)
        yPos += 8

        // Sub items would be loaded here and added to PDF
        // For now, just add placeholder
        pdf.setFontSize(12)
        pdf.text('(Sub-items worden hier getoond)', 25, yPos)
        yPos += 15

        // Add some spacing
        yPos += 5
      }

      // Save PDF
      pdf.save('bett-journaal.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Er ging iets mis bij het genereren van de PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        <h3 className="font-semibold">PDF Export</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Selecteer Dagen</label>
          <div className="space-y-2">
            {days.map((day) => (
              <label key={day.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDays([...selectedDays, day.id])
                    } else {
                      setSelectedDays(selectedDays.filter(id => id !== day.id))
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{day.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Filter op Thema's (optioneel)</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {themes.map((theme) => (
              <label key={theme.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedThemes.includes(theme.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedThemes([...selectedThemes, theme.id])
                    } else {
                      setSelectedThemes(selectedThemes.filter(id => id !== theme.id))
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm">{theme.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeReactions}
              onChange={(e) => setIncludeReactions(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Inclusief reacties</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includePolls}
              onChange={(e) => setIncludePolls(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Inclusief polls</span>
          </label>
        </div>

        <Button
          onClick={generatePDF}
          disabled={isGenerating || selectedDays.length === 0}
          className="w-full"
        >
          {isGenerating ? (
            'PDF genereren...'
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              PDF Downloaden
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

