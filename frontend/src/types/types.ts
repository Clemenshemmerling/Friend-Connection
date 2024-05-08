export interface User {
  id: number;
  username: string;
  email: string;
  status?: string;
  avatar_url?: string;
  is_blocked?: boolean;
}

