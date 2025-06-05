import type { Subcategory } from "./types"

export type GoalStatus = "excellent" | "good" | "warning" | "danger"

export interface SubcategoryInsight {
  status: GoalStatus
  message: string
  statusMessage: string
  encouragement?: string
}

export function calculateWeekProgress(): number {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const hour = now.getHours()
  const minute = now.getMinutes()

  // Calculate total minutes since start of week (assuming week starts Monday)
  const mondayStart = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday = 0
  const totalMinutesSinceMonday = mondayStart * 24 * 60 + hour * 60 + minute
  const totalMinutesInWeek = 7 * 24 * 60

  return Math.min(1, totalMinutesSinceMonday / totalMinutesInWeek)
}

// Update the formatTime function to optionally omit "00m"
export function formatTime(hours: number, omitZeroMinutes = false): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)

  if (omitZeroMinutes && m === 0) {
    return `${h}h`
  }

  return `${h}h ${m.toString().padStart(2, "0")}m`
}

// Update analyzeSubcategory to use the new formatTime function consistently
export function analyzeSubcategory(subcategory: Subcategory): SubcategoryInsight {
  const weekProgress = calculateWeekProgress()
  const projectedTotal = weekProgress > 0 ? subcategory.timeUsed / weekProgress : subcategory.timeUsed
  const budget = subcategory.budget
  const used = subcategory.timeUsed

  // Calculate percentage difference from target
  const percentageFromTarget = budget > 0 ? Math.abs(used - budget) / budget : 0
  const isOver = used > budget
  const isUnder = used < budget

  // New color logic - no grey, always use green/yellow/red based on proximity to target
  let status: GoalStatus

  if (percentageFromTarget <= 0.1) {
    // Within 10% of target
    status = "excellent"
  } else if (percentageFromTarget <= 0.3) {
    // 11%-30% away from target
    status = "warning"
  } else {
    // More than 30% away from target
    status = "danger"
  }

  // Override with goal direction logic if set
  if (subcategory.goalDirection === "more_is_better") {
    if (projectedTotal >= budget * 1.1) {
      status = "excellent"
    } else if (projectedTotal >= budget * 0.9) {
      status = "good"
    } else if (projectedTotal >= budget * 0.7) {
      status = "warning"
    } else {
      status = "danger"
    }
  } else if (subcategory.goalDirection === "less_is_better") {
    if (projectedTotal <= budget * 0.9) {
      status = "excellent"
    } else if (projectedTotal <= budget * 1.1) {
      status = "good"
    } else if (projectedTotal <= budget * 1.3) {
      status = "warning"
    } else {
      status = "danger"
    }
  }

  // Generate message based on current state
  let message: string
  const remaining = Math.max(0, budget - used)

  if (used > budget) {
    message = `${formatTime(used - budget)} over budget`
  } else if (projectedTotal > budget * 1.1) {
    message = `${formatTime(remaining)} left • trending ${formatTime(projectedTotal)}`
  } else if (projectedTotal > budget * 0.9) {
    message = `${formatTime(remaining)} left • on track`
  } else {
    message = `${formatTime(remaining)} left • under budget`
  }

  return {
    status,
    message,
    statusMessage: getStatusMessage(status, subcategory.goalDirection),
  }
}

function getStatusMessage(status: GoalStatus, goalDirection?: string): string {
  switch (status) {
    case "excellent":
      return goalDirection === "more_is_better"
        ? "Exceeding goal"
        : goalDirection === "less_is_better"
          ? "Well under limit"
          : "On target"
    case "good":
      return goalDirection === "more_is_better"
        ? "Good progress"
        : goalDirection === "less_is_better"
          ? "Under limit"
          : "Close to target"
    case "warning":
      return goalDirection === "more_is_better"
        ? "Behind goal"
        : goalDirection === "less_is_better"
          ? "Approaching limit"
          : "Off target"
    case "danger":
      return goalDirection === "more_is_better"
        ? "Far behind"
        : goalDirection === "less_is_better"
          ? "Over limit"
          : "Far from target"
    default:
      return "Unknown"
  }
}

export function getStatusColors(status: GoalStatus) {
  switch (status) {
    case "excellent":
      return {
        fill: "#10b981", // green-500
        background: "#d1fae5", // green-100
        text: "#065f46", // green-800
      }
    case "good":
      return {
        fill: "#10b981", // green-500
        background: "#d1fae5", // green-100
        text: "#065f46", // green-800
      }
    case "warning":
      return {
        fill: "#f59e0b", // amber-500
        background: "#fef3c7", // amber-100
        text: "#92400e", // amber-800
      }
    case "danger":
      return {
        fill: "#ef4444", // red-500
        background: "#fee2e2", // red-100
        text: "#991b1b", // red-800
      }
    default:
      return {
        fill: "#10b981", // Default to green
        background: "#d1fae5",
        text: "#065f46",
      }
  }
}

export function getGoalTypeIcon(goalType?: string): string {
  switch (goalType) {
    case "target":
      return "🎯"
    case "minimum":
      return "📊"
    case "maximum":
      return "⚠️"
    default:
      return "📈"
  }
}

export function getGoalTypeLabel(goalType?: string): string {
  switch (goalType) {
    case "target":
      return "Target"
    case "minimum":
      return "Minimum"
    case "maximum":
      return "Maximum"
    default:
      return "Goal"
  }
}

export function analyzeSubcategoryProgress(subcategory: Subcategory): SubcategoryInsight {
  // This is an alias for the existing analyzeSubcategory function
  return analyzeSubcategory(subcategory)
}

export function getStatusColor(status: GoalStatus): string {
  const colors = getStatusColors(status)
  return colors.fill
}
