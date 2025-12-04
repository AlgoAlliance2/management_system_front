import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { EventDetails } from "./components/EventDetails";
import { CalendarView } from "./components/CalendarView";
import { UserProfile } from "./components/UserProfile";
import { OrganizerPanel } from "./components/OrganizerPanel";
import { AuthForm } from "./components/AuthForm";
import { CreateEventForm } from "./components/CreateEventForm";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { Toaster } from "./components/ui/sonner";
import { useEventLogic } from "./hooks/useEventLogic";
import { mockNotifications } from "./data/mockData";
import { toast } from "sonner";
import { auth } from "./lib/api";
import type { User, Notification } from "./types";
import { mockUser } from "./data/mockData";

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(mockUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // New loading state

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);

  // Use the custom hook
  const {
    events,
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
  } = useEventLogic(searchQuery);

  const attendingEvents = events.filter((e) => e.isAttending);
  const savedEvents = events.filter((e) => e.isSaved);
  const organizedEvents = events.filter((e) => e.organizerId === currentUser?.id);

  // 1. Check for existing session on Mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        // Verify token with backend and get user data
        const user = await auth.getMe();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Session expired", error);
        localStorage.removeItem("authToken");
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  // Auth Handlers (Now accept User object)
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear token
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.success("Deconectare reușită!");
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

  const handleNotificationClick = () => {
    setShowNotifications(false);
  };

  const handleCreateEventSubmit = (eventData: any) => {
    // In real app, call API here: await api.post('/events', eventData)
    const newEvent: any = {
      id: Date.now().toString(),
      ...eventData,
      organizer: currentUser?.name || "Organizator",
      organizerId: currentUser?.id,
      attendees: 0,
      isAttending: false,
      isSaved: false,
      comments: [],
    };
    
    // Add to local state (provided by useEventLogic - you might need to expose setEvents there)
    // setEvents([newEvent, ...events]); 
    console.log("New Event Created:", newEvent);
  };

  // 2. Show loading spinner while checking token
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 3. Show Auth Form if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <AuthForm onLogin={handleLoginSuccess} onRegister={handleLoginSuccess} />
        <Toaster position="bottom-right" />
      </>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header
          currentUser={currentUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          unreadNotifications={notifications.filter((n) => !n.read).length}
          onLogout={handleLogout}
          onShowNotifications={() => setShowNotifications(true)}
        />

        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  events={filteredEvents}
                  onToggleSave={handleToggleSave}
                  hasActiveFilters={hasActiveFilters}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  selectedTimeframe={selectedTimeframe}
                  onTimeframeChange={setSelectedTimeframe}
                  showSavedOnly={showSavedOnly}
                  onToggleSavedOnly={() => setShowSavedOnly(!showSavedOnly)}
                  showAttendingOnly={showAttendingOnly}
                  onToggleAttendingOnly={() => setShowAttendingOnly(!showAttendingOnly)}
                  isLoading={false}
                  onClearFilters={handleClearFilters}
                />
              }
            />
            <Route path="/calendar" element={<CalendarView events={events} onToggleSave={handleToggleSave} />} />
            <Route path="/profile" element={<UserProfile user={currentUser} attendingEvents={attendingEvents} onToggleSave={handleToggleSave} organizedEvents={organizedEvents} savedEvents={savedEvents} />} />
            <Route path="/organizer" element={<OrganizerPanel events={events} user={currentUser} />} />
            <Route path="/event/:id" element={<EventDetails events={events} onToggleAttend={handleToggleAttend} onToggleSave={handleToggleSave} />} />
            <Route path="/create-event" element={<CreateEventForm onSubmit={handleCreateEventSubmit} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {showNotifications && (
          <NotificationsPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onNotificationClick={handleNotificationClick}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        )}
        
        <Toaster position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}