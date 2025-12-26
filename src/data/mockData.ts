import type { User, Notification } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Andrei Popescu',
  email: 'andrei.popescu@unibuc.ro',
  role: 'organizer',
};

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Reminder: Eveniment mâine',
    message: 'Workshop: Dezvoltare Web cu React și TypeScript începe mâine la 14:00',
    date: new Date(2025, 10, 21),
    read: false,
    eventId: '2',
  },
  {
    id: '2',
    type: 'update',
    title: 'Actualizare eveniment',
    message: 'Locația pentru Seminar: Carieră în Tech a fost modificată',
    date: new Date(2025, 10, 19),
    read: false,
    eventId: '4',
  },
  {
    id: '3',
    type: 'event',
    title: 'Eveniment nou',
    message: 'A fost adăugat un nou eveniment: Workshop: Design Thinking și Inovație',
    date: new Date(2025, 10, 18),
    read: true,
    eventId: '7',
  },
];
