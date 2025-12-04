import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import type { Event } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ro } from 'date-fns/locale';
import { EventCard } from './EventCard';

interface CalendarViewProps {
  events: Event[];
  // onViewDetails removed - handled via Router
  onToggleSave: (eventId: string) => void;
}

export function CalendarView({ events, onToggleSave }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ro });
  const calendarEnd = endOfWeek(monthEnd, { locale: ro });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), day));
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-4">
          <h2>{format(currentMonth, 'MMMM yyyy', { locale: ro })}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'].map((day) => (
            <div key={day} className="text-center text-sm text-gray-600 py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const hasEvents = dayEvents.length > 0;

            return (
              <button
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={`
                  relative aspect-square p-2 rounded-lg border text-center transition-colors
                  ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'text-gray-900 bg-white'}
                  ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}
                  ${isToday && !isSelected ? 'border-blue-400' : ''}
                  ${hasEvents ? 'font-semibold' : ''}
                  hover:border-blue-400 hover:bg-blue-50
                `}
              >
                <span className="text-sm">{format(day, 'd')}</span>
                {hasEvents && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-600"
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      {selectedDate && (
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="mb-4">
            Evenimente pentru {format(selectedDate, 'dd MMMM yyyy', { locale: ro })}
          </h3>
          {selectedDayEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedDayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onToggleSave={onToggleSave}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nu există evenimente în această zi
            </div>
          )}
        </div>
      )}

      {/* Upcoming Events Preview */}
      {!selectedDate && (
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="mb-4">Evenimente viitoare în {format(currentMonth, 'MMMM', { locale: ro })}</h3>
          {events
            .filter(event => isSameMonth(new Date(event.date), currentMonth))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .length > 0 ? (
            <div className="space-y-4">
              {events
                .filter(event => isSameMonth(new Date(event.date), currentMonth))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onToggleSave={onToggleSave}
                    compact
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nu există evenimente în această lună
            </div>
          )}
        </div>
      )}
    </div>
  );
}