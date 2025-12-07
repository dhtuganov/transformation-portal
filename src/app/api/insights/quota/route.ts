import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPersonalizationEngine } from '@/lib/ai/personalization-engine'

/**
 * GET /api/insights/quota
 * Get remaining quota for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get remaining quota
    const engine = getPersonalizationEngine()
    const quota = await engine.getRemainingQuota(user.id)

    return NextResponse.json({
      success: true,
      data: {
        tokensRemaining: quota.tokensRemaining,
        requestsRemaining: quota.requestsRemaining,
        resetAt: quota.resetAt?.toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching quota:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Произошла ошибка при получении информации о квоте.'
      },
      { status: 500 }
    )
  }
}
