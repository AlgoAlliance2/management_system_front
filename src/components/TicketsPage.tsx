import { useState } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, MapPin, Download } from "lucide-react";
import { Button } from "./ui/button";

// Mock Data for Tickets
const MOCK_TICKETS = [
  {
    id: "t1",
    eventId: "e1",
    eventTitle: "Workshop React Avanzat",
    eventDate: new Date("2025-10-15T14:00:00"),
    location: "Sala C209",
    status: "valid" as const,
    qrCodeData: "ticket-t1-user-u1",
  },
  {
    id: "t2",
    eventId: "e2",
    eventTitle: "Sesiune Științifică Anuală",
    eventDate: new Date("2025-11-20T10:00:00"),
    location: "Aula Magna",
    status: "valid" as const,
    qrCodeData: "ticket-t2-user-u1",
  },
  {
    id: "t3",
    eventId: "e3",
    eventTitle: "Seara de Film Studențesc",
    eventDate: new Date("2025-09-10T20:00:00"),
    location: "Campus USV",
    status: "used" as const,
    qrCodeData: "ticket-t3-user-u1",
  },
    {
    id: "t4",
    eventId: "e4",
    eventTitle: "Hackathon 2024",
    eventDate: new Date("2024-05-10T09:00:00"),
    location: "Corp D",
    status: "expired" as const,
    qrCodeData: "ticket-t4-user-u1",
  }
];

export function TicketsPage() {
  const [tickets] = useState(MOCK_TICKETS);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Valid</Badge>;
      case "used":
        return <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Utilizat</Badge>;
      case "expired":
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Expirat</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Biletele Mele</h1>
        <p className="text-gray-500">
          Aici găsești codurile QR pentru accesul la evenimentele la care participi.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className={`overflow-hidden transition-all hover:shadow-md ${ticket.status === 'expired' ? 'opacity-70' : ''}`}>
            <CardHeader className="bg-gray-50/50 pb-4 border-b">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg leading-tight line-clamp-2">
                    {ticket.eventTitle}
                  </CardTitle>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Tichet #{ticket.id.toUpperCase()}
                  </p>
                </div>
                {getStatusBadge(ticket.status)}
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 flex flex-col items-center">
              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mb-6 shadow-sm">
                <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${ticket.qrCodeData}&color=${ticket.status === 'valid' ? '000000' : '888888'}`} 
                    alt="QR Code" 
                    className="w-40 h-40 object-contain mix-blend-multiply"
                />
              </div>

              {/* Event Details */}
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Dată și Oră</p>
                    <p className="font-medium text-gray-900">
                        {format(ticket.eventDate, "dd MMM yyyy, HH:mm", { locale: ro })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Locație</p>
                    <p className="font-medium text-gray-900">{ticket.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50/50 border-t p-4">
              <Button 
                variant="outline" 
                className="w-full" 
                disabled={ticket.status !== 'valid'}
                onClick={() => window.print()} // Simple print trigger for now
              >
                <Download className="mr-2 h-4 w-4" /> Descarcă / Printează
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}