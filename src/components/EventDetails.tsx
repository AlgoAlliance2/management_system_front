import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import type { Event } from "../types";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";

interface EventDetailsProps {
  event: Event;
  onBack: () => void;
  onToggleSave: (eventId: string) => void;
  onToggleAttend: (eventId: string) => void;
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

export function EventDetails({
  event,
  onBack,
  onToggleSave,
  onToggleAttend,
}: EventDetailsProps) {
  const attendancePercentage = event.maxAttendees
    ? (event.attendees / event.maxAttendees) * 100
    : 0;

  const isFull =
    event.maxAttendees !== undefined && event.maxAttendees !== null
      ? event.attendees >= event.maxAttendees
      : false;

  const handleShare = () => {
    toast.success("Link copiat în clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Înapoi la evenimente
          </Button>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden bg-gray-100">
              {event.imageUrl && (
                <ImageWithFallback
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Event Info */}
            <div className="flex flex-col">
              <Badge className={`${categoryColors[event.category]} w-fit mb-3`}>
                {categoryLabels[event.category]}
              </Badge>

              <h1 className="mb-4">{event.title}</h1>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <div>
                      {format(event.date, "EEEE, dd MMMM yyyy", { locale: ro })}
                    </div>
                    <div className="text-sm text-gray-500">{event.time}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                  <div>{event.location}</div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    {event.attendees} participanți înregistrați
                    {event.maxAttendees && ` din ${event.maxAttendees}`}
                  </div>
                </div>

                {event.maxAttendees && (
                  <div className="mt-2">
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          attendancePercentage >= 90
                            ? "bg-red-500"
                            : attendancePercentage >= 70
                            ? "bg-orange-500"
                            : "bg-blue-600"
                        }`}
                        style={{
                          width: `${Math.min(attendancePercentage, 100)}%`,
                        }}
                      />
                    </div>
                    {isFull && (
                      <p className="text-sm text-red-600 mt-1">
                        Evenimentul este complet
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-auto">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isFull && !event.isAttending}
                  onClick={() => onToggleAttend(event.id)}
                >
                  {event.isAttending ? "Anulează participarea" : "Participă"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onToggleSave(event.id)}
                >
                  {event.isSaved ? (
                    <BookmarkCheck className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="mb-4">Despre eveniment</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="mb-4">Întrebări și comentarii</h2>

              {event.comments && event.comments.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {event.comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm text-blue-600">
                            {comment.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm">{comment.userName}</div>
                          <div className="text-xs text-gray-500">
                            {format(comment.date, "dd MMM yyyy, HH:mm", {
                              locale: ro,
                            })}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 ml-10">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-6">
                  Nu există comentarii încă. Fii primul care adaugă un
                  comentariu!
                </p>
              )}

              <Separator className="my-4" />

              <div className="space-y-3">
                <label className="text-sm">
                  Adaugă un comentariu sau o întrebare
                </label>
                <Textarea
                  placeholder="Scrie întrebarea sau comentariul tău aici..."
                  rows={3}
                />
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Trimite comentariu
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer Info */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="mb-4">Organizator</h3>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600">
                    {event.organizer.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div>{event.organizer}</div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm text-blue-600"
                  >
                    Vezi profil
                  </Button>
                </div>
              </div>
            </div>

            {/* Location Map Placeholder */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="mb-4">Locație</h3>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <MapPin className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-700">{event.location}</p>
              <Button variant="outline" className="w-full mt-3">
                Deschide în Google Maps
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
