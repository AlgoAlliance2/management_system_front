import { ShieldAlert, X } from "lucide-react";
import { Button } from "../ui/button";
import type { Event } from "../../types";

interface EventStatusBannersProps {
  event: Event;
  isAdmin: boolean;
  isOrganizer: boolean;
  onApprove: () => void;
  onRejectClick: () => void;
}

export function EventStatusBanners({
  event,
  isAdmin,
  isOrganizer,
  onApprove,
  onRejectClick,
}: EventStatusBannersProps) {
  return (
    <>
      {/* ADMIN REVIEW BANNER */}
      {event.status === "pending" && isAdmin && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4 sticky top-[64px] z-40">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-900">
                  Revizuire Necesară
                </h3>
                <p className="text-sm text-yellow-700">
                  Acest eveniment așteaptă aprobarea administratorului.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
                onClick={onRejectClick}
              >
                Respinge
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onApprove}
              >
                Aprobă Evenimentul
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ORGANIZER REJECTION NOTICE */}
      {event.status === "rejected" && isOrganizer && (
        <div className="bg-red-50 border-b border-red-200 p-4 sticky top-[64px] z-40">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <X className="h-6 w-6 text-red-600" />
              <h3 className="font-semibold text-red-900">Eveniment Respins</h3>
            </div>
            <p className="text-sm text-red-800">
              <strong>Motiv:</strong>{" "}
              {event.rejectionReason || "Niciun motiv specificat."}
            </p>
            <p className="text-xs text-red-600 mt-2">
              Te rugăm să editezi detaliile conform sugestiilor și să ne
              contactezi pentru reevaluare.
            </p>
          </div>
        </div>
      )}
    </>
  );
}