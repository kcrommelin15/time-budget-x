# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a time tracking application built with Next.js, React, and Supabase. It features AI-powered auto-categorization of activities using OpenAI and provides real-time time tracking with various productivity analytics.

## Key Features

- **AI Auto-Categorization**: Uses OpenAI to automatically categorize user activities based on text descriptions
- **Real-time Time Tracking**: Track activities with start/stop functionality and 10-second minimum validation
- **Category Management**: Organize activities into categories and subcategories  
- **Supabase Integration**: Uses Supabase for authentication, database, and Edge Functions
- **Responsive Design**: Works on both desktop and mobile devices

## Commands

### Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build the project
npm run build

# Start the production server
npm start

# Run linting
npm run lint
```

### Supabase Edge Functions

```bash
# Deploy edge functions (requires Supabase CLI)
supabase functions deploy categorize-activity

# Test edge function locally
supabase functions serve
```

## Environment Variables

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key for auto-categorization feature (used in Edge Functions)

## Architecture

This is a Next.js time tracking application with the following key components:

1. **Frontend (`app/` and `components/`)**:
   - Next.js 14 App Router for navigation and API routes
   - React components for UI including enhanced tracking widgets
   - Tailwind CSS for styling with shadcn/ui components

2. **Auto-Categorization System**:
   - **Supabase Edge Function** (`supabase/functions/categorize-activity/`): OpenAI integration for activity categorization
   - **API Route** (`app/api/supabase/functions/categorize-activity/route.ts`): Next.js proxy to Edge Function
   - **Enhanced Tracking Widget** (`components/enhanced-bottom-tracking-widget.tsx`): UI with AI suggestions

3. **Data Layer (`lib/`)**:
   - Supabase client configuration for authentication and database
   - Type definitions for categories, time entries, and API responses
   - Mock data for development and fallback scenarios

4. **Key Features Implementation**:
   - **10-second validation**: Prevents accidental short entries
   - **Enter-triggered categorization**: AI categorizes when user presses Enter
   - **Automatic selection**: Highest confidence category is auto-selected
   - **Error handling**: Throws errors instead of fallback categorization

## Auto-Categorization API

### Supabase Edge Function

**Location**: `supabase/functions/categorize-activity/index.ts`

**Purpose**: Uses OpenAI GPT-3.5-turbo to categorize activity descriptions

**Input**:
```typescript
{
  description: string;
  userId: string;
}
```

**Output**:
```typescript
{
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  confidence: number; // 0-1 scale
}
```

**Features**:
- Fetches user's custom categories from database
- Returns errors if categories unavailable or OpenAI fails
- Always auto-selects the highest confidence category
- Handles authentication via Supabase Auth

## Development Workflow

### Adding New Features

1. **Create new components** in `components/` following existing patterns
2. **Add API routes** in `app/api/` for backend functionality  
3. **Update types** in `lib/types.ts` for new data structures
4. **Test with mock data** using `lib/mock-data.ts`

### Working with Supabase Edge Functions

1. **Create function** in `supabase/functions/[function-name]/`
2. **Deploy function** with `supabase functions deploy [function-name]`
3. **Add API route** in `app/api/` to proxy to the Edge Function
4. **Update environment variables** as needed

### Auto-Categorization Integration

To integrate AI categorization in other components:

```typescript
const performAutoCategorization = async (description: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch('/api/supabase/functions/categorize-activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ description, userId: session.user.id }),
  })
  
  return response.json()
}
```
