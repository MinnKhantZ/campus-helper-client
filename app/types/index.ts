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
