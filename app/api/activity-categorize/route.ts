import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  console.log('🚀 Activity categorization API called')
  
  try {
    const { activity_description } = await request.json()
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

    // Get user's categories for AI context
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('name, sub_categories')
      .eq('user_id', user.id)

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Prepare payload for n8n webhook
    const n8nPayload = {
      user_id: user.id,
      activity_description: activity_description,
      timestamp: new Date().toISOString(),
      user_categories: categories?.map(cat => ({
        category: cat.name,
        sub_categories: cat.sub_categories || []
      })) || []
    }

    // Call n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    console.log('🌐 n8n webhook URL:', n8nWebhookUrl ? 'Set' : 'NOT SET')
    
    if (!n8nWebhookUrl) {
      console.error('❌ N8N webhook URL not configured')
      return NextResponse.json(
        { error: 'N8N webhook URL not configured' },
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
    
    // Expected n8n response format:
    // {
    //   "id": "entry-uuid",
    //   "user_id": "user-uuid", 
    //   "activity_description": "Working on quarterly report",
    //   "category": "Work",
    //   "sub_category": "Reports", 
    //   "confidence_score": 0.85,
    //   "timestamp": "2025-06-28T10:30:00Z"
    // }

    return NextResponse.json({
      success: true,
      categorization: {
        category: n8nResult.category,
        sub_category: n8nResult.sub_category,
        confidence_score: n8nResult.confidence_score,
        activity_description: activity_description
      },
      entry_id: n8nResult.id
    })

  } catch (error) {
    console.error('Activity categorization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}