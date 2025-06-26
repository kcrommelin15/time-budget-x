# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev`
- **Build**: `npm run build` 
- **Lint**: `npm run lint`
- **Production server**: `npm start`

## Architecture Overview

This is a Next.js 14 time budget tracking application with the following key architectural patterns:

### Data Layer
- **Database**: Supabase with PostgreSQL backend
- **Data Services**: Centralized in `lib/supabase/` with service classes:
  - `DataService`: Core CRUD operations for categories/subcategories
  - `TimeEntriesService`: Time entry management
  - `TrackingPreferencesService`: User preference management
- **State Management**: React Query for server state, React hooks for local state

### Component Architecture
- **Screen Components**: Main screens (BudgetScreen, TimelineScreen) manage overall state and layout
- **Modal Components**: Reusable modals for CRUD operations (AddCategoryModal, EditTimeEntryModal, etc.)
- **Card Components**: Display components for categories and time entries with drag-and-drop support
- **UI Components**: Radix UI-based components in `components/ui/`

### Key Data Models
- **Category**: Has `weeklyBudget`, `timeUsed`, `color`, `goalDirection`, and optional `subcategories`
- **Subcategory**: Has `budget`, `timeUsed`, `goalDirection`, and `goalConfig` for targets
- **TimeEntry**: Records with `categoryId`, `startTime`, `endTime`, `subcategory`, and tracking metadata

### State Management Patterns
- Custom hooks in `hooks/` provide React Query integration:
  - `useCategoriesQuery`: Category CRUD operations
  - `useTimeEntriesQuery`: Time entry management
  - `useTrackingPreferences`: User scheduling preferences
- Time calculations handle hour/minute conversions consistently (database stores minutes, UI shows hours)

### Authentication & Authorization
- Supabase Auth with row-level security
- User context passed through components as needed
- Auth callbacks handled in `app/auth/` routes

## Important Implementation Details

- Time values are stored as minutes in database but displayed as hours in UI
- Drag-and-drop implemented with `@hello-pangea/dnd` for category reordering
- Goal tracking supports "more_is_better" vs "less_is_better" directions
- Weekly budget allocation with remaining hours calculations
- Subcategories support both flexible and fixed budget allocations