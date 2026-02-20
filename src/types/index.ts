export interface Post {
  id: string;
  created_at: string;
  title: string;
  content: string;
  category: "portfolio" | "food" | "drawing";
  image_urls: string[];
  thumbnail_urls: string[];
  location_name?: string;
  lat?: number;
  lng?: number;
  author_id: string;
  view_count: number;
  is_published: boolean;
}

export interface Profile {
  id: string;
  avatar_url: string | null;
  username: string;
  bio: string | null;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  content: string;
  nickname: string;
  password?: string;
  is_admin: boolean;
  created_at: string;
}

export type CategoryType = "all" | "portfolio" | "food" | "drawing";

export interface PostWithReadTime extends Post {
  readTime: string;
}
