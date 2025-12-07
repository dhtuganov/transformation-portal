'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Что-то пошло не так</h2>
      <p className="text-muted-foreground mb-6">{error.message}</p>
      <Button onClick={() => reset()}>Попробовать снова</Button>
    </div>
  )
}
