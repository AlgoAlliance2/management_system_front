import { useNavigate } from "react-router-dom";
import { Plus, Users, Calendar, TrendingUp, Star, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { Event, User } from "../types";
import { isFuture, isPast } from "date-fns";

interface OrganizerPanelProps {
  events: Event[];
  user: User | null;
}

export function OrganizerPanel({ events, user }: OrganizerPanelProps) {
  const navigate = useNavigate();

  // 1. Filter events for this organizer
  const organizedEvents = events.filter(
    (event) => event.organizerId === user?.id
  );

  // 2. Calculate Statistics
  const totalEvents = organizedEvents.length;
  const totalAttendees = organizedEvents.reduce((acc, curr) => acc + curr.attendees, 0);
  const averageAttendance = totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0;
  
  const upcomingEventsCount = organizedEvents.filter(e => isFuture(new Date(e.date))).length;
  const pastEventsCount = organizedEvents.filter(e => isPast(new Date(e.date))).length;

  // Find most popular event
  const mostPopularEvent = organizedEvents.reduce((prev, current) => {
    return (prev.attendees > current.attendees) ? prev : current
  }, organizedEvents[0] || null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panou Organizator</h1>
          <p className="text-gray-500">Statistici și performanța evenimentelor tale.</p>
        </div>
        <Button
          onClick={() => navigate("/create-event")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Creează Eveniment
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evenimente</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-gray-500">
              {upcomingEventsCount} viitoare, {pastEventsCount} trecute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participanți Totali</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendees}</div>
            <p className="text-xs text-gray-500">
              De la începutul activității
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medie Participare</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAttendance}</div>
            <p className="text-xs text-gray-500">
              Participanți per eveniment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Eveniment</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostPopularEvent ? mostPopularEvent.attendees : 0}
            </div>
            <p className="text-xs text-gray-500 truncate" title={mostPopularEvent?.title}>
              {mostPopularEvent ? mostPopularEvent.title : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Distribution or Empty State */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Stare Evenimente</CardTitle>
          </CardHeader>
          <CardContent>
             {totalEvents > 0 ? (
                <div className="flex items-center justify-around py-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{upcomingEventsCount}</div>
                        <div className="text-sm text-gray-500">Active / Viitoare</div>
                    </div>
                    <div className="h-12 w-px bg-gray-200"></div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-400">{pastEventsCount}</div>
                        <div className="text-sm text-gray-500">Arhivă / Trecute</div>
                    </div>
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BarChart3 className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500 mb-4">Nu există date statistice.</p>
                    <Button variant="link" onClick={() => navigate("/create-event")}>
                        Creează primul eveniment
                    </Button>
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}