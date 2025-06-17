"use client"

import type React from "react"
import { useState } from "react"
import { useTimeEntries } from "@/hooks/use-time-entries"

const TimelineScreen = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const { timeEntries, isLoading, error } = useTimeEntries(selectedDate)

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>Timeline</h1>
      <input type="date" value={selectedDate} onChange={handleDateChange} />

      {timeEntries && timeEntries.length > 0 ? (
        <ul>
          {timeEntries.map((entry) => (
            <li key={entry.id}>
              {entry.description} - {entry.startTime} - {entry.endTime}
            </li>
          ))}
        </ul>
      ) : (
        <p>No time entries for this date.</p>
      )}
    </div>
  )
}

export default TimelineScreen
