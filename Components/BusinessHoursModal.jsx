'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Plus, Trash2, Copy } from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
];

export default function BusinessHoursModal({ isOpen, onClose, businessId, onSave }) {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Initialize hours structure
  useEffect(() => {
    if (isOpen && businessId) {
      fetchBusinessHours();
    }
  }, [isOpen, businessId]);

  const fetchBusinessHours = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}/hours`);
      const data = await response.json();
      
      if (response.ok) {
        // Create a complete week structure
        const weekHours = DAYS_OF_WEEK.map(day => {
          const existingHour = data.find(h => h.day_of_week === day.value);
          return existingHour || {
            day_of_week: day.value,
            day_name: day.label,
            open_time: '09:00',
            close_time: '17:00',
            is_closed: false,
            is_24_hours: false
          };
        });
        setHours(weekHours);
      } else {
        throw new Error(data.error || 'Failed to fetch hours');
      }
    } catch (error) {
      console.error('Error fetching business hours:', error);
      setError('Failed to load business hours');
      // Initialize with default hours if fetch fails
      initializeDefaultHours();
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultHours = () => {
    const defaultHours = DAYS_OF_WEEK.map(day => ({
      day_of_week: day.value,
      day_name: day.label,
      open_time: day.value === 0 ? '' : '09:00', // Sunday closed by default
      close_time: day.value === 0 ? '' : '17:00',
      is_closed: day.value === 0, // Sunday closed by default
      is_24_hours: false
    }));
    setHours(defaultHours);
  };

  const updateHour = (dayIndex, field, value) => {
    setHours(prev => prev.map((hour, index) => {
      if (index !== dayIndex) return hour;
      
      const updated = { ...hour, [field]: value };
      
      // Handle special cases
      if (field === 'is_closed' && value) {
        updated.is_24_hours = false;
        updated.open_time = '';
        updated.close_time = '';
      } else if (field === 'is_24_hours' && value) {
        updated.is_closed = false;
        updated.open_time = '';
        updated.close_time = '';
      } else if (field === 'is_closed' && !value && !updated.is_24_hours) {
        // When unchecking closed, set default times if none exist
        if (!updated.open_time) updated.open_time = '09:00';
        if (!updated.close_time) updated.close_time = '17:00';
      }
      
      return updated;
    }));
  };

  const copyHours = (fromDayIndex, toDayIndex) => {
    const fromHour = hours[fromDayIndex];
    setHours(prev => prev.map((hour, index) => {
      if (index !== toDayIndex) return hour;
      
      return {
        ...hour,
        open_time: fromHour.open_time,
        close_time: fromHour.close_time,
        is_closed: fromHour.is_closed,
        is_24_hours: fromHour.is_24_hours
      };
    }));
  };

  const applyToAllDays = (sourceDay) => {
    const sourceHour = hours[sourceDay];
    setHours(prev => prev.map(hour => ({
      ...hour,
      open_time: sourceHour.open_time,
      close_time: sourceHour.close_time,
      is_closed: sourceHour.is_closed,
      is_24_hours: sourceHour.is_24_hours
    })));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      // Validate hours
      const validationErrors = validateHours();
      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/admin/businesses/${businessId}/hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours }),
      });

      const data = await response.json();
      
      if (response.ok) {
        onSave?.(data.hours);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to save hours');
      }
    } catch (error) {
      console.error('Error saving business hours:', error);
      setError(error.message || 'Failed to save business hours');
    } finally {
      setSaving(false);
    }
  };

  const validateHours = () => {
    const errors = [];
    
    hours.forEach((hour, index) => {
      if (!hour.is_closed && !hour.is_24_hours) {
        if (!hour.open_time || !hour.close_time) {
          errors.push(`${hour.day_name} needs both opening and closing times`);
        } else {
          // Validate time format
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(hour.open_time)) {
            errors.push(`${hour.day_name} opening time format is invalid`);
          }
          if (!timeRegex.test(hour.close_time)) {
            errors.push(`${hour.day_name} closing time format is invalid`);
          }
          
          // Check if closing time is after opening time
          if (hour.open_time && hour.close_time && hour.open_time >= hour.close_time) {
            errors.push(`${hour.day_name} closing time must be after opening time`);
          }
        }
      }
    });
    
    return errors;
  };

  const getHourDisplay = (hour) => {
    if (hour.is_closed) return 'Closed';
    if (hour.is_24_hours) return '24 Hours';
    if (hour.open_time && hour.close_time) {
      return `${formatTime(hour.open_time)} - ${formatTime(hour.close_time)}`;
    }
    return 'Not set';
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Business Hours
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading hours...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">Quick Setup Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Use 24-hour format (e.g., 09:00, 17:30)</li>
                  <li>Click "Copy to all days" to apply the same hours to every day</li>
                  <li>Use the copy button to duplicate hours from one day to another</li>
                </ul>
              </div>

              {/* Hours for each day */}
              <div className="space-y-3">
                {hours.map((hour, index) => (
                  <div key={hour.day_of_week} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900 w-20">
                          {hour.day_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getHourDisplay(hour)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => copyHours(index - 1, index)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title={`Copy from ${hours[index - 1]?.day_name}`}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => applyToAllDays(index)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                          title="Copy to all days"
                        >
                          Copy to all
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Status toggles */}
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hour.is_closed}
                            onChange={(e) => updateHour(index, 'is_closed', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Closed</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hour.is_24_hours}
                            onChange={(e) => updateHour(index, 'is_24_hours', e.target.checked)}
                            disabled={hour.is_closed}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">24 Hours</span>
                        </label>
                      </div>

                      {/* Opening time */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          value={hour.open_time || ''}
                          onChange={(e) => updateHour(index, 'open_time', e.target.value)}
                          disabled={hour.is_closed || hour.is_24_hours}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        />
                      </div>

                      {/* Closing time */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          value={hour.close_time || ''}
                          onChange={(e) => updateHour(index, 'close_time', e.target.value)}
                          disabled={hour.is_closed || hour.is_24_hours}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Hours'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}