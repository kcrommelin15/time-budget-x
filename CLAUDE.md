# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Time Budget Tracking application built with Next.js 14, React, TypeScript, and Supabase. It helps users track their time across different categories and provides insights into time usage patterns.

## Commands

### Development & Deployment

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to production (pushes to GitHub and triggers Vercel deployment)
git add .
git commit -m "Your commit message"
git push origin main

# Check deployment status
# Visit https://vercel.com/dashboard to monitor deployments
# Dev environment: https://dev.timebudget.ai
# Production: https://timebudget.ai
```

### Testing

Test the application at: **https://dev.timebudget.ai**

Never use localhost for testing - always use the cloud deployment for better performance and real environment testing.

## Environment Variables

Required environment variables for Supabase integration:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only)

## Deployment Workflow

1. **Make changes** to the codebase
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
3. **Vercel auto-deploys** from the main branch
4. **Test on dev.timebudget.ai** once deployment completes
5. **Domain switching**: If needed, update Vercel domain settings to point dev.timebudget.ai to the correct deployment

## Architecture

This project is built as a modern Next.js application with the following key components:

1. **App Router (`app/`)**:
   - Uses Next.js 14 App Router for routing and layouts
   - Main application entry point at `app/page.tsx`

2. **Components (`components/`)**:
   - Reusable UI components built with shadcn/ui
   - Custom components for time tracking, categories, and insights
   - Responsive design for both mobile and desktop

3. **Supabase Integration (`lib/supabase/`)**:
   - Database integration for user data, categories, and time entries
   - Real-time subscriptions for live data updates
   - Authentication handling

4. **Styling**:
   - Tailwind CSS for utility-first styling
   - Custom CSS variables for theming
   - shadcn/ui component library for consistent design

5. **State Management**:
   - TanStack Query (React Query) for server state
   - React hooks for local state management

## Development Workflow

1. **Create/modify components** in the `components/` directory
2. **Update styling** using Tailwind classes and CSS variables
3. **Test changes** by pushing to GitHub and checking dev.timebudget.ai
4. **Database changes** should be made through Supabase dashboard or migrations
5. **Environment variables** are managed through Vercel dashboard

When making UI changes:
- Follow the existing design system using shadcn/ui components
- Use consistent spacing, colors, and typography
- Ensure responsive design works on both mobile and desktop
- Test thoroughly on the cloud deployment at dev.timebudget.ai
