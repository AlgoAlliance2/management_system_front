import { useNavigate } from "react-router-dom"; // 1. Import hook
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { Event } from "../types";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface EventCardProps {
  event: Event;
  onToggleSave: (eventId: string) => void;
  compact?: boolean;
}

const categoryLabels: Record<string, string> = {
  conference: "Conferință",
  workshop: "Workshop",
  "student-activity": "Activitate Studențească",
  seminar: "Seminar",
  sports: "Sport",
  cultural: "Cultural",
};

const categoryColors: Record<string, string> = {
  conference: "bg-blue-100 text-blue-700",
  workshop: "bg-green-100 text-green-700",
  "student-activity": "bg-purple-100 text-purple-700",
  seminar: "bg-orange-100 text-orange-700",
  sports: "bg-red-100 text-red-700",
  cultural: "bg-pink-100 text-pink-700",
};

export function EventCard({
  event,
  onToggleSave,
  compact = false,
}: EventCardProps) {
  const navigate = useNavigate();

  const attendancePercentage = event.maxAttendees
    ? (event.attendees / event.maxAttendees) * 100
    : 0;

  const handleViewDetails = () => {
    navigate(`/event/${event.id}`);
  };

  if (compact) {
    return (
      <Card
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleViewDetails} // 3. Use internal handler
      >
        <CardContent className="p-4">
          <div className="flex gap-3">
            {event.imageUrl && (
              <ImageWithFallback
                src={event.imageUrl}
                alt={event.title}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <Badge className={`${categoryColors[event.category]} mb-2`}>
                {categoryLabels[event.category]}
              </Badge>
              <h3 className="line-clamp-1 mb-1">{event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>{format(event.date, "dd MMM yyyy", { locale: ro })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" // Added cursor-pointer
      onClick={handleViewDetails} // Make whole card clickable
    >
      {/* Image */}
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              onToggleSave(event.id);
            }}
          >
            {event.isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-blue-600" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      <CardContent className="p-4">
        {/* Category Badge */}
        <Badge className={`${categoryColors[event.category]} mb-2`}>
          {categoryLabels[event.category]}
        </Badge>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2">{event.title}</h3>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Calendar className="h-4 w-4" />
          <span>
            {format(event.date, "EEEE, dd MMMM yyyy", { locale: ro })}
          </span>
        </div>
        <div className="text-sm text-gray-600 mb-2 ml-6">{event.time}</div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{event.location}</span>
        </div>

        {/* Attendees */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>
            {event.attendees} participanți
            {event.maxAttendees && ` / ${event.maxAttendees}`}
          </span>
        </div>

        {/* Progress Bar */}
        {event.maxAttendees && (
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${attendancePercentage >= 90
                  ? "bg-red-500"
                  : attendancePercentage >= 70
                    ? "bg-orange-500"
                    : "bg-blue-600"
                }`}
              style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
            />
          </div>
        )}

        {/* Organizer */}
        <div className="mt-3 text-sm text-gray-500">
          Organizator: {event.organizer}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          onClick={(e) => {
            e.stopPropagation(); // Prevent double navigation trigger
            handleViewDetails();
          }}
        >
          Detalii
        </Button>
        {event.isAttending && (
          <Badge variant="outline" className="border-green-600 text-green-600">
            Particip
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
