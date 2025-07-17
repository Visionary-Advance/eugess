// utils/businessHours.js

export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getDayName = (dayIndex) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
};

export const isBusinessOpen = (businessHours) => {
  if (!businessHours || businessHours.length === 0) return null;
  
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
  
  const todayHours = businessHours.find(h => h.day_of_week === currentDay);
  
  if (!todayHours) return null;
  if (todayHours.is_closed) return false;
  if (todayHours.is_24_hours) return true;
  
  // Convert time strings to minutes
  const openTime = todayHours.open_time ? 
    parseInt(todayHours.open_time.split(':')[0]) * 60 + parseInt(todayHours.open_time.split(':')[1]) : 0;
  const closeTime = todayHours.close_time ? 
    parseInt(todayHours.close_time.split(':')[0]) * 60 + parseInt(todayHours.close_time.split(':')[1]) : 0;
  
  // Handle overnight hours (e.g., 10 PM to 2 AM)
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime <= closeTime;
  }
  
  return currentTime >= openTime && currentTime <= closeTime;
};

export const getNextOpenTime = (businessHours) => {
  if (!businessHours || businessHours.length === 0) return null;
  
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Check if opens later today
  const todayHours = businessHours.find(h => h.day_of_week === currentDay);
  if (todayHours && !todayHours.is_closed && !todayHours.is_24_hours) {
    const openTime = todayHours.open_time ? 
      parseInt(todayHours.open_time.split(':')[0]) * 60 + parseInt(todayHours.open_time.split(':')[1]) : 0;
    
    if (currentTime < openTime) {
      return {
        day: 'today',
        time: formatTime(todayHours.open_time)
      };
    }
  }
  
  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const nextDayHours = businessHours.find(h => h.day_of_week === nextDay);
    
    if (nextDayHours && !nextDayHours.is_closed) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return {
        day: i === 1 ? 'tomorrow' : dayNames[nextDay],
        time: nextDayHours.is_24_hours ? '24 hours' : formatTime(nextDayHours.open_time)
      };
    }
  }
  
  return null;
};

export const getCurrentDayHours = (businessHours) => {
  const currentDay = new Date().getDay();
  return businessHours.find(h => h.day_of_week === currentDay);
};

export const getBusinessStatus = (businessHours) => {
  const isOpen = isBusinessOpen(businessHours);
  const currentDayHours = getCurrentDayHours(businessHours);
  const nextOpenTime = getNextOpenTime(businessHours);

  if (isOpen === null) {
    return { status: 'unknown', message: 'Hours not available' };
  }

  if (isOpen) {
    if (currentDayHours?.is_24_hours) {
      return { status: 'open', message: 'Open 24 hours' };
    } else {
      return { 
        status: 'open', 
        message: `Open until ${formatTime(currentDayHours?.close_time)}` 
      };
    }
  } else {
    if (nextOpenTime) {
      return { 
        status: 'closed', 
        message: `Opens ${nextOpenTime.day} at ${nextOpenTime.time}` 
      };
    } else {
      return { status: 'closed', message: 'Closed' };
    }
  }
};

export const defaultBusinessHours = [
  { day_of_week: 0, is_closed: false, is_24_hours: false, open_time: '09:00', close_time: '17:00' }, // Sunday
  { day_of_week: 1, is_closed: false, is_24_hours: false, open_time: '09:00', close_time: '17:00' }, // Monday
  { day_of_week: 2, is_closed: false, is_24_hours: false, open_time: '09:00', close_time: '17:00' }, // Tuesday
  { day_of_week: 3, is_closed: false, is_24_hours: false, open_time: '09:00', close_time: '17:00' }, // Wednesday
  { day_of_week: 4, is_closed: false, is_24_hours: false, open_time: '09:00', close_time: '17:00' }, // Thursday
  { day_of_week: 5, is_closed: false, is_24_hours: false, open_time: '09:00', close_time: '17:00' }, // Friday
  { day_of_week: 6, is_closed: false, is_24_hours: false, open_time: '09:00', close_time: '17:00' }  // Saturday
];