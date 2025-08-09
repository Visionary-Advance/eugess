'use client';

import { useState, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
];

// Simple hook to get current day hours for a business
export function useCurrentDayHours(businessId) {
  const [currentDayHours, setCurrentDayHours] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    async function fetchHours() {
      try {
        const response = await fetch(`/api/businesses/${businessId}/hours`);
        const data = await response.json();
        
        if (response.ok && Array.isArray(data)) {
          const today = new Date().getDay();
          const todayHours = data.find(h => h.day_of_week === today);
          setCurrentDayHours(todayHours);
        }
      } catch (error) {
        console.error('Error fetching hours:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHours();
  }, [businessId]);

  return { currentDayHours, loading };
}

// Helper function to format time
export function formatTime(timeString) {
  if (!timeString) return '';
  
  const timeParts = timeString.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return 'Invalid time';
  }
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

// Helper function to get hour display
export function getHourDisplay(hour) {
  if (!hour) return 'Hours not available';
  if (hour.is_closed) return 'Closed today';
  if (hour.is_24_hours) return 'Open 24 hours';
  if (hour.open_time && hour.close_time) {
    return `${formatTime(hour.open_time)} - ${formatTime(hour.close_time)}`;
  }
  return 'Hours not set';
}

export default function BusinessHoursDisplay({ businessId, compact = false, showTitle = true }) {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);
  const [currentStatus, setCurrentStatus] = useState(null);

  useEffect(() => {
    if (businessId) {
      fetchBusinessHours();
    }
  }, [businessId]);

  useEffect(() => {
    if (hours.length > 0) {
      updateCurrentStatus();
      // Update status every minute
      const interval = setInterval(updateCurrentStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [hours]);

  const fetchBusinessHours = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/hours`);
      const data = await response.json();
      
      if (response.ok) {
        // Create a complete week structure
        const weekHours = DAYS_OF_WEEK.map(day => {
          const existingHour = data.find(h => h.day_of_week === day.value);
          return existingHour || {
            day_of_week: day.value,
            day_name: day.label,
            open_time: null,
            close_time: null,
            is_closed: true,
            is_24_hours: false
          };
        });
        setHours(weekHours);
      }
    } catch (error) {
      console.error('Error fetching business hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentStatus = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
    
    const todayHours = hours.find(h => h.day_of_week === currentDay);
    
    if (!todayHours) {
      setCurrentStatus({ isOpen: false, message: 'Hours not available' });
      return;
    }

    if (todayHours.is_closed) {
      // Check if opens tomorrow
      const tomorrowDay = (currentDay + 1) % 7;
      const tomorrowHours = hours.find(h => h.day_of_week === tomorrowDay);
      
      if (tomorrowHours && !tomorrowHours.is_closed && tomorrowHours.open_time) {
        const openTime = formatTime(tomorrowHours.open_time);
        setCurrentStatus({ 
          isOpen: false, 
          message: `Closed today • Opens tomorrow at ${openTime}` 
        });
      } else {
        setCurrentStatus({ isOpen: false, message: 'Closed today' });
      }
      return;
    }

    if (todayHours.is_24_hours) {
      setCurrentStatus({ isOpen: true, message: 'Open 24 hours' });
      return;
    }

    if (todayHours.open_time && todayHours.close_time) {
      const openTime = timeToMinutes(todayHours.open_time);
      const closeTime = timeToMinutes(todayHours.close_time);
      
      if (currentTime >= openTime && currentTime < closeTime) {
        const closeTimeFormatted = formatTime(todayHours.close_time);
        setCurrentStatus({ 
          isOpen: true, 
          message: `Open • Closes at ${closeTimeFormatted}` 
        });
      } else if (currentTime < openTime) {
        const openTimeFormatted = formatTime(todayHours.open_time);
        setCurrentStatus({ 
          isOpen: false, 
          message: `Closed • Opens at ${openTimeFormatted}` 
        });
      } else {
        // After closing time - check if opens tomorrow
        const tomorrowDay = (currentDay + 1) % 7;
        const tomorrowHours = hours.find(h => h.day_of_week === tomorrowDay);
        
        if (tomorrowHours && !tomorrowHours.is_closed && tomorrowHours.open_time) {
          const openTime = formatTime(tomorrowHours.open_time);
          setCurrentStatus({ 
            isOpen: false, 
            message: `Closed • Opens tomorrow at ${openTime}` 
          });
        } else {
          setCurrentStatus({ isOpen: false, message: 'Closed' });
        }
      }
    } else {
      setCurrentStatus({ isOpen: false, message: 'Hours not available' });
    }
  };

  const timeToMinutes = (timeString) => {
    if (!timeString) return 0;
    
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return 0;
    }
    
    return hours * 60 + minutes;
  };

  const getCurrentDayHours = () => {
    const today = new Date().getDay();
    return hours.find(h => h.day_of_week === today);
  };

  const isCurrentDay = (dayOfWeek) => {
    return dayOfWeek === new Date().getDay();
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-48"></div>
      </div>
    );
  }

  if (hours.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        <Clock className="w-4 h-4 inline mr-1" />
        Hours not available
      </div>
    );
  }

  // Compact view - only show current status and today's hours
  if (compact && !expanded) {
    const todayHours = getCurrentDayHours();
    
    return (
      <div className="space-y-2">
        {showTitle && (
          <div className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 mr-1" />
            Hours
          </div>
        )}
        
        {/* Current Status */}
        {currentStatus && (
          <div className={`text-sm font-medium ${
            currentStatus.isOpen ? 'text-green-600' : 'text-red-600'
          }`}>
            {currentStatus.message}
          </div>
        )}
        
        {/* Today's Hours */}
        {todayHours && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Today:</span> {getHourDisplay(todayHours)}
          </div>
        )}
        
        {/* Expand button */}
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
        >
          View all hours <ChevronDown className="w-3 h-3 ml-1" />
        </button>
      </div>
    );
  }

  // Full view - show all hours
  return (
    <div className="space-y-3">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 mr-1" />
            Hours
          </div>
          {compact && (
            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
            >
              Show less <ChevronUp className="w-3 h-3 ml-1" />
            </button>
          )}
        </div>
      )}
      
      {/* Current Status */}
      {currentStatus && (
        <div className={`text-sm font-medium ${
          currentStatus.isOpen ? 'text-green-600' : 'text-red-600'
        }`}>
          {currentStatus.message}
        </div>
      )}
      
      {/* All Hours */}
      <div className="space-y-1">
        {DAYS_OF_WEEK.map(day => {
          const dayHours = hours.find(h => h.day_of_week === day.value) || {
            day_of_week: day.value,
            is_closed: true
          };
          
          return (
            <div 
              key={day.value} 
              className={`flex justify-between text-sm py-1 ${
                isCurrentDay(day.value) 
                  ? 'font-medium bg-blue-50 px-2 rounded' 
                  : 'text-gray-600'
              }`}
            >
              <span className={isCurrentDay(day.value) ? 'text-blue-700' : ''}>
                {day.label}
              </span>
              <span className={isCurrentDay(day.value) ? 'text-blue-700' : ''}>
                {getHourDisplay(dayHours)}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Special notes */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
        Hours may vary on holidays
      </div>
    </div>
  );
}