import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { EventCategory } from '../types';
import { Filter, X } from 'lucide-react';

interface EventFiltersProps {
  selectedCategory: EventCategory | 'all';
  onCategoryChange: (category: EventCategory | 'all') => void;
  selectedTimeframe: 'all' | 'upcoming' | 'today' | 'this-week';
  onTimeframeChange: (timeframe: 'all' | 'upcoming' | 'today' | 'this-week') => void;
  showSavedOnly: boolean;
  onToggleSavedOnly: () => void;
  showAttendingOnly: boolean;
  onToggleAttendingOnly: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const categories: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Toate evenimentele' },
  { value: 'conference', label: 'Conferințe' },
  { value: 'workshop', label: 'Workshop-uri' },
  { value: 'student-activity', label: 'Activități studențești' },
  { value: 'seminar', label: 'Seminarii' },
  { value: 'sports', label: 'Sport' },
  { value: 'cultural', label: 'Cultural' },
];

const timeframes = [
  { value: 'all', label: 'Toate perioadele' },
  { value: 'upcoming', label: 'Viitoare' },
  { value: 'today', label: 'Astăzi' },
  { value: 'this-week', label: 'Săptămâna aceasta' },
];

export function EventFilters({
  selectedCategory,
  onCategoryChange,
  selectedTimeframe,
  onTimeframeChange,
  showSavedOnly,
  onToggleSavedOnly,
  showAttendingOnly,
  onToggleAttendingOnly,
  onClearFilters,
  hasActiveFilters,
}: EventFiltersProps) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3>Filtrare</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Șterge filtrele
          </Button>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap gap-3">
        {/* Category Chips */}
        {categories.map((cat) => (
          <Badge
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            className={`cursor-pointer hover:bg-blue-50 ${
              selectedCategory === cat.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-700'
            }`}
            onClick={() => onCategoryChange(cat.value)}
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden space-y-3">
        <Select value={selectedCategory} onValueChange={(value) => onCategoryChange(value as EventCategory | 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="Selectează categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTimeframe} onValueChange={(value: any) => onTimeframeChange(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selectează perioada" />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map((tf) => (
              <SelectItem key={tf.value} value={tf.value}>
                {tf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Additional Filters */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
        <Select value={selectedTimeframe} onValueChange={(value: any) => onTimeframeChange(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selectează perioada" />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map((tf) => (
              <SelectItem key={tf.value} value={tf.value}>
                {tf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showSavedOnly ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleSavedOnly}
          className={showSavedOnly ? 'bg-blue-600' : ''}
        >
          Salvate
        </Button>

        <Button
          variant={showAttendingOnly ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleAttendingOnly}
          className={showAttendingOnly ? 'bg-blue-600' : ''}
        >
          Particip
        </Button>
      </div>
    </div>
  );
}
