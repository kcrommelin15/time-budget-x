import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  console.log('🚀 Activity categorization API called')
  
  // Add CORS headers for API requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers })
  }
  
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

    // First, create the time entry in Supabase
    const now = new Date().toISOString()
    const { data: timeEntry, error: entryError } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        category_id: category_id || null,
        start_time: start_time || now,
        end_time: end_time || null,
        activity_description: activity_description,
        ai_categorized: false,
        confidence_score: null,
        date: new Date().toISOString().split('T')[0], // Add required date field
        description: activity_description // Add description field if required
      })
      .select()
      .single()

    if (entryError) {
      console.error('Error creating time entry:', entryError)
      return NextResponse.json(
        { 
          error: 'Failed to create time entry', 
          details: entryError.message,
          code: entryError.code,
          hint: entryError.hint 
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

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}