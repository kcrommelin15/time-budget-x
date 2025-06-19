// Centralized query keys for consistent caching
export const queryKeys = {
  // Categories
  categories: ["categories"] as const,
  categoriesForUser: (userId: string | undefined) => ["categories", userId] as const,

  // Time entries
  timeEntries: ["timeEntries"] as const,
  timeEntriesForDate: (userId: string | undefined, date: string) => ["timeEntries", userId, date] as const,
  timeEntriesForDateRange: (userId: string | undefined, startDate: string, endDate: string) =>
    ["timeEntries", userId, startDate, endDate] as const,

  // Tracking preferences
  trackingPreferences: ["trackingPreferences"] as const,
  trackingPreferencesForUser: (userId: string | undefined) => ["trackingPreferences", userId] as const,

  // User settings
  userSettings: ["userSettings"] as const,
  userSettingsForUser: (userId: string | undefined) => ["userSettings", userId] as const,
} as const
