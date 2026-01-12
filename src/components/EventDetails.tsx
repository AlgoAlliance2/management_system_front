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
  Clock
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Event } from "../types";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { eventsApi } from "../lib/api";
import { ConfirmModal } from "./ConfirmModal";

import { EventStatusBanners } from "./event-details/EventStatusBanners";
import { EventSidebar } from "./event-details/EventSidebar";
import { EventComments } from "./event-details/EventComments";
import type { EventDetailsProps } from "./event-details/EventSidebar";
import { categoryLabels, categoryColors } from "./event-details/EventSidebar";
import { EventAttendees } from "./event-details/EventAttendees";


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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
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
  const isAdmin = currentUser?.role === 'admin';

  const handleApprove = async () => {
    try {
      await eventsApi.approve(event.id);
      toast.success("Eveniment aprobat cu succes!");
      setEvent(prev => prev ? { ...prev, status: 'approved' } : prev);
      onEventUpdated?.();
    } catch (error) {
      toast.error("Eroare la aprobarea evenimentului.");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Te rugăm să introduci un motiv pentru respingere.");
      return;
    }
    try {
      await eventsApi.reject(event.id, rejectionReason);
      toast.success("Eveniment respins.");
      setEvent(prev => prev ? { ...prev, status: 'rejected', rejectionReason } : prev);
      onEventUpdated?.();
      setShowRejectModal(false);
    } catch (error) {
      toast.error("Eroare la respingerea evenimentului.");
    }
  };

  const handleResubmit = async () => {
    try {
        await eventsApi.resubmit(event.id);
        toast.success("Evenimentul a fost trimis pentru reevaluare.");
        // Optimistically update local state
        setEvent(prev => prev ? { ...prev, status: 'pending', rejectionReason: undefined } : prev);
        onEventUpdated?.();
    } catch (error) {
        toast.error("Eroare la retrimiterea evenimentului.");
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Use centralized API
      await eventsApi.delete(event.id);

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
      // Use centralized API
      await eventsApi.update(event.id, payload);

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

      <EventStatusBanners
        event={event}
        isAdmin={isAdmin}
        isOrganizer={isOrganizer}
        onApprove={handleApprove}
        onRejectClick={() => setShowRejectModal(true)}
        onResubmit={handleResubmit}
      />


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

              {/* Category Editing */}
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
                {/* Combined Date & Time */}
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
                            className="h-8 w-24 bg-white"
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
                        className={`h-full transition-all ${attendancePercentage >= 90
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
            {/* Description */}
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

            {(isOrganizer || isAdmin) && (
              <EventAttendees eventId={event.id} />
            )}

            {/* Comments Section */}
            <EventComments
              eventId={event.id}
              comments={comments}
              currentUser={currentUser}
              onCommentsUpdated={setComments}
            />
          </div>

          <EventSidebar
            event={event}
            isOrganizer={isOrganizer}
            onDeleteClick={() => setShowDeleteModal(true)}
            isDeleting={isDeleting}
          />
        </div>
      </div>

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

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Respinge Evenimentul</h3>
            <p className="text-sm text-gray-500">Te rugăm să specifici motivul respingerii pentru organizator.</p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Descrierea nu este suficient de clară..."
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>Anulează</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleReject}>Confirmă Respingerea</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}