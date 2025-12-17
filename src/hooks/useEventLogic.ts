import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { isToday, isThisWeek, isFuture } from "date-fns";
import type { Event, EventCategory } from "../types";
import api from "../lib/api";

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
    const current = events.find((e) => e.id === eventId);
    if (!current) return;

    const nextIsAttending = !current.isAttending;

    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id !== eventId) return event;

        const attendees = nextIsAttending
          ? event.attendees + 1
          : Math.max(0, event.attendees - 1);

        return {
          ...event,
          isAttending: nextIsAttending,
          attendees,
        };
      })
    );

    try {
      const res = await fetch(`/api/events/${eventId}/attend`, {
        method: nextIsAttending ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
         // check auth
        },
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Eroare la actualizarea participării.");
      }

      try {
        const data = await res.json();
        if (typeof data?.attendees === "number" || typeof data?.isAttending === "boolean") {
          setEvents((prevEvents) =>
            prevEvents.map((event) => {
              if (event.id !== eventId) return event;
              return {
                ...event,
                attendees:
                  typeof data.attendees === "number" ? data.attendees : event.attendees,
                isAttending:
                  typeof data.isAttending === "boolean" ? data.isAttending : event.isAttending,
              };
            })
          );
        }
      } catch {
        
      }

      if (nextIsAttending) {
        toast.success("Te-ai înscris cu succes!");
      } else {
        toast.success("Participare anulată");
      }
    } catch (err: any) {
      // Rollback 
      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.id !== eventId) return event;
          return {
            ...event,
            isAttending: current.isAttending,
            attendees: current.attendees,
          };
        })
      );

      toast.error(err?.message || "Nu am putut actualiza participarea.");
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
