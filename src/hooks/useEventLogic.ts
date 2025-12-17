import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { isToday, isThisWeek, isFuture } from 'date-fns';
// import { mockEvents } from '../data/mockData'; // Just in case :)
import type { Event, EventCategory } from '../types';
import api from '../lib/api';

export function useEventLogic(searchQuery: string) {

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"all" | "upcoming" | "today" | "this-week">("all");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showAttendingOnly, setShowAttendingOnly] = useState(false);

 
  const fetchEvents = useCallback(async (isBackgroundUpdate = false) => {
    try {
      if (!isBackgroundUpdate) setIsLoading(true);
      
      
      const response = await api.get('/events'); 
      setEvents(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      
      if (events.length === 0) {
        setError("Nu s-au putut încărca evenimentele.");
      }
    } finally {
      if (!isBackgroundUpdate) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    
    fetchEvents();

    // Poll every 5 seconds to check for new events
    const intervalId = setInterval(() => {
      fetchEvents(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchEvents]);

  
  
  const handleToggleSave = async (eventId: string) => {
    
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, isSaved: !event.isSaved } : event
      )
    );

    try {
      
      await api.post(`/events/${eventId}/save`);
      
      
      const updatedEvent = events.find(e => e.id === eventId);
      
      if (!updatedEvent?.isSaved) {
        toast.success("Eveniment salvat");
      } else {
        toast.success("Eveniment eliminat din salvate");
      }
    } catch (error) {
      
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, isSaved: !event.isSaved } : event
        )
      );
      toast.error("Nu s-a putut actualiza starea evenimentului");
    }
  };

  const handleToggleAttend = async (eventId: string) => {
    
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

    try {
      
      const response = await api.post(`/events/${eventId}/attend`);
      
      if (response.data.isAttending) {
        toast.success("Te-ai înscris cu succes!");
      } else {
        toast.success("Participare anulată");
      }
    } catch (error) {
       
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
      toast.error("Nu s-a putut actualiza participarea");
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

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        
        const matchesSearch =
          event.title?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.organizer?.toLowerCase().includes(query);
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
    isLoading, 
    error,
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
    refetch: () => fetchEvents(false) // Helper to manually refresh
  };
}