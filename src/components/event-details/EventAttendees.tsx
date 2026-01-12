import { useState, useEffect, useMemo } from "react";
import { Search, Users, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { eventsApi } from "../../lib/api";
import type { User } from "../../types";

interface EventAttendeesProps {
  eventId: string;
}

export function EventAttendees({ eventId }: EventAttendeesProps) {
  const [attendees, setAttendees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default smaller per page for this view

  useEffect(() => {
    const fetchAttendees = async () => {
      setIsLoading(true);
      try {
        const data = await eventsApi.getAttendees(eventId);
        setAttendees(data);
      } catch (error) {
        console.error("Failed to load attendees", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendees();
  }, [eventId]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredAttendees = useMemo(() => {
    return attendees.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [attendees, searchQuery]);

  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAttendees = filteredAttendees.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Lista Participanți ({attendees.length})
        </h2>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Caută nume sau email..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b bg-gray-50/50 hover:bg-gray-50/50">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Nume</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Rol</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Se încarcă...
                    </div>
                  </td>
                </tr>
              ) : paginatedAttendees.length > 0 ? (
                paginatedAttendees.map((u) => (
                  <tr key={u.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-3 align-middle font-medium">{u.name}</td>
                    <td className="p-3 align-middle text-gray-600">{u.email}</td>
                    <td className="p-3 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize
                        ${u.role === 'admin' ? 'bg-red-100 text-red-800' : 
                          u.role === 'organizer' ? 'bg-green-100 text-green-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    Nu s-au găsit participanți.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {filteredAttendees.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Arată:</span>
            <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(val) => setItemsPerPage(Number(val))}
            >
                <SelectTrigger className="h-8 w-[60px]">
                    <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
                {currentPage} / {totalPages}
            </span>
            <div className="flex gap-1">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}