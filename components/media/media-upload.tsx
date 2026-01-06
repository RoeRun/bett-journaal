'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Image, Video, Music, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface MediaFile {
  file: File
  preview?: string
  type: 'image' | 'video' | 'audio'
  uploading: boolean
  progress: number
  url?: string
  error?: string
}

interface MediaUploadProps {
  onFilesChange: (files: MediaFile[]) => void
  maxSize?: {
    image: number // in MB
    video: number
    audio: number
  }
}

export function MediaUpload({ onFilesChange, maxSize = { image: 10, video: 50, audio: 20 } }: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const validateFile = (file: File): { valid: boolean; type?: 'image' | 'video' | 'audio'; error?: string } => {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    const isAudio = file.type.startsWith('audio/')

    if (!isImage && !isVideo && !isAudio) {
      return { valid: false, error: 'Alleen afbeeldingen, video\'s en audio bestanden zijn toegestaan' }
    }

    const sizeMB = file.size / (1024 * 1024)
    let maxSizeMB = 0
    let type: 'image' | 'video' | 'audio' | undefined

    if (isImage) {
      type = 'image'
      maxSizeMB = maxSize.image
    } else if (isVideo) {
      type = 'video'
      maxSizeMB = maxSize.video
    } else if (isAudio) {
      type = 'audio'
      maxSizeMB = maxSize.audio
    }

    if (sizeMB > maxSizeMB) {
      return { valid: false, error: `Bestand is te groot. Maximum: ${maxSizeMB}MB` }
    }

    return { valid: true, type }
  }

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: MediaFile[] = []

    Array.from(fileList).forEach((file) => {
      const validation = validateFile(file)
      if (!validation.valid || !validation.type) {
        alert(validation.error || 'Ongeldig bestand')
        return
      }

      const mediaFile: MediaFile = {
        file,
        type: validation.type,
        uploading: false,
        progress: 0,
      }

      // Create preview for images
      if (validation.type === 'image') {
        const reader = new FileReader()
        reader.onload = (e) => {
          mediaFile.preview = e.target?.result as string
          setFiles(prev => {
            const updated = [...prev, mediaFile]
            onFilesChange(updated)
            return updated
          })
        }
        reader.readAsDataURL(file)
      } else {
        setFiles(prev => {
          const updated = [...prev, mediaFile]
          onFilesChange(updated)
          return updated
        })
      }
    })
  }, [maxSize, onFilesChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files)
    }
  }, [processFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }, [processFiles])

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index)
      onFilesChange(updated)
      return updated
    })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      case 'audio':
        return <Music className="h-5 w-5" />
      default:
        return <Upload className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50'
        }`}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Sleep bestanden hierheen of klik om te uploaden
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Foto&apos;s: max {maxSize.image}MB | Video&apos;s: max {maxSize.video}MB | Audio: max {maxSize.audio}MB
        </p>
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileInput}
          className="hidden"
          id="media-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('media-upload')?.click()}
        >
          Bestanden selecteren
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Geselecteerde bestanden ({files.length}):</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {files.map((mediaFile, index) => (
              <Card key={index} className="p-3 relative">
                {mediaFile.uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
                {mediaFile.error && (
                  <div className="absolute inset-0 bg-red-500/90 rounded-lg flex items-center justify-center z-10 p-2">
                    <p className="text-xs text-white text-center">{mediaFile.error}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  {getIcon(mediaFile.type)}
                  <span className="text-xs font-medium flex-1 truncate">
                    {mediaFile.file.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {mediaFile.preview && (
                  <img
                    src={mediaFile.preview}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded"
                  />
                )}
                {mediaFile.uploading && mediaFile.progress > 0 && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${mediaFile.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mediaFile.progress}%
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {(mediaFile.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}




