import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { isToday, isThisWeek, isFuture } from "date-fns";
import type { Event as AppEvent, EventCategory, UserRole } from "../types";
import { eventsApi } from "../lib/api";

export function useEventLogic(searchQuery: string, enabled: boolean = true, userRole?: UserRole) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"all" | "upcoming" | "today" | "this-week">("upcoming");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showAttendingOnly, setShowAttendingOnly] = useState(false);

 
  const fetchEvents = useCallback(async (isBackgroundUpdate = false) => {
    if (!enabled) return;
    try {
      if (!isBackgroundUpdate) setIsLoading(true);
      
      let data;
      // If Admin or Organizer, fetch ALL events (to see pending/rejected)
      if (userRole === 'admin' || userRole === 'organizer') {
        data = await eventsApi.getAll();
      } else {
        data = await eventsApi.getApproved();
      }
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      if (!isBackgroundUpdate) setIsLoading(false);
    }
  }, [enabled, userRole]); // Added userRole dependency

  // Initial Load Only
  useEffect(() => {
    if (!enabled) return;
    fetchEvents();
  }, [fetchEvents, enabled]);

  
  
  const handleToggleSave = async (eventId: string) => {
    const previousEvents = [...events];
    const eventToUpdate = events.find(e => e.id === eventId);
    if (!eventToUpdate) return;
    
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, isSaved: !e.isSaved } : e
      )
    );
    // Toast immediate feedback
    toast.success(eventToUpdate.isSaved ? "Eveniment eliminat din salvate" : "Eveniment salvat");

    try {
      await eventsApi.toggleSave(eventId);
    } catch (error) {
      // 4. Rollback on error
      setEvents(previousEvents);
      toast.error("Nu s-a putut actualiza starea evenimentului");
    }
  };

  const handleToggleAttend = async (eventId: string) => {
    const previousEvents = [...events];
    const eventToUpdate = events.find((e) => e.id === eventId);
    if (!eventToUpdate) return;

    const nextIsAttending = !eventToUpdate.isAttending;

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          isAttending: nextIsAttending,
          // Optimistically guess the count (API will correct us if wrong)
          attendees: nextIsAttending ? e.attendees + 1 : Math.max(0, e.attendees - 1),
        };
      })
    );

    if (nextIsAttending) {
      toast.success("Te-ai înscris cu succes!");
    } else {
      toast.success("Participare anulată");
    }

    try {
      const data = await eventsApi.toggleAttend(eventId);
      // 4. Update with REAL server data (source of truth)
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== eventId) return e;
          return {
            ...e,
            isAttending: data.isAttending,
            attendees: data.attendees,
          };
        })
      );
    } catch (error: any) {
      // 5. Rollback on error
      setEvents(previousEvents);
      toast.error(error?.response?.data?.message || "Nu am putut actualiza participarea.");
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
      if (event.status !== 'approved') return false;

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

      if (selectedTimeframe !== "all") {
        const eventDate = new Date(event.date);
        if (selectedTimeframe === "today" && !isToday(eventDate)) return false;
        if (selectedTimeframe === "this-week" && !isThisWeek(eventDate))
          return false;
        if (selectedTimeframe === "upcoming" && !isFuture(eventDate))
          return false;
      }

      if (showSavedOnly && !event.isSaved) return false;
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
