'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Star, CheckCircle } from 'lucide-react'
import { awardArticleXP, updateStreak } from '@/lib/gamification/actions'

interface ReadingProgressProps {
  userId: string
  contentSlug: string
  contentTitle?: string
}

export function ReadingProgress({ userId, contentSlug, contentTitle }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [xpAwarded, setXpAwarded] = useState(false)
  const [showXPNotification, setShowXPNotification] = useState(false)
  const [xpAmount, setXpAmount] = useState(0)
  const hasAwardedXP = useRef(false)

  // Award XP when article is completed
  const handleCompletion = useCallback(async () => {
    if (hasAwardedXP.current) return
    hasAwardedXP.current = true

    try {
      // Award XP for reading the article
      const result = await awardArticleXP(userId, contentSlug, contentTitle)

      if (result.success) {
        setXpAwarded(true)
        setXpAmount(result.xpAwarded)
        setShowXPNotification(true)

        // Also update streak
        await updateStreak(userId)

        // Hide notification after 5 seconds
        setTimeout(() => {
          setShowXPNotification(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Error awarding XP:', error)
      hasAwardedXP.current = false // Allow retry on error
    }
  }, [userId, contentSlug, contentTitle])

  // Track scroll position
  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY

      // Calculate how far the user has scrolled
      const scrollableDistance = documentHeight - windowHeight
      const scrolledPercentage = scrollableDistance > 0
        ? (scrollTop / scrollableDistance) * 100
        : 100

      // Clamp between 0 and 100
      const clampedProgress = Math.min(Math.max(scrolledPercentage, 0), 100)

      setProgress(clampedProgress)

      // Mark as completed when reaching 90%
      if (clampedProgress >= 90 && !isCompleted) {
        setIsCompleted(true)
        handleCompletion()
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
  }, [isCompleted, handleCompletion])

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <Progress value={progress} className="h-1 rounded-none" />
        {isCompleted && (
          <div className="absolute top-2 right-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-600 font-medium">
              Завершено!
            </span>
          </div>
        )}
      </div>

      {/* XP Award Notification */}
      {showXPNotification && (
        <div className="fixed top-16 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-300 px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-lg"
          >
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            +{xpAmount} XP
          </Badge>
        </div>
      )}
    </>
  )
}
