import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { EventDetails } from "./components/EventDetails";
import { CalendarView } from "./components/CalendarView";
import { UserProfile } from "./components/UserProfile";
import { OrganizerPanel } from "./components/OrganizerPanel";
import { AdminPanel } from "./components/AdminPanel";
import { AuthForm } from "./components/AuthForm";
import { CreateEventForm } from "./components/CreateEventForm";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { Toaster } from "./components/ui/sonner";
import { useEventLogic } from "./hooks/useEventLogic";
import { mockNotifications } from "./data/mockData";
import { toast } from "sonner";
import { auth, eventsApi, notificationsApi } from "./lib/api"; // Updated imports
import type { User, Notification, CreateEventInput } from "./types";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    events,
    filteredEvents,
    error: eventsError,
    isLoading: isEventsLoading,
    refetch,
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
  } = useEventLogic(searchQuery, isAuthenticated);

  const attendingEvents = events.filter((e) => e.isAttending);
  const savedEvents = events.filter((e) => e.isSaved);
  const organizedEvents = events.filter(
    (e) => e.organizerId === currentUser?.id
  );

  // 1. Check for existing session on Mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
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

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.success("Deconectare reușită!");
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // Use centralized API
      await notificationsApi.markRead(notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error(error);
      toast.error("Eroare la actualizarea notificării");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Use centralized API
      await notificationsApi.markAllRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Toate notificările au fost marcate ca citite");
    } catch (error) {
      console.error(error);
      toast.error("Eroare la actualizarea notificărilor");
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(false);
  };

  const handleCreateEventSubmit = async (eventData: CreateEventInput) => {
    try {
      // Use centralized API
      await eventsApi.create(eventData);

      toast.success("Eveniment creat cu succes!");
      refetch();
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error("Nu s-a putut crea evenimentul.");
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <AuthForm
          onLogin={handleLoginSuccess}
          onRegister={handleLoginSuccess}
        />
        <Toaster position="bottom-right" />
      </>
    );
  }

  if (eventsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Eroare</h2>
          <p className="text-red-500">{eventsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Reîncearcă
          </button>
        </div>
      </div>
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
                  isLoading={isEventsLoading}
                  onClearFilters={handleClearFilters}
                />
              }
            />
            <Route path="/calendar" element={<CalendarView events={events} onToggleSave={handleToggleSave} />} />
            <Route path="/profile" element={
              <UserProfile user={currentUser}
                attendingEvents={attendingEvents}
                onToggleSave={handleToggleSave}
                organizedEvents={organizedEvents}
                savedEvents={savedEvents}
              />
            }
            />

            {/* Organizer Route */}
            <Route path="/organizer" element={<OrganizerPanel events={events} user={currentUser} />} />

            {/* Admin Route - Only accessible if user role is admin */}
            {currentUser.role === 'admin' && (
              <Route path="/admin" element={<AdminPanel events={events} user={currentUser} />} />
            )}

            <Route path="/event/:id" element={
              <EventDetails
                events={events}
                currentUser={currentUser}
                onEventUpdated={refetch}
                onToggleAttend={handleToggleAttend}
                onToggleSave={handleToggleSave}
              />
            }
            />
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




// Trebuie de adaugat ceva statistici la organizatori si admini
// + trebuie de vazut ce e cu validarea si trnsimiterea de qr code pentru evenimente
// + la evenimentele mele de adaugat o sectiune cu 'Am participat' si la particip de gandit cum de pus evenimentele la trecut