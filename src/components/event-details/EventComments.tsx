import { useState } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { eventsApi } from "../../lib/api";
import type { Event, User } from "../../types";

interface EventCommentsProps {
    eventId: string;
    comments: NonNullable<Event["comments"]>;
    onCommentsUpdated: (newComments: NonNullable<Event["comments"]>) => void;
    currentUser: User | null;
}

export function EventComments({
    eventId,
    comments,
    onCommentsUpdated,
    currentUser,
}: EventCommentsProps) {
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const text = commentText.trim();
        if (!text) {
            toast.error("Scrie un comentariu înainte să trimiți.");
            return;
        }

        setIsSubmitting(true);

        try {
            const created = await eventsApi.addComment(eventId, text);

            const newComment = {
                id: created.id ?? `local-${Date.now()}`,
                userId: created.userId ?? currentUser?.id ?? "unknown",
                userName: created.userName ?? currentUser?.name ?? "Tu",
                date: created.date ? new Date(created.date) : new Date(),
                text: created.text ?? text,
            };

            onCommentsUpdated([newComment, ...comments]);
            setCommentText("");
            toast.success("Comentariu trimis!");
        } catch (err: any) {
            const msg =
                err.response?.data?.message || "Nu am putut trimite comentariul.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 border shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Întrebări și comentarii</h2>

            {comments.length > 0 ? (
                <div className="space-y-4 mb-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm text-blue-600 font-bold">
                                        {comment.userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{comment.userName}</div>
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
                <p className="text-gray-500 mb-6 italic">
                    Nu există comentarii încă. Fii primul care adaugă un comentariu!
                </p>
            )}

            <Separator className="my-4" />

            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                    Adaugă un comentariu sau o întrebare
                </label>
                <Textarea
                    placeholder="Scrie întrebarea sau comentariul tău aici..."
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={isSubmitting}
                />
                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Se trimite..." : "Trimite comentariu"}
                </Button>
            </div>
        </div>
    );
}