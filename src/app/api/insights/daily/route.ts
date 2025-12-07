import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPersonalizationEngine } from '@/lib/ai/personalization-engine'
import type { MBTIType } from '@/types/database'

interface ProfileData {
  mbti_type: MBTIType | null
  full_name: string | null
}

/**
 * GET /api/insights/daily
 * Generate a daily insight for the authenticated user
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

    // Get user profile with MBTI type
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('mbti_type, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !data) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const profile = data as unknown as ProfileData
    const mbtiType = profile.mbti_type
    const fullName = profile.full_name

    if (!mbtiType) {
      return NextResponse.json(
        {
          error: 'MBTI type not set',
          message: 'Пожалуйста, пройдите MBTI-тестирование для получения персонализированных инсайтов.'
        },
        { status: 400 }
      )
    }

    // Generate daily insight
    const engine = getPersonalizationEngine()
    const insight = await engine.generateDailyInsight(
      user.id,
      mbtiType,
      fullName || undefined
    )

    return NextResponse.json({
      success: true,
      data: insight
    })
  } catch (error) {
    console.error('Error generating daily insight:', error)

    // Handle rate limit errors
    if (error instanceof Error && error.message.includes('лимит')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: error.message
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Произошла ошибка при генерации инсайта. Попробуйте позже.'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/insights/daily
 * Generate a custom insight with context
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { type, context, journalEntry } = body

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('mbti_type, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const profile = profileData as unknown as ProfileData

    if (!profile.mbti_type) {
      return NextResponse.json(
        {
          error: 'MBTI type not set',
          message: 'Пожалуйста, пройдите MBTI-тестирование.'
        },
        { status: 400 }
      )
    }

    const engine = getPersonalizationEngine()
    const mbtiType = profile.mbti_type

    // Handle different types of requests
    switch (type) {
      case 'tip': {
        if (!context) {
          return NextResponse.json(
            { error: 'Context is required for tips' },
            { status: 400 }
          )
        }

        const tip = await engine.generateTypeSpecificTip(
          user.id,
          mbtiType,
          context
        )

        return NextResponse.json({
          success: true,
          data: tip
        })
      }

      case 'journal': {
        if (!journalEntry) {
          return NextResponse.json(
            { error: 'Journal entry is required' },
            { status: 400 }
          )
        }

        const analysis = await engine.analyzeJournalEntry(
          user.id,
          mbtiType,
          journalEntry
        )

        return NextResponse.json({
          success: true,
          data: analysis
        })
      }

      case 'inferior': {
        const exercise = await engine.generateInferiorFunctionExercise(
          user.id,
          mbtiType
        )

        return NextResponse.json({
          success: true,
          data: exercise
        })
      }

      default: {
        // Default to daily insight
        const insight = await engine.generateDailyInsight(
          user.id,
          mbtiType,
          profile.full_name || undefined
        )

        return NextResponse.json({
          success: true,
          data: insight
        })
      }
    }
  } catch (error) {
    console.error('Error processing insight request:', error)

    // Handle rate limit errors
    if (error instanceof Error && error.message.includes('лимит')) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: error.message
        },
        { status: 429 }
      )
    }

    // Handle invalid topic errors
    if (error instanceof Error && error.message.includes('не связан')) {
      return NextResponse.json(
        {
          error: 'Invalid topic',
          message: error.message
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Произошла ошибка при генерации инсайта.'
      },
      { status: 500 }
    )
  }
}
