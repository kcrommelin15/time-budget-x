import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function OPTIONS(request: NextRequest) {
  // Handle CORS preflight requests
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}

export async function POST(request: NextRequest) {
  console.log('🚀 Activity categorization API called')
  
  try {
    const { activity_description, category_id, start_time, end_time } = await request.json()
    console.log('📝 Activity description:', activity_description)
    
    if (!activity_description) {
      console.error('❌ No activity description provided')
      return NextResponse.json(
        { error: 'Activity description is required' },
        { status: 400 }
      )
    }

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

    // Helper function to format time for database (matches TimeEntriesService)
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

    // Helper function to get or create an "AI Pending" category
    const getOrCreateAIPendingCategory = async (userId: string) => {
      try {
        // First, try to find existing AI Pending category
        const { data: existingCategory, error: findError } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', userId)
          .eq('name', 'AI Pending')
          .single()

        if (existingCategory && !findError) {
          console.log('✅ Found existing AI Pending category:', existingCategory.id)
          return existingCategory.id
        }

        console.log('📝 Creating new AI Pending category for user:', userId)
        // If not found, create one
        const { data: newCategory, error: createError } = await supabase
          .from('categories')
          .insert({
            user_id: userId,
            name: 'AI Pending',
            color: '#9CA3AF', // Gray color for pending
            description: 'Temporary category for AI-categorized activities',
          })
          .select('id')
          .single()

        if (createError) {
          console.error('❌ Failed to create AI Pending category:', createError)
          throw new Error(`Could not create default category: ${createError.message}`)
        }

        console.log('✅ Created AI Pending category:', newCategory.id)
        return newCategory.id
      } catch (error) {
        console.error('❌ Error in getOrCreateAIPendingCategory:', error)
        
        // Fallback: try to get the first available category for this user
        console.log('🔄 Attempting fallback: getting first available category')
        const { data: fallbackCategories, error: fallbackError } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', userId)
          .limit(1)

        if (fallbackCategories && fallbackCategories.length > 0) {
          console.log('✅ Using fallback category:', fallbackCategories[0].id)
          return fallbackCategories[0].id
        }

        console.error('❌ No categories available for user, cannot proceed')
        throw new Error('No categories available and could not create AI Pending category')
      }
    }

    // Get or create default category if none provided
    const finalCategoryId = category_id || await getOrCreateAIPendingCategory(user.id)
    
    // First, create the time entry in Supabase
    const now = new Date()
    const dateString = now.toISOString().split('T')[0]
    const startTimeISO = start_time ? new Date(start_time).toISOString() : now.toISOString()
    const endTimeISO = end_time ? formatTimeForDB(end_time, dateString) : null
    
    console.log('📝 Creating time entry with:', {
      start_time: startTimeISO,
      end_time: endTimeISO,
      date: dateString,
      activity_description,
      finalCategoryId
    })
    
    const { data: timeEntry, error: entryError } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        category_id: finalCategoryId,
        start_time: startTimeISO,
        end_time: endTimeISO,
        activity_description: activity_description,
        ai_categorized: false,
        confidence_score: null,
        date: dateString,
        description: activity_description || '',
        status: 'in_progress', // Set status to in_progress since we don't have end time yet
        source: 'ai', // Mark as AI-initiated
        approved: true,
        subcategory: null,
        notes: null
      })
      .select()
      .single()

    if (entryError) {
      console.error('❌ Error creating time entry:', {
        error: entryError,
        insertData: {
          user_id: user.id,
          category_id: finalCategoryId,
          start_time: startTimeISO,
          end_time: endTimeISO,
          date: dateString,
          description: activity_description || '',
          activity_description: activity_description
        }
      })
      return NextResponse.json(
        { 
          error: 'Failed to create time entry', 
          details: entryError.message,
          code: entryError.code,
          hint: entryError.hint,
          debug: {
            message: 'Check server logs for detailed insert data',
            possibleCauses: [
              'Missing required fields',
              'Invalid timestamp format',
              'Database constraint violation'
            ]
          }
        },
        { status: 500 }
      )
    }

    console.log('✅ Time entry created:', timeEntry.id)

    // Get user's categories for AI context
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, sub_categories')
      .eq('user_id', user.id)

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Prepare payload for n8n webhook - now includes entry_id for updating
    const n8nPayload = {
      user_id: user.id,
      entry_id: timeEntry.id,
      activity_description: activity_description,
      timestamp: new Date().toISOString(),
      user_categories: categories?.map(cat => ({
        id: cat.id,
        category: cat.name,
        sub_categories: cat.sub_categories || []
      })) || []
    }

    // Call n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    console.log('🌐 n8n webhook URL:', n8nWebhookUrl ? `Set: ${n8nWebhookUrl}` : 'NOT SET')
    console.log('🌐 All env vars:', Object.keys(process.env).filter(key => key.includes('N8N')))
    
    if (!n8nWebhookUrl) {
      console.error('❌ N8N webhook URL not configured')
      return NextResponse.json(
        { error: 'N8N webhook URL not configured', debug: 'Environment variable N8N_WEBHOOK_URL is not set' },
        { status: 500 }
      )
    }

    console.log('📤 Sending to n8n:', JSON.stringify(n8nPayload, null, 2))

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    console.log('📥 n8n response status:', n8nResponse.status)

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('❌ N8N webhook failed:', errorText)
      return NextResponse.json(
        { error: 'AI categorization failed', details: errorText },
        { status: 500 }
      )
    }

    const n8nResult = await n8nResponse.json()
    console.log('✅ n8n result:', JSON.stringify(n8nResult, null, 2))
    
    // n8n should have updated the time entry directly in Supabase
    // Fetch the updated entry to confirm the categorization was applied
    const { data: updatedEntry, error: fetchError } = await supabase
      .from('time_entries')
      .select(`
        id, 
        activity_description, 
        confidence_score, 
        ai_categorized,
        categories (id, name)
      `)
      .eq('id', timeEntry.id)
      .single()

    if (fetchError) {
      console.error('Error fetching updated entry:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch updated entry' },
        { status: 500 }
      )
    }

    if (updatedEntry.ai_categorized) {
      // Successfully categorized by n8n
      return NextResponse.json({
        success: true,
        entry: {
          id: updatedEntry.id,
          activity_description: updatedEntry.activity_description,
          category: updatedEntry.categories?.name,
          confidence_score: updatedEntry.confidence_score,
          ai_categorized: true
        }
      })
    } else {
      // n8n workflow didn't update the entry properly
      console.error('❌ n8n workflow did not update entry - entry still not AI categorized')
      return NextResponse.json({
        error: 'n8n workflow did not categorize entry',
        debug: {
          entry_created: timeEntry.id,
          n8n_response: n8nResult,
          expected: 'Entry should be updated with ai_categorized: true'
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Activity categorization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}