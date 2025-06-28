# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Next.js time budget tracking application that helps users manage and track their time allocation across different categories and subcategories. The app uses Supabase for authentication and data persistence, with TanStack Query for client-side data management.

## Commands

### Development

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev

# Build the project
pnpm build

# Start the production server
pnpm start

# Run linting
pnpm lint
```

## Environment Variables

Required environment variables for Supabase integration:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

## Architecture

The application follows a modern Next.js 14 App Router architecture with the following key components:

### Core Structure

1. **App Router (`app/`)**:
   - `page.tsx`: Main application entry point with screen navigation
   - `layout.tsx`: Root layout with theme provider and query client
   - `api/auth/`: Authentication API routes for Supabase

2. **Components (`components/`)**:
   - Screen components: `budget-screen.tsx`, `timeline-screen.tsx`, `insights-screen.tsx`, `settings-screen.tsx`
   - UI components organized in `ui/` subdirectory using Radix UI primitives
   - Modal components for auth, category management, and time entry editing

3. **Data Layer (`lib/`)**:
   - `supabase/`: Database services and client configuration
     - `data-service.ts`: Category and subcategory CRUD operations
     - `time-entries-service.ts`: Time entry management
     - `user-settings-service.ts`: User preferences and settings
   - `types.ts`: Core TypeScript interfaces for Category, Subcategory, TimeEntry
   - `query-client.ts` & `query-keys.ts`: TanStack Query configuration

4. **State Management (`hooks/`)**:
   - Custom hooks for data fetching with TanStack Query
   - `use-categories.ts`, `use-time-entries.ts`, `use-user-settings.ts`

### Data Model

The app manages three core entities:
- **Categories**: Main time budget categories with weekly budgets and goal directions
- **Subcategories**: Optional nested categories within main categories
- **Time Entries**: Individual time tracking records linked to categories

### Key Features

- Multi-screen navigation (Budget, Timeline, Insights, Settings)
- Drag-and-drop category reordering
- Real-time time tracking with start/stop functionality
- Goal direction settings ("more is better" vs "less is better")
- User authentication with email verification
- Responsive design for desktop and mobile

## Database Schema

The application uses Supabase with the following key tables:
- `categories`: User's time budget categories
- `subcategories`: Optional nested categories
- `time_entries`: Individual time tracking records
- User data is isolated by `user_id` from Supabase auth

## Authentication Flow

- Uses Supabase Auth with email/password and magic link options
- Email verification required for new accounts
- Auth state managed in main app component with real-time listeners
- Protected routes redirect to authentication modal when needed

## MCP Servers

### Figma Dev Mode MCP Rules
- The Figma Dev Mode MCP Server provides an assets endpoint which can serve image and SVG assets
- IMPORTANT: If the Figma Dev Mode MCP Server returns a localhost source for an image or an SVG, use that image or SVG source directly
- IMPORTANT: DO NOT import/add new icon packages, all the assets should be in the Figma payload
- IMPORTANT: do NOT use or create placeholders if a localhost source is provided
- IMPORTANT: Always use components from `components/ui/` when possible
- Prioritize Figma fidelity to match designs exactly
- Avoid hardcoded values, use design tokens from Figma where available
- Follow WCAG requirements for accessibility
- Add component documentation
- Place UI components in `components/ui/`; avoid inline styles unless truly necessary