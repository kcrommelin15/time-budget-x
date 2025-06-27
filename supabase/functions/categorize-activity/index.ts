import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

interface CategoryRequest {
  description: string;
  userId: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Array<{
    name: string;
  }>;
}

interface CategorizationResult {
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  confidence: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabaseClient.auth.getUser(token);
    
    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { description }: CategoryRequest = await req.json();

    if (!description) {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's categories from database
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('categories')
      .select('id, name, subcategories')
      .eq('user_id', userData.user.id);

    if (categoriesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user categories' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!categories || categories.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No categories found for user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use OpenAI to categorize the activity
    const categorization = await categorizeWithOpenAI(description, categories);

    return new Response(
      JSON.stringify(categorization),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in categorize-activity function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function categorizeWithOpenAI(description: string, categories: Category[]): Promise<CategorizationResult> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Create prompt with user's categories and subcategories
  const categoryOptions = categories.map(cat => {
    const subcats = cat.subcategories?.map(sub => `    - ${sub.name}`).join('\n') || '';
    return `- ${cat.name} (id: ${cat.id})\n${subcats}`;
  }).join('\n');

  const prompt = `You are a time tracking categorization assistant. Given a description of an activity, categorize it into one of the user's predefined categories and subcategories.

Categories and subcategories available:
${categoryOptions}

Activity description: "${description}"

You must respond with a valid JSON object in this exact format:
{
  "categoryId": "string",
  "categoryName": "string", 
  "subcategory": "string (optional)",
  "confidence": number between 0 and 1
}

Choose the most appropriate category and subcategory. If no subcategory fits well, omit the subcategory field. Be confident in your choice but realistic about the confidence score.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that categorizes activities. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0]?.message?.content;

  if (!aiResponse) {
    throw new Error('Empty response from OpenAI');
  }

  // Parse the JSON response
  const result: CategorizationResult = JSON.parse(aiResponse);

  // Validate that the category exists
  const category = categories.find(cat => cat.id === result.categoryId);
  if (!category) {
    throw new Error(`Invalid category ID returned: ${result.categoryId}`);
  }

  return result;
}