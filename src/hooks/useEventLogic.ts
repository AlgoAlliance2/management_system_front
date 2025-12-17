import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { isToday, isThisWeek, isFuture } from 'date-fns';
import { mockEvents } from '../data/mockData';
import type { Event, EventCategory } from '../types';
import api from '../lib/api';

export function useEventLogic(searchQuery: string) {
  // Data State
  const [events, setEvents] = useState<Event[]>(mockEvents);
  
  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"all" | "upcoming" | "today" | "this-week">("all");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showAttendingOnly, setShowAttendingOnly] = useState(false);

  // Event Handlers
  const handleToggleSave = async (eventId: string) => {
    try {
      // Optimistic update
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, isSaved: !event.isSaved } : event
        )
      );

      const event = events.find((e) => e.id === eventId);
      const isNowSaved = !event?.isSaved;

      // Send request to backend
      if (isNowSaved) {
        await api.post(`/events/${eventId}/save`);
        toast.success("Eveniment salvat");
      } else {
        await api.delete(`/events/${eventId}/save`);
        toast.success("Eveniment eliminat din salvate");
      }
    } catch (error) {
      // Revert optimistic update on error
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, isSaved: !event.isSaved } : event
        )
      );
      toast.error("Nu s-a putut actualiza starea evenimentului");
    }
  };

  const handleToggleAttend = (eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id === eventId) {
          const isAttending = !event.isAttending;
          const attendees = isAttending
            ? event.attendees + 1
            : event.attendees - 1;
          return { ...event, isAttending, attendees };
        }
        return event;
      })
    );
    const event = events.find((e) => e.id === eventId);
    if (event?.isAttending) {
      toast.success("Participare anulată");
    } else {
      toast.success("Te-ai înscris cu succes!");
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedTimeframe("all");
    setShowSavedOnly(false);
    setShowAttendingOnly(false);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory !== "all" ||
      selectedTimeframe !== "all" ||
      showSavedOnly ||
      showAttendingOnly ||
      searchQuery !== ""
    );
  }, [
    selectedCategory,
    selectedTimeframe,
    showSavedOnly,
    showAttendingOnly,
    searchQuery,
  ]);

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.organizer.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== "all" && event.category !== selectedCategory) {
        return false;
      }

      // Timeframe filter
      if (selectedTimeframe !== "all") {
        const eventDate = new Date(event.date);
        if (selectedTimeframe === "today" && !isToday(eventDate)) return false;
        if (selectedTimeframe === "this-week" && !isThisWeek(eventDate))
          return false;
        if (selectedTimeframe === "upcoming" && !isFuture(eventDate))
          return false;
      }

      // Saved filter
      if (showSavedOnly && !event.isSaved) return false;

      // Attending filter
      if (showAttendingOnly && !event.isAttending) return false;

      return true;
    });
  }, [
    events,
    searchQuery,
    selectedCategory,
    selectedTimeframe,
    showSavedOnly,
    showAttendingOnly,
  ]);

  return {
    events,
    setEvents,
    filteredEvents,
    selectedCategory,
    setSelectedCategory,
    selectedTimeframe,
    setSelectedTimeframe,
    showSavedOnly,
    setShowSavedOnly,
    showAttendingOnly,
    setShowAttendingOnly,
    handleToggleSave,
    handleToggleAttend,
    handleClearFilters,
    hasActiveFilters,
  };
}