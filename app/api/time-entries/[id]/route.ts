import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Helper function to format time for database
const formatTimeForDB = (timeString: string | null, dateString: string): string | null => {
  if (!timeString) return null
  // If it's already an ISO string, use it directly
  if (timeString.includes('T')) {
    return new Date(timeString).toISOString()
  }
  // Otherwise combine date and time
  const fullTimestamp = `${dateString}T${timeString}:00`
  return new Date(fullTimestamp).toISOString()
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('📝 Updating time entry:', params.id)
  
  try {
    const body = await request.json()
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Get the existing entry to preserve its date
    const { data: existingEntry, error: fetchError } = await supabase
      .from('time_entries')
      .select('date')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (body.end_time !== undefined) {
      updateData.end_time = formatTimeForDB(body.end_time, existingEntry.date)
      updateData.status = 'confirmed' // Mark as confirmed when end time is set
    }
    
    if (body.category_id !== undefined) {
      updateData.category_id = body.category_id
    }
    
    if (body.description !== undefined) {
      updateData.description = body.description
    }
    
    if (body.ai_categorized !== undefined) {
      updateData.ai_categorized = body.ai_categorized
    }
    
    if (body.confidence_score !== undefined) {
      updateData.confidence_score = body.confidence_score
    }

    console.log('📊 Update data:', updateData)

    // Update the time entry
    const { data: updatedEntry, error: updateError } = await supabase
      .from('time_entries')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select(`
        *,
        categories (id, name, color)
      `)
      .single()

    if (updateError) {
      console.error('Error updating time entry:', updateError)
      return NextResponse.json(
        { 
          error: 'Failed to update time entry', 
          details: updateError.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      entry: updatedEntry
    })

  } catch (error) {
    console.error('Time entry update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}