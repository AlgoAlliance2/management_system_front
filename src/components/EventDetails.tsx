import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Pencil,
  Check,
  X,
  Clock,
  Trash2
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Event, User } from "../types";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import api from "../lib/api";
import { ConfirmModal } from "./ConfirmModal"; // 1. Import Modal

interface EventDetailsProps {
  events: Event[];
  currentUser: User | null;
  onToggleSave: (eventId: string) => void;
  onToggleAttend: (eventId: string) => void;
  onEventUpdated?: () => void;
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
  events,
  currentUser,
  onToggleSave,
  onToggleAttend,
  onEventUpdated
}: EventDetailsProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const foundEvent = events.find((e) => e.id === id);
  const [event, setEvent] = useState<Event | undefined>(foundEvent);

  useEffect(() => {
    setEvent(foundEvent);
  }, [foundEvent]);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // 2. Add state for modal visibility
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<NonNullable<Event["comments"]>>(
    event?.comments ?? []
  );

  useEffect(() => {
    if (event?.comments) {
      setComments(event.comments);
    }
  }, [event?.comments]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Evenimentul nu a fost găsit
        </h1>
        <Button onClick={() => navigate("/")}>Înapoi la prima pagină</Button>
      </div>
    );
  }

  const isOrganizer = currentUser?.id === event.organizerId || currentUser?.role === 'admin';

  // --- DELETE HANDLER (UPDATED) ---
  
  // Just open the modal
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // Actual API call triggers here
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/events/${event.id}`);
      toast.success("Eveniment șters cu succes!");
      onEventUpdated?.();
      navigate("/"); 
    } catch (error) {
      console.error(error);
      toast.error("Nu s-a putut șterge evenimentul.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // --- EDIT HANDLERS ---

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveEdit = async (field: keyof Event | 'datetime') => {
    let payload: Partial<Event> = {};

    if (field === 'datetime') {
        const [newDate, newTime] = editValue.split('|');
        if (!newDate || !newTime) {
            toast.error("Dată sau oră invalidă");
            return;
        }
        payload = { date: new Date(newDate) as any, time: newTime };
    } else if (field === 'maxAttendees') {
        const val = editValue.trim() === '' ? null : parseInt(editValue, 10);
        payload = { maxAttendees: val as number | undefined };
    } else {
        if (!editValue.trim() && field !== 'imageUrl') {
            toast.error("Câmpul nu poate fi gol");
            return;
        }
        payload = { [field]: editValue };
    }

    setIsSaving(true);
    try {
      await api.patch(`/events/${event.id}`, payload);
      setEvent((prev) => prev ? ({ ...prev, ...payload }) : prev);
      onEventUpdated?.();
      toast.success("Actualizat cu succes!");
      setEditingField(null);
    } catch (error) {
      console.error(error);
      toast.error("Eroare la actualizare.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- COMMENT HANDLERS ---

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text) {
      toast.error("Scrie un comentariu înainte să trimiți.");
      return;
    }

    setIsSubmittingComment(true);

    try {
      const res = await api.post(`/events/${event.id}/comments`, { text });
      const created = res.data; 

      setComments((prev) => [
        {
          id: created.id ?? `local-${Date.now()}`,
          userId: created.userId ?? currentUser?.id ?? "unknown",
          userName: created.userName ?? currentUser?.name ?? "Tu",
          date: created.date ? new Date(created.date) : new Date(),
          text: created.text ?? text,
        },
        ...prev,
      ]);

      setCommentText("");
      toast.success("Comentariu trimis!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Nu am putut trimite comentariul.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const attendancePercentage = event.maxAttendees
    ? (event.attendees / event.maxAttendees) * 100
    : 0;

  const isFull =
    event.maxAttendees !== undefined && event.maxAttendees !== null
      ? event.attendees >= event.maxAttendees
      : false;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copiat în clipboard!");
  };

  const EditAction = ({ field, value }: { field: string; value: string }) => {
    if (!isOrganizer) return null;
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 ml-2 text-gray-400 hover:text-blue-600"
        onClick={() => startEditing(field, value)}
      >
        <Pencil className="h-3 w-3" />
      </Button>
    );
  };

  const SaveCancelActions = ({ onSave }: { onSave: () => void }) => (
    <div className="flex gap-1 ml-2">
      <Button
        size="icon"
        className="h-8 w-8 bg-green-600 hover:bg-green-700"
        onClick={onSave}
        disabled={isSaving}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={cancelEditing}
        disabled={isSaving}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Înapoi
          </Button>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden bg-gray-100 group">
              {editingField === 'imageUrl' ? (
                 <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-4">
                    <h3 className="mb-2 font-medium">Editează Imaginea URL</h3>
                    <Input 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)} 
                        placeholder="https://..."
                        className="mb-4"
                    />
                    <div className="flex gap-2">
                        <Button onClick={() => saveEdit('imageUrl')}>Salvează</Button>
                        <Button variant="ghost" onClick={cancelEditing}>Anulează</Button>
                    </div>
                 </div>
              ) : (
                  <>
                    {event.imageUrl ? (
                        <ImageWithFallback
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Fără imagine
                        </div>
                    )}
                    {isOrganizer && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => startEditing('imageUrl', event.imageUrl || '')}
                        >
                            <Pencil className="mr-2 h-3 w-3" /> Editează
                        </Button>
                    )}
                  </>
              )}
            </div>

            {/* Event Info */}
            <div className="flex flex-col">
              
              <div className="mb-3 flex items-center">
                {editingField === 'category' ? (
                    <div className="flex items-center gap-2">
                        <Select 
                            value={editValue} 
                            onValueChange={setEditValue}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selectează categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(categoryLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <SaveCancelActions onSave={() => saveEdit('category')} />
                    </div>
                ) : (
                    <div className="flex items-center group">
                        <Badge className={`${categoryColors[event.category]} w-fit`}>
                            {categoryLabels[event.category]}
                        </Badge>
                        {isOrganizer && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 ml-2 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-all"
                                onClick={() => startEditing('category', event.category)}
                            >
                                <Pencil className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                )}
              </div>

              {/* Title */}
              <div className="flex items-start mb-4">
                {editingField === 'title' ? (
                    <div className="flex-1 flex items-center">
                        <Input 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            className="text-2xl font-bold h-auto py-1" 
                        />
                        <SaveCancelActions onSave={() => saveEdit('title')} />
                    </div>
                ) : (
                    <h1 className="text-3xl font-bold flex items-center">
                        {event.title}
                        <EditAction field="title" value={event.title} />
                    </h1>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    {editingField === 'datetime' ? (
                        <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Dată</label>
                                <Input 
                                    type="date"
                                    className="h-8 w-auto bg-white"
                                    value={editValue.split('|')[0]} 
                                    onChange={(e) => setEditValue(`${e.target.value}|${editValue.split('|')[1]}`)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Oră</label>
                                <Input 
                                    type="text"
                                    className="h-8 w-32 bg-white"
                                    value={editValue.split('|')[1]} 
                                    onChange={(e) => setEditValue(`${editValue.split('|')[0]}|${e.target.value}`)}
                                />
                            </div>
                            <div className="mt-4">
                                <SaveCancelActions onSave={() => saveEdit('datetime')} />
                            </div>
                        </div>
                    ) : (
                        <div className="group flex items-center">
                            <div>
                                <div className="font-medium">
                                    {format(new Date(event.date), "EEEE, dd MMMM yyyy", { locale: ro })}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {event.time}
                                </div>
                            </div>
                            {isOrganizer && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 ml-2 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        const dateStr = new Date(event.date).toISOString().split('T')[0];
                                        startEditing('datetime', `${dateStr}|${event.time}`);
                                    }}
                                >
                                    <Pencil className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1 flex items-center">
                    {editingField === 'location' ? (
                        <>
                            <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                            <SaveCancelActions onSave={() => saveEdit('location')} />
                        </>
                    ) : (
                        <span className="flex items-center">
                            {event.location}
                            <EditAction field="location" value={event.location} />
                        </span>
                    )}
                  </div>
                </div>

                {/* Attendees / Max Attendees */}
                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div className="flex-1 flex items-center flex-wrap">
                    {event.attendees} participanți înregistrați
                    
                    {editingField === 'maxAttendees' ? (
                        <div className="flex items-center ml-2">
                            <span className="mr-2 text-sm text-gray-500">din max:</span>
                            <Input 
                                type="number"
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-7 w-20 text-sm"
                                placeholder="∞"
                            />
                            <SaveCancelActions onSave={() => saveEdit('maxAttendees')} />
                        </div>
                    ) : (
                        <span className="flex items-center ml-1">
                            {event.maxAttendees ? ` din ${event.maxAttendees}` : ' (Nelimitat)'}
                            <EditAction field="maxAttendees" value={event.maxAttendees?.toString() || ''} />
                        </span>
                    )}
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
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Despre eveniment</h2>
                {isOrganizer && !editingField && (
                    <Button variant="ghost" size="sm" onClick={() => startEditing('description', event.description)}>
                        <Pencil className="mr-2 h-4 w-4" /> Editează
                    </Button>
                )}
              </div>
              
              {editingField === 'description' ? (
                  <div className="space-y-4">
                      <Textarea 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)} 
                        rows={8}
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => saveEdit('description')}>Salvează descrierea</Button>
                        <Button variant="ghost" onClick={cancelEditing}>Anulează</Button>
                      </div>
                  </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-line">
                    {event.description}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg p-6">
              <h2 className="mb-4">Întrebări și comentarii</h2>

              {comments.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {comments.map((comment) => (
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
                            {format(new Date(comment.date), "dd MMM yyyy, HH:mm", {
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
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmittingComment}
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment}
                >
                  {isSubmittingComment ? "Se trimite..." : "Trimite comentariu"}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
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
                    onClick={() => navigate(`/profile`)}
                  >
                    Vezi profil
                  </Button>
                </div>
              </div>

              {/* DELETE BUTTON */}
              {isOrganizer && (
                <div className="mt-6 pt-4 border-t">
                    <Button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white" 
                        onClick={handleDeleteClick}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Șterge Eveniment
                    </Button>
                </div>
              )}
            </div>

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

      {/* 3. Render Modal */}
      <ConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Ștergere Eveniment"
        description={`Ești sigur că vrei să ștergi evenimentul "${event.title}"? Această acțiune este permanentă și nu poate fi anulată.`}
        confirmLabel="Șterge"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}