import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null }

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { quizId, published } = body as { quizId: string; published: boolean }

    if (!quizId || typeof published !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing quizId or published status' },
        { status: 400 }
      )
    }

    // Update quiz published status
     
    const { data, error } = await (supabase
      .from('quizzes') as any)
      .update({
        published,
        updated_at: new Date().toISOString(),
        ...(published ? { published_at: new Date().toISOString() } : {}),
      })
      .eq('id', quizId)
      .select()
      .single()

    if (error) {
      console.error('Error updating quiz:', error)
      return NextResponse.json(
        { error: 'Failed to update quiz' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in toggle-publish API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
