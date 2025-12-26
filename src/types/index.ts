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

export type EventStatus = 'pending' | 'approved' | 'rejected';

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
  status: EventStatus; 
  rejectionReason?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  date: Date;
}

export type UserRole = 'student' | 'organizer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type NotificationType = 'reminder' | 'update' | 'event' | 'review_required' | 'status_update';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  eventId?: string;
}
