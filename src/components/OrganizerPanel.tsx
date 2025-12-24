import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import type { Event, User } from "../types";

interface OrganizerPanelProps {
  events: Event[];
  user: User | null;
}

export function OrganizerPanel({ events, user }: OrganizerPanelProps) {
  const navigate = useNavigate();

  // Filter events for the current organizer
  const organizedEvents = events.filter(
    (event) => event.organizerId === user?.id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panou Organizator</h1>
        <Button
          onClick={() => navigate("/create-event")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Creează Eveniment Nou
        </Button>
      </div>

      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Evenimentele tale</h2>

        {organizedEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {organizedEvents.map((event) => (
              <div
                key={event.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {event.attendees} participanți înregistrați
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    Vezi detalii
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                    onClick={() => navigate(`/event/${event.id}/edit`)} // Placeholder route for edit
                  >
                    Editează
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Nu ai creat încă niciun eveniment
            </p>
            <Button
              variant="link"
              onClick={() => navigate("/create-event")}
              className="text-blue-600"
            >
              Începe prin a crea primul tău eveniment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
