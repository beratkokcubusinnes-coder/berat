export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string | Date;
  // Optional profile fields
  bio?: string;
  location?: string;
  role?: string;
  avatar?: string;
  followers?: number;
  following?: number;
  promptsCount?: number;
  favoritesCount?: number;
}
