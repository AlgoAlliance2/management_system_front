import { useNavigate } from "react-router-dom";
import { MapPin, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import type { Event, User } from "../../types";

interface EventSidebarProps {
  event: Event;
  isOrganizer: boolean;
  onDeleteClick: () => void;
  isDeleting: boolean;
}

export interface EventDetailsProps {
  events: Event[];
  currentUser: User | null;
  onToggleSave: (eventId: string) => void;
  onToggleAttend: (eventId: string) => void;
  onEventUpdated?: () => void;
}

export const categoryLabels: Record<string, string> = {
  conference: "Conferință",
  workshop: "Workshop",
  "student-activity": "Activitate Studențească",
  seminar: "Seminar",
  sports: "Sport",
  cultural: "Cultural",
};

export const categoryColors: Record<string, string> = {
  conference: "bg-blue-100 text-blue-700",
  workshop: "bg-green-100 text-green-700",
  "student-activity": "bg-purple-100 text-purple-700",
  seminar: "bg-orange-100 text-orange-700",
  sports: "bg-red-100 text-red-700",
  cultural: "bg-pink-100 text-pink-700",
};

export function EventSidebar({
  event,
  isOrganizer,
  onDeleteClick,
  isDeleting,
}: EventSidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h3 className="mb-4 font-semibold">Organizator</h3>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold">
              {event.organizer.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium">{event.organizer}</div>
            <Button
              variant="link"
              className="p-0 h-auto text-sm text-blue-600"
              onClick={() => navigate(`/profile`)}
            >
              Vezi profil
            </Button>
          </div>
        </div>

        {/* DELETE BUTTON SECTION */}
        {isOrganizer && (
          <div className="mt-6 pt-4 border-t">
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={onDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? (
                "Se șterge..."
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> Șterge Eveniment
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h3 className="mb-4 font-semibold">Locație</h3>
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-3">
          <MapPin className="h-12 w-12 text-gray-400" />
        </div>
        <p className="text-sm text-gray-700">{event.location}</p>
        <Button variant="outline" className="w-full mt-3">
          Deschide în Google Maps
        </Button>
      </div>
    </div>
  );
}