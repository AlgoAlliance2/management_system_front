import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Calendar,
  BarChart2,
  ShieldCheck,
  Activity,
  Search,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import type { Event, User, UserRole } from "../types";
import { isFuture } from "date-fns";
import { usersApi } from "../lib/api";
import { useNavigate } from "react-router-dom"; // Need navigation

interface AdminPanelProps {
  events: Event[];
  user: User | null;
}

export function AdminPanel({ events, user }: AdminPanelProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const pendingEvents = events.filter(e => e.status === 'pending');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const data = await usersApi.getAll();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
        toast.error("Nu s-au putut încărca utilizatorii.");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter, itemsPerPage]);

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-500">Acces interzis. Nu aveți drepturi de administrator.</div>;
  }

  const totalEvents = events.length;
  const activeEvents = events.filter(e => isFuture(new Date(e.date))).length;
  const totalAttendees = events.reduce((acc, curr) => acc + curr.attendees, 0);

  const categories = events.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const previousUsers = [...users];
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
      await usersApi.updateRole(userId, newRole);
      toast.success(`Rolul utilizatorului a fost schimbat în ${newRole}`);
    } catch (error) {
      setUsers(previousUsers);
      toast.error("Eroare la actualizarea rolului.");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panou Administrator</h1>
          <p className="text-gray-500">Privire de ansamblu asupra întregii platforme.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" /> Mod Admin
          </div>
        </div>
      </div>

      {pendingEvents.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-700">
                <FileText className="h-5 w-5" />
                <CardTitle>În Așteptarea Aprobării ({pendingEvents.length})</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingEvents.map(event => (
                <div key={event.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold line-clamp-1">{event.title}</h4>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Org: {event.organizer}</p>
                  <p className="text-xs text-gray-400 mb-4">{new Date(event.date).toLocaleDateString()}</p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    Revizuiește Evenimentul
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ... stats cards (same as before) ... */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evenimente Totale</CardTitle>
            <BarChart2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evenimente Active</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Înscrieri</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Categorie</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{topCategory ? topCategory[0] : "-"}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-blue-600" />
              <CardTitle>Gestiune Utilizatori</CardTitle>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Caută după nume sau email..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(val) => setRoleFilter(val as UserRole | "all")}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filtrează Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate Rolurile</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="organizer">Organizator</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nume</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rol curent</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {isLoadingUsers ? (
                    <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>
                  ) : paginatedUsers.length > 0 ? (
                    paginatedUsers.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">{u.name}</td>
                        <td className="p-4 align-middle">{u.email}</td>
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                            ${u.role === 'admin' ? 'bg-red-100 text-red-800' :
                              u.role === 'organizer' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'}`}>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Select
                            value={u.role}
                            onValueChange={(val) => handleRoleChange(u.id, val as UserRole)}
                            disabled={u.id === user?.id}
                          >
                            <SelectTrigger className="w-[130px] ml-auto h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="organizer">Organizator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">Nu am găsit utilizatori.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rânduri pe pagină:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(val) => setItemsPerPage(Number(val))}>
                <SelectTrigger className="h-8 w-[70px]"><SelectValue placeholder={itemsPerPage} /></SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 50].map((pageSize) => (<SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}