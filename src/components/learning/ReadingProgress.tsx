'use client'

import { useEffect, useState, useCallback } from 'react'
import { Progress } from '@/components/ui/progress'

interface ReadingProgressProps {
  userId: string
  contentSlug: string
}

export function ReadingProgress({ userId, contentSlug }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // NOTE: Database integration is commented out for now as it requires UUID content_id
  // In a production environment, you would:
  // 1. Either create a migration to allow content_id to be TEXT (slug)
  // 2. Or ensure all MDX files are synced to the database on build
  // 3. Or use localStorage for tracking progress without DB

  // For now, we track progress in component state only
  // This will reset on page reload, but demonstrates the UI functionality

  // Track scroll position
  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY

      // Calculate how far the user has scrolled
      const scrollableDistance = documentHeight - windowHeight
      const scrolledPercentage = (scrollTop / scrollableDistance) * 100

      // Clamp between 0 and 100
      const clampedProgress = Math.min(Math.max(scrolledPercentage, 0), 100)

      setProgress(clampedProgress)

      // Mark as completed when reaching 90%
      if (clampedProgress >= 90 && !isCompleted) {
        setIsCompleted(true)
      }

      return clampedProgress
    }

    // Calculate initial progress
    calculateProgress()

    const handleScroll = () => {
      calculateProgress()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isCompleted])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <Progress value={progress} className="h-1 rounded-none" />
      {isCompleted && (
        <div className="absolute top-2 right-4 text-xs text-green-600 font-medium">
          Завершено!
        </div>
      )}
    </div>
  )
}
