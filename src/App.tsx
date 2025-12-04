import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { EventDetails } from "./components/EventDetails";
import { CalendarView } from "./components/CalendarView";
import { UserProfile } from "./components/UserProfile";
import { OrganizerPanel } from "./components/OrganizerPanel";
import { AuthForm } from "./components/AuthForm";
import { Toaster } from "./components/ui/sonner";
import { useEventLogic } from "./hooks/useEventLogic";
import { mockUser, mockNotifications } from "./data/mockData";
import { toast } from "sonner";
import type { User } from "./types";

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(mockUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false); // Used for panel toggle

  // Use the custom hook to get all data logic
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

  // Derived state for Profile Page
  const attendingEvents = events.filter((e) => e.isAttending);
  const savedEvents = events.filter((e) => e.isSaved);
  const organizedEvents = events.filter((e) => e.organizerId === currentUser?.id);

  // Auth Handlers
  const handleLogin = (email: string, password: string) => {
    // In a real app, verify credentials here
    console.log("Login:", email);
    setCurrentUser(mockUser);
    setIsAuthenticated(true);
  };

  const handleRegister = (name: string, email: string, password: string) => {
    // In a real app, create account here
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
    toast.success("Deconectare reușită!");
  };

  if (!isAuthenticated || !currentUser) {
    return <AuthForm onLogin={handleLogin} onRegister={handleRegister} />;
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
            {/* The Home Page */}
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

            {/* Calendar Page */}
            <Route
              path="/calendar"
              element={
                <CalendarView 
                  events={events} 
                  onToggleSave={handleToggleSave} 
                />
              }
            />

            {/* Profile Page */}
            <Route
              path="/profile"
              element={
                <UserProfile
                  user={currentUser}
                  attendingEvents={attendingEvents}
                  onToggleSave={handleToggleSave}
                  organizedEvents={organizedEvents}
                  savedEvents={savedEvents}
                />
              }
            />

            {/* Organizer Page */}
            <Route
              path="/organizer"
              element={
                <OrganizerPanel 
                  events={events} 
                  user={currentUser} 
                />
              }
            />

            {/* Dynamic Event Details Page */}
            <Route
              path="/event/:id"
              element={
                <EventDetails
                  events={events}
                  onToggleAttend={handleToggleAttend}
                  onToggleSave={handleToggleSave}
                />
              }
            />

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Toaster position="bottom-right" />
      </div>
    </BrowserRouter>
  );
}