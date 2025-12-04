import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import type { User, Event } from '../types';
import { EventCard } from './EventCard';
import { Calendar, Bookmark, CheckCircle } from 'lucide-react';

interface UserProfileProps {
  user: User;
  attendingEvents: Event[];
  savedEvents: Event[];
  organizedEvents: Event[];
  onToggleSave: (eventId: string) => void;
}

export function UserProfile({
  user,
  attendingEvents,
  savedEvents,
  organizedEvents,
  onToggleSave,
}: UserProfileProps) {
  const navigate = useNavigate();

  const roleLabels: Record<string, string> = {
    student: 'Student',
    professor: 'Profesor',
    organizer: 'Organizator',
    admin: 'Administrator',
  };

  const roleBadgeColors: Record<string, string> = {
    student: 'bg-blue-100 text-blue-700',
    professor: 'bg-purple-100 text-purple-700',
    organizer: 'bg-green-100 text-green-700',
    admin: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-4xl text-blue-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="mb-2">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <Badge className={roleBadgeColors[user.role]}>
                {roleLabels[user.role]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Particip la</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Bookmark className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Salvate</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Organizate</p>
          </div>
        </div>
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="attending" className="bg-white rounded-lg border">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="attending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Particip ({attendingEvents.length})
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Salvate ({savedEvents.length})
          </TabsTrigger>
          {(user.role === 'organizer' || user.role === 'admin') && (
            <TabsTrigger
              value="organized"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Organizate ({organizedEvents.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="attending" className="p-6">
          {attendingEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {attendingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={(id) => navigate(`/event/${id}`)}
                  onToggleSave={onToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nu participi încă la niciun eveniment</p>
              <p className="text-sm">Explorează evenimentele disponibile și înscrie-te!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="p-6">
          {savedEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={(id) => navigate(`/event/${id}`)}
                  onToggleSave={onToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Bookmark className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nu ai evenimente salvate</p>
              <p className="text-sm">Salvează evenimente pentru a le găsi mai ușor mai târziu!</p>
            </div>
          )}
        </TabsContent>

        {(user.role === 'organizer' || user.role === 'admin') && (
          <TabsContent value="organized" className="p-6">
            {organizedEvents.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {organizedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onViewDetails={(id) => navigate(`/event/${id}`)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nu ai organizat încă niciun eveniment</p>
                <p className="text-sm">Creează primul tău eveniment și invită participanți!</p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}