import { useNavigate } from "react-router-dom";
import { X, Bell, Calendar, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import type { Notification } from "../types";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationsPanel({
  notifications,
  onClose,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsPanelProps) {
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "review_required":
        return <FileText className="h-5 w-5 text-purple-600" />;
      case "status_update":
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      case "reminder":
        return <Bell className="h-5 w-5 text-blue-600" />;
      case "update":
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case "event":
        return <Calendar className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleItemClick = (notification: Notification) => {
    if (notification.eventId) {
      navigate(`/event/${notification.eventId}`);
    }
    onNotificationClick(notification);
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h2>Notificări</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">
                  {unreadCount} notificări necitite
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {unreadCount > 0 && (
            <div className="border-b p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="w-full"
              >
                Marchează toate ca citite
              </Button>
            </div>
          )}

          <ScrollArea className="flex-1">
            {notifications.length > 0 ? (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? "bg-blue-50/50" : ""
                      }`}
                    onClick={() => handleItemClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm line-clamp-1 font-medium">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(notification.date, "dd MMM yyyy, HH:mm", {
                            locale: ro,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Bell className="h-16 w-16 text-gray-300 mb-4" />
                <h3>Nu ai notificări</h3>
                <p className="text-sm text-gray-500">
                  Vei primi notificări despre evenimente și actualizări aici
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}