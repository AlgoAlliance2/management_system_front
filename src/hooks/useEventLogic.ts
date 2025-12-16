import { useState, useMemo } from "react";
import { toast } from "sonner";
import { isToday, isThisWeek, isFuture } from "date-fns";
import { mockEvents } from "../data/mockData";
import type { Event, EventCategory } from "../types";

export function useEventLogic(searchQuery: string) {
  // Data State
  const [events, setEvents] = useState<Event[]>(mockEvents);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">(
    "all"
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "all" | "upcoming" | "today" | "this-week"
  >("all");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showAttendingOnly, setShowAttendingOnly] = useState(false);

  // Event Handlers
  const handleToggleSave = (eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, isSaved: !event.isSaved } : event
      )
    );
    const event = events.find((e) => e.id === eventId);
    if (event?.isSaved) {
      toast.success("Eveniment eliminat din salvate");
    } else {
      toast.success("Eveniment salvat");
    }
  };

  const handleToggleAttend = async (eventId: string) => {
    const current = events.find((e) => e.id === eventId);
    if (!current) return;

    const nextIsAttending = !current.isAttending;

    // Optimistic UI update
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
