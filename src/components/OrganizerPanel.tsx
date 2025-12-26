import { useNavigate } from "react-router-dom";
import { Users, Calendar, TrendingUp, Star, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { Event, User } from "../types";
import { Badge } from "./ui/badge";
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


  const pendingEvents = organizedEvents.filter(e => e.status === 'pending');
  const rejectedEvents = organizedEvents.filter(e => e.status === 'rejected');
  const approvedEvents = organizedEvents.filter(e => e.status === 'approved' || !e.status); // Fallback for old events

  const EventList = ({ list, emptyMsg }: { list: Event[], emptyMsg: string }) => (
    list.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((event) => (
          <div key={event.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                {event.status === 'pending' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">În Așteptare</Badge>}
                {event.status === 'rejected' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Respins</Badge>}
                {event.status === 'approved' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aprobat</Badge>}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
                {event.attendees} participanți • {new Date(event.date).toLocaleDateString()}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-sm h-9"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                Vezi detalii
              </Button>
              {/* Only show edit explicitly if user might need to fix something */}
              <Button
                variant="outline"
                className="flex-1 text-sm h-9"
                onClick={() => navigate(`/event/${event.id}`)} // Reusing details page for edit
              >
                {event.status === 'rejected' ? 'Corectează' : 'Editează'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 italic py-4">{emptyMsg}</p>
    )
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panou Organizator</h1>
          <p className="text-gray-500">Statistici și performanța evenimentelor tale.</p>
        </div>
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

      <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panou Organizator</h1>
      </div>

      <div className="grid gap-6">
        {/* Rejected Events (Priority) */}
        {rejectedEvents.length > 0 && (
            <Card className="border-red-100 bg-red-50/20">
                <CardHeader>
                    <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="h-5 w-5" />
                        <CardTitle className="text-lg">Necesită Atenție (Respinse)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <EventList list={rejectedEvents} emptyMsg="" />
                </CardContent>
            </Card>
        )}

        {/* Pending Events */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="h-5 w-5" />
                    <CardTitle className="text-lg">În Așteptarea Aprobării</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <EventList list={pendingEvents} emptyMsg="Nu ai evenimente în așteptare." />
            </CardContent>
        </Card>

        {/* Active/Approved Events */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <CardTitle className="text-lg">Evenimente Active</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <EventList list={approvedEvents} emptyMsg="Nu ai evenimente active momentan." />
            </CardContent>
        </Card>
      </div>
    </div>

     
    </div>
  );
}