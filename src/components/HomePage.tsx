import { useState, useEffect } from 'react';
import type { Event, EventCategory } from '../types';
import { EventCard } from './EventCard';
import { EventFilters } from './EventFilters';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';

interface HomePageProps {
  events: Event[];
  onToggleSave: (eventId: string) => void;
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
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 12;

export function HomePage({
  events,
  onToggleSave,
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
  isLoading = false,
}: HomePageProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Reset pagination when filters change (the 'events' array changes)
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [events, selectedCategory, selectedTimeframe, showSavedOnly, showAttendingOnly]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const visibleEvents = events.slice(0, visibleCount);
  const hasMoreEvents = visibleCount < events.length;


  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 md:p-12">
        <h1 className="mb-4">Bine ai venit la UniPlans</h1>
        <p className="text-xl mb-6 max-w-2xl">
          Descoperă și participă la evenimente universitare care îți îmbogățesc experiența academică
        </p>
        <div className="flex flex-wrap gap-4 text-blue-100">
          {/* <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-300" />
            <span>{events.length} evenimente active</span>
          </div> */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-300" />
            <span>Gratuit pentru studenți</span>
          </div>
          {/* <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-300" />
            <span>Înregistrare simplă</span>
          </div> */}
        </div>
      </div>

      {/* Filters */}
      <EventFilters
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={onTimeframeChange}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={onToggleSavedOnly}
        showAttendingOnly={showAttendingOnly}
        onToggleAttendingOnly={onToggleAttendingOnly}
        onClearFilters={onClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Events Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2>Evenimente disponibile</h2>
          <span className="text-sm text-gray-500">
            Afișăm {Math.min(visibleCount, events.length)} din {events.length}
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden bg-white">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onToggleSave={onToggleSave}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreEvents && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  className="min-w-[200px]"
                >
                  Vezi mai multe evenimente
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed">
            <div className="max-w-md mx-auto">
              <svg
                className="h-24 w-24 mx-auto text-gray-200 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nu am găsit evenimente</h3>
              <p className="text-gray-500 mb-6">
                {hasActiveFilters
                  ? 'Încearcă să ștergi filtrele pentru a vedea mai multe rezultate.'
                  : 'Nu există evenimente disponibile momentan.'}
              </p>
              {hasActiveFilters && (
                <Button onClick={onClearFilters} variant="outline">
                  Șterge toate filtrele
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
