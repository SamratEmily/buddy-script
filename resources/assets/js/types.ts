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
  id: string;
  content?: string;
  imageUrl?: string;
  likes: Array<string>;
  comments: Comment[];
  user: User;
  createdAt: number;
  privacy?: 'public' | 'private';
}

export interface Story {
  id: string;
  imageUrl: string;
  user: User;
}

export default User;
