import { useState, useMemo } from "react";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { EventDetails } from "./components/EventDetails";
import { CreateEventForm } from "./components/CreateEventForm";
import { CalendarView } from "./components/CalendarView";
import { UserProfile } from "./components/UserProfile";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { AuthForm } from "./components/AuthForm";
import { mockEvents, mockUser, mockNotifications } from "./data/mockData";
import type { Event, EventCategory, User, Notification } from "./types/index";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { isToday, isThisWeek, isFuture } from "date-fns";

type Page =
  | "home"
  | "calendar"
  | "profile"
  | "organizer"
  | "event-details"
  | "create-event";

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(mockUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Navigation State
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Data State
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  // UI State
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | "all"
  >("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "all" | "upcoming" | "today" | "this-week"
  >("all");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showAttendingOnly, setShowAttendingOnly] = useState(false);

  // Auth Handlers
  const handleLogin = (email: string, password: string) => {
    // Mock login - in production this would call an API
    setCurrentUser(mockUser);
    setIsAuthenticated(true);
  };

  const handleRegister = (name: string, email: string, password: string) => {
    // Mock register - in production this would call an API
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: "student",
    };
    setCurrentUser(newUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage("home");
    toast.success("Deconectare reușită!");
  };

  // Navigation Handlers
  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    setSelectedEventId(null);
  };

  const handleViewEventDetails = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentPage("event-details");
  };

  const handleCreateEvent = () => {
    setCurrentPage("create-event");
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
    setSelectedEventId(null);
  };

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

  const handleCreateEventSubmit = (eventData: any) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventData.title,
      description: eventData.description,
      date: new Date(eventData.date),
      time: eventData.time,
      location: eventData.location,
      category: eventData.category,
      organizer: currentUser?.name || "Organizator",
      organizerId: currentUser?.id || "1",
      imageUrl: eventData.imageUrl || undefined,
      attendees: 0,
      maxAttendees: eventData.maxAttendees
        ? parseInt(eventData.maxAttendees)
        : undefined,
      isAttending: false,
      isSaved: false,
      comments: [],
    };

    setEvents([newEvent, ...events]);
    handleBackToHome();
    toast.success("Eveniment creat cu succes!");
  };

  // Notification Handlers
  const handleNotificationClick = (notification: Notification) => {
    if (notification.eventId) {
      handleViewEventDetails(notification.eventId);
    }
    setShowNotifications(false);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Toate notificările au fost marcate ca citite");
  };

  // Filter Handlers
  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedTimeframe("all");
    setShowSavedOnly(false);
    setShowAttendingOnly(false);
    setSearchQuery("");
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

  // Filtered Events
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

  // Get events for profile
  const attendingEvents = events.filter((e) => e.isAttending);
  const savedEvents = events.filter((e) => e.isSaved);
  const organizedEvents = events.filter(
    (e) => e.organizerId === currentUser?.id
  );

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Show auth form if not authenticated
  if (!isAuthenticated || !currentUser) {
    return <AuthForm onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onNavigate={handleNavigate}
        onCreateEvent={handleCreateEvent}
        currentUser={currentUser}
        unreadNotifications={unreadNotifications}
        onLogout={handleLogout}
        onShowNotifications={() => setShowNotifications(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="container mx-auto px-4 py-6">
        {currentPage === "home" && (
          <HomePage
            events={filteredEvents}
            onViewDetails={handleViewEventDetails}
            onToggleSave={handleToggleSave}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
            showSavedOnly={showSavedOnly}
            onToggleSavedOnly={() => setShowSavedOnly(!showSavedOnly)}
            showAttendingOnly={showAttendingOnly}
            onToggleAttendingOnly={() =>
              setShowAttendingOnly(!showAttendingOnly)
            }
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        )}

        {currentPage === "calendar" && (
          <CalendarView
            events={events}
            onViewDetails={handleViewEventDetails}
            onToggleSave={handleToggleSave}
          />
        )}

        {currentPage === "profile" && (
          <UserProfile
            user={currentUser}
            attendingEvents={attendingEvents}
            savedEvents={savedEvents}
            organizedEvents={organizedEvents}
            onViewDetails={handleViewEventDetails}
            onToggleSave={handleToggleSave}
          />
        )}

        {currentPage === "organizer" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1>Panou Organizator</h1>
              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Creează Eveniment Nou
              </button>
            </div>
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="mb-4">Evenimentele tale</h2>
              {organizedEvents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {organizedEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <h3 className="mb-2 line-clamp-1">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {event.attendees} participanți înregistrați
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewEventDetails(event.id)}
                          className="flex-1 px-3 py-2 border rounded hover:bg-gray-50 text-sm"
                        >
                          Vezi detalii
                        </button>
                        <button className="flex-1 px-3 py-2 border rounded hover:bg-gray-50 text-sm">
                          Editează
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nu ai creat încă niciun eveniment
                </p>
              )}
            </div>
          </div>
        )}

        {currentPage === "event-details" && selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onBack={handleBackToHome}
            onToggleSave={handleToggleSave}
            onToggleAttend={handleToggleAttend}
          />
        )}

        {currentPage === "create-event" && (
          <CreateEventForm
            onBack={handleBackToHome}
            onSubmit={handleCreateEventSubmit}
          />
        )}
      </main>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onNotificationClick={handleNotificationClick}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
}
