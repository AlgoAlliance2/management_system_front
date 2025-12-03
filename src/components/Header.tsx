import { Bell, Search, User, Plus, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from './ui/sheet';

interface HeaderProps {
  onNavigate: (page: string) => void;
  onCreateEvent: () => void;
  currentUser: { name: string; email: string; role: string } | null;
  unreadNotifications: number;
  onLogout: () => void;
  onShowNotifications: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({
  onNavigate,
  onCreateEvent,
  currentUser,
  unreadNotifications,
  onLogout,
  onShowNotifications,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const menuItems = [
    { label: 'Acasă', page: 'home' },
    { label: 'Calendar', page: 'calendar' },
    { label: 'Evenimentele Mele', page: 'profile' },
  ];

  if (currentUser?.role === 'organizer' || currentUser?.role === 'admin') {
    menuItems.push({ label: 'Panou Organizator', page: 'organizer' });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo și Titlu */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
            <div className="hidden md:block">
              <h1 className="cursor-pointer" onClick={() => onNavigate('home')}>
                UniPlans
              </h1>
              <p className="text-xs text-gray-500">Universitatea din Suceava</p>
            </div>
          </div>

          {/* Căutare (Desktop) */}
          <div className="hidden flex-1 max-w-md lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Caută evenimente..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => (
              <Button
                key={item.page}
                variant="ghost"
                onClick={() => onNavigate(item.page)}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {currentUser && (
              <>
                {/* Create Event Button (Desktop) */}
                {(currentUser.role === 'organizer' || currentUser.role === 'admin') && (
                  <Button
                    onClick={onCreateEvent}
                    className="hidden md:flex bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Creează Eveniment
                  </Button>
                )}

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={onShowNotifications}
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>{currentUser.name}</div>
                      <div className="text-xs text-gray-500">{currentUser.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate('profile')}>
                      Profilul Meu
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onLogout}>Deconectare</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Caută evenimente..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                    />
                  </div>

                  {/* Mobile Create Event Button */}
                  {currentUser && (currentUser.role === 'organizer' || currentUser.role === 'admin') && (
                    <Button
                      onClick={onCreateEvent}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Creează Eveniment
                    </Button>
                  )}

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                      <Button
                        key={item.page}
                        variant="ghost"
                        onClick={() => onNavigate(item.page)}
                        className="justify-start"
                      >
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
