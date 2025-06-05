"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Clock, Target, Award, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EnhancedInsightsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState("week")

  // Mock data for insights
  const weeklyData = {
    totalHours: 42,
    budgetedHours: 40,
    efficiency: 95,
    topCategory: "Work",
    streak: 5,
  }

  const categoryBreakdown = [
    { name: "Work", hours: 22, budget: 40, color: "#2B93FA", percentage: 55 },
    { name: "Personal", hours: 8, budget: 7, color: "#13B078", percentage: 114 },
    { name: "Exercise", hours: 4, budget: 4, color: "#EB8C5E", percentage: 100 },
    { name: "Learning", hours: 8, budget: 4, color: "#6C63FF", percentage: 200 },
  ]

  const weeklyTrend = [
    { day: "Mon", hours: 8.5 },
    { day: "Tue", hours: 7.2 },
    { day: "Wed", hours: 9.1 },
    { day: "Thu", hours: 8.8 },
    { day: "Fri", hours: 8.4 },
    { day: "Sat", hours: 0 },
    { day: "Sun", hours: 0 },
  ]

  return (
    <div className="p-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Insights
          </h1>
          <p className="text-gray-600 mt-2">Track your time patterns and productivity</p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-white rounded-2xl p-1 shadow-lg border border-gray-200">
          {["week", "month", "year"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={`rounded-xl capitalize ${
                selectedPeriod === period ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : ""
              }`}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Hours</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{weeklyData.totalHours}h</div>
          <div className="text-xs text-blue-600">of {weeklyData.budgetedHours}h budgeted</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-800">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{weeklyData.efficiency}%</div>
          <div className="text-xs text-green-600">budget utilization</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Top Category</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{weeklyData.topCategory}</div>
          <div className="text-xs text-purple-600">most tracked</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Streak</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{weeklyData.streak}</div>
          <div className="text-xs text-orange-600">days tracking</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Category Breakdown
        </h3>
        <div className="space-y-4">
          {categoryBreakdown.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{category.hours}h</span>
                  <span className="text-gray-500 text-sm"> / {category.budget}h</span>
                  <span
                    className={`ml-2 text-xs font-medium ${
                      category.percentage > 100
                        ? "text-red-600"
                        : category.percentage > 80
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {category.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: category.color,
                    width: `${Math.min(100, category.percentage)}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Weekly Trend
        </h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {weeklyTrend.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                style={{ height: `${(day.hours / 10) * 100}%`, minHeight: day.hours > 0 ? "8px" : "2px" }}
              ></div>
              <div className="mt-2 text-xs font-medium text-gray-600">{day.day}</div>
              <div className="text-xs text-gray-500">{day.hours}h</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
