'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, Loader2, X } from 'lucide-react'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl: string | null
  onAvatarChange: (url: string | null) => void
  userFullName: string
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  onAvatarChange,
  userFullName,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = () => {
    if (userFullName) {
      return userFullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return 'U'
  }

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 2 МБ')
      return
    }

    uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    setIsUploading(true)
    try {
      const supabase = createClient()

      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = fileName  // Bucket is already 'avatars', no need for subfolder

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').slice(-2).join('/')
        await supabase.storage.from('avatars').remove([oldPath])
      }

      setPreviewUrl(publicUrl)
      onAvatarChange(publicUrl)
      toast.success('Фото профиля обновлено')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Не удалось загрузить фото. Попробуйте еще раз.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return

    setIsUploading(true)
    try {
      const supabase = createClient()

      // Delete from storage
      const oldPath = currentAvatarUrl.split('/').slice(-2).join('/')
      const { error } = await supabase.storage.from('avatars').remove([oldPath])

      if (error) {
        throw error
      }

      setPreviewUrl(null)
      onAvatarChange(null)
      toast.success('Фото профиля удалено')
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error('Не удалось удалить фото. Попробуйте еще раз.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="w-24 h-24">
        <AvatarImage src={previewUrl || undefined} alt={userFullName} />
        <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Загрузить фото
            </>
          )}
        </Button>

        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            <X className="mr-2 h-4 w-4" />
            Удалить фото
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          JPG, PNG или GIF. Максимум 2 МБ.
        </p>
      </div>
    </div>
  )
}
