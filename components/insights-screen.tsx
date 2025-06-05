"use client"

import { BarChart3, TrendingUp, Clock, Target } from "lucide-react"

export default function InsightsScreen() {
  return (
    <div className="p-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Insights
        </h1>
        <p className="text-gray-600 mt-2">Track your time patterns and productivity</p>
      </div>

      {/* Coming Soon Content */}
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
          <BarChart3 className="w-12 h-12 text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Insights Coming Soon</h2>
        <p className="text-gray-600 max-w-md mb-8">
          We're building powerful analytics to help you understand your time patterns, productivity trends, and goal
          achievement.
        </p>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
            <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Productivity Trends</h3>
            <p className="text-sm text-gray-600">Track your most productive hours and days</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
            <Target className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Goal Achievement</h3>
            <p className="text-sm text-gray-600">Monitor progress toward your time goals</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
            <Clock className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Time Distribution</h3>
            <p className="text-sm text-gray-600">Visualize how you spend your time</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
            <BarChart3 className="w-8 h-8 text-orange-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Weekly Reports</h3>
            <p className="text-sm text-gray-600">Get detailed weekly time summaries</p>
          </div>
        </div>
      </div>
    </div>
  )
}
