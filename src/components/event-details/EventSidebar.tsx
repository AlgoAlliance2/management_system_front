import { MapPin, Trash2, ExternalLink } from "lucide-react";
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

  const handleOpenMaps = () => {
    if (!event.location) return;
    
    // Encode the location string to be URL-safe (e.g., spaces becomes %20)
    const encodedLocation = encodeURIComponent(event.location);
    
    // Open Google Maps search in a new tab
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
  };

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
        {/* Make the map placeholder clickable */}
        <div 
          className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center mb-3 cursor-pointer hover:bg-gray-200 transition-colors group relative overflow-hidden"
          onClick={handleOpenMaps}
          title="Deschide în Google Maps"
        >
          <MapPin className="h-12 w-12 text-gray-400 group-hover:text-blue-600 transition-colors mb-2" />
          <span className="text-xs text-gray-500 font-medium group-hover:text-blue-600 transition-colors">
            Vezi pe hartă
          </span>
          <ExternalLink className="absolute top-2 right-2 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <p className="text-sm text-gray-700 font-medium">{event.location}</p>
      </div>
    </div>
  );
}