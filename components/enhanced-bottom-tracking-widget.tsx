import React, { useState, useEffect } from 'react';

interface EnhancedBottomTrackingWidgetProps {
  validateActivity: (activity: string) => Promise<{ categoryId: string | null; subcategoryName: string | null }>;
  createTimeEntry: (entry: any) => Promise<any>;
}

const EnhancedBottomTrackingWidget: React.FC<EnhancedBottomTrackingWidgetProps> = ({ validateActivity, createTimeEntry }) => {
  const [currentActivity, setCurrentActivity] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      if (!startTime) {
        setStartTime(new Date());
      }
      intervalId = setInterval(() => {
        setEndTime(new Date());
      }, 1000);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  const handleStartStop = async () => {
    if (!isRunning) {
      setIsRunning(true);
      setErrorMessage(null);
    } else {
      setIsRunning(false);
      if (!startTime) {
        console.error("Start time is not set.");
        setErrorMessage("Start time is not set.");
        return;
      }

      if (!endTime) {
        console.error("End time is not set.");
        setErrorMessage("End time is not set.");
        return;
      }

      try {
        // Update validation call
        const validation = await validateActivity(currentActivity)

        if (!validation.categoryId) {
          setErrorMessage("Invalid activity. Please provide a valid activity.");
          return;
        }

        // Update time entry creation
        const newEntry = {
          category_id: validation.categoryId!,
          subcategory_name: validation.subcategoryName,
          start_time: startTime,
          end_time: endTime,
          date: new Date().toISOString().split('T')[0],
          description: currentActivity,
          source: "live_tracking"
        }

        await createTimeEntry(newEntry);
        setCurrentActivity('');
        setStartTime(null);
        setEndTime(null);
      } catch (error: any) {
        console.error("Error creating time entry:", error);
        setErrorMessage("Failed to create time entry.");
      }
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '20px' }}>
      <h3>Live Activity Tracking</h3>
      {errorMessage && <div style={{ color: 'red', marginBottom: '10px' }}>{errorMessage}</div>}
      <input
        type="text"
        placeholder="Enter activity description"
        value={currentActivity}
        onChange={(e) => setCurrentActivity(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
      />
      <button
        onClick={handleStartStop}
        style={{
          backgroundColor: isRunning ? 'red' : 'green',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {isRunning ? 'Stop Tracking' : 'Start Tracking'}
      </button>
      {startTime && endTime && (
        <p>
          Time elapsed: {Math.floor((endTime.getTime() - startTime.getTime()) / 1000)} seconds
        </p>
      )}
    </div>
  );
};

export default EnhancedBottomTrackingWidget;
