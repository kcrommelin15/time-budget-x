"use client"

import { QueryClient } from "@tanstack/react-query"

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 2 * 60 * 1000, // 2 minutes
      // Cache time: how long data stays in cache after component unmounts
      gcTime: 5 * 60 * 1000, // 5 minutes
      // Retry failed requests
      retry: 1,
      // Refetch on window focus (good for keeping data fresh)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect to avoid unnecessary requests
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})
