export type Role = 'admin' | 'student';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  course?: string;
  yearLevel?: number;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logoUrl?: string;
  createdBy?: User | string;
  createdAt?: string;
}

export interface Member {
  _id: string;
  user: User;
  organization: string | Organization;
  position: string;
  status: 'pending' | 'active' | 'inactive';
  joinedAt: string;
}

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  organization: Organization | string;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number;
  posterUrl?: string;
  registrationCount?: number;
}

export interface Announcement {
  _id: string;
  title: string;
  body: string;
  organization?: Organization | string | null;
  createdBy: User | string;
  imageUrl?: string;
  pinned: boolean;
  createdAt: string;
}

export interface Registration {
  _id: string;
  user: User | string;
  event: EventItem;
  status: 'registered' | 'cancelled' | 'attended';
  registeredAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
