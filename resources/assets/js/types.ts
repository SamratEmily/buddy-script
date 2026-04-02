export interface User {
  id: number | string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  avatar?: string;
  token?: string;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  replies?: Comment[];
}

export interface Post {
  id: number | string;
  content?: string;
  image_url?: string[];
  author: User;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  liked?: boolean;
  is_public?: boolean;
  comments?: Comment[];
}

export interface Story {
  id: string;
  imageUrl: string;
  user: User;
}

export default User;
