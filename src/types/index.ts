export type EventCategory = 
  | 'conference'
  | 'workshop'
  | 'student-activity'
  | 'seminar'
  | 'sports'
  | 'cultural';

export interface CreateEventInput {
  title: string;
  category: EventCategory;
  description: string;
  date: string;
  time: string;
  location: string;
  maxAttendees: string; // Keeps input value as string
  imageUrl: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: EventCategory;
  organizer: string;
  organizerId: string;
  imageUrl?: string;
  attendees: number;
  maxAttendees?: number;
  isAttending?: boolean;
  isSaved?: boolean;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  date: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  avatar?: string;
}

export interface Notification {
  id: string;
  type: 'event' | 'reminder' | 'update';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  eventId?: string;
}
