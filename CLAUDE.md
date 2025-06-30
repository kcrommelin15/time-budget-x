# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Next.js time tracking application with AI categorization features. It uses Supabase for the database, n8n for AI workflows, and Vercel for deployment. The app allows users to track time spent on activities with automatic AI-powered categorization.

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

# Run linting (always run after making changes)
npm run lint

# Run type checking (always run after making changes)
npm run typecheck
```

## Environment Variables

- `N8N_WEBHOOK_URL`: Required webhook URL for n8n AI categorization workflows (e.g., `https://timebudget.app.n8n.cloud/webhook/time-budget-input`)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous API key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for server-side operations

## Architecture

This Next.js application follows a clean architecture with clear separation between frontend, backend APIs, and external services:

### Core Components

1. **Frontend (`components/`)**:
   - `enhanced-bottom-tracking-widget.tsx`: Main time tracking interface with AI categorization
   - React hooks for state management and real-time updates
   - Material UI-based components for consistent styling

2. **Backend APIs (`app/api/`)**:
   - `activity-categorize/route.ts`: Handles AI categorization requests and n8n integration
   - `time-entries/[id]/route.ts`: CRUD operations for time entries
   - Server-side authentication and validation

3. **Database Layer (`lib/supabase/`)**:
   - `time-entries-service.ts`: Service layer for time entry operations
   - `ai-categorization-service.ts`: Frontend service for AI categorization calls
   - Type-safe database operations with TypeScript

4. **External Integrations**:
   - **n8n Workflows**: AI categorization via webhook
   - **Supabase**: PostgreSQL database with real-time subscriptions
   - **Vercel**: Deployment and environment management

### Data Flow

```
Frontend Widget → Backend API → n8n Webhook → Supabase Database
     ↑                                              ↓
     ←────────── Real-time Updates ←─────────────────
```

## n8n Integration Patterns

### Best Practices for n8n Workflows

1. **Use Backend-Mediated Pattern**: Always call n8n from backend APIs, never directly from frontend
   - ✅ `Frontend → Backend API → n8n webhook → Database`
   - ❌ `Frontend → n8n webhook → Database`

2. **Environment Variables**: Configure n8n webhook URLs in Vercel environment variables
   ```bash
   N8N_WEBHOOK_URL=https://timebudget.app.n8n.cloud/webhook/time-budget-input
   ```

3. **Database Constraints**: Always handle NOT NULL database constraints
   - Create entries with all required fields populated
   - Use fallback values (e.g., "AI Pending" category)
   - Set `end_time = start_time` initially if end_time is required

4. **Error Handling**: Implement comprehensive fallback mechanisms
   - Create default categories if categorization fails
   - Graceful degradation when n8n is unavailable
   - User-friendly error messages

5. **Payload Structure**: Send complete context to n8n workflows
   ```json
   {
     "user_id": "user-uuid",
     "entry_id": "entry-uuid",
     "activity_description": "user input",
     "user_categories": [{"id": "cat-id", "category": "Work", "sub_categories": []}],
     "timestamp": "2024-01-01T00:00:00Z"
   }
   ```

### Common n8n Integration Pitfalls

1. **Database Constraint Violations**: 
   - Always check database schema for NOT NULL constraints
   - Use migrations to understand required fields
   - Test with minimal viable data first

2. **Authentication Issues**:
   - Bypass SSO protection for API routes using middleware
   - Use service role keys for server-side database operations

3. **CORS Problems**:
   - Add proper OPTIONS handlers for preflight requests
   - Configure CORS headers in API routes

4. **Environment Variable Issues**:
   - Verify environment variables are set in Vercel dashboard
   - Use consistent naming patterns
   - Log environment variable presence (not values) for debugging

## Development Workflow

### Adding New AI Features

1. **Design the Data Flow**:
   - Plan the complete user journey
   - Identify database schema requirements
   - Design the n8n workflow integration points

2. **Database First**:
   - Create necessary migrations
   - Add required fields with proper constraints
   - Test database operations in isolation

3. **Backend API**:
   - Create API routes with comprehensive error handling
   - Implement fallback mechanisms
   - Add detailed logging for debugging

4. **Frontend Integration**:
   - Build UI components with loading states
   - Handle errors gracefully
   - Provide user feedback throughout the process

5. **Testing & Deployment**:
   - Test with minimal data first
   - Verify all constraints are satisfied
   - Run linting and type checking before deployment

### Debugging n8n Integrations

1. **Check Environment Variables**: Verify webhook URLs are set correctly
2. **Database Logs**: Check Supabase logs for constraint violations
3. **API Logs**: Review Vercel function logs for request/response details
4. **n8n Logs**: Check n8n workflow execution logs
5. **Network Tab**: Verify API calls are reaching endpoints correctly
