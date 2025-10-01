export type Role = 'admin' | 'student';

export interface User {
  id: number;
  name: string;
  phone: string;
  role: Role;
  major?: string | null;
  rollno?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  hydrated: boolean;
}

export interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string | Date;
  place: string;
  user_id?: number | null;
}

export interface ClubItem {
  id: number;
  name: string;
  description?: string;
  admin_id: number;
  student_ids: number[];
  pending_ids: number[];
}

export interface AnnouncementItem {
  id: number;
  club_id: number;
  user_id: number;
  content: string;
  author?: User;
}

export interface MarketplaceItem {
  id: number;
  title: string;
  description?: string;
  price: number;
  category?: string;
  contact_phone?: string;
  contact_link?: string;
  image_url?: string;
  status: 'available' | 'sold';
  user_id: number;
}

export interface ClubMessage {
  id: number;
  club_id: number;
  user_id: number;
  content: string;
  author?: User;
  createdAt?: string;
}
