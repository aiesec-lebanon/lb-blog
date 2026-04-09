export default interface Post {
  id: string;
  title: string;
  body: string;
  username: string;
  expa_id: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  deleted?: boolean;
  image_url?: string;
  timestamp?: string;
  author?: string;
  image?: string;
}

export interface CreatePostInput {
  title: string;
  body: string;
  username?: string;
  author?: string;
  image_url?: string;
}

export interface UpdatePostInput {
  title: string;
  body: string;
  image_url?: string;
  username?: string;
  expa_id?: string;
}

export interface ApiErrorResponse {
  error: string;
}

export interface PostListResponse {
  posts: Post[];
  hasMore: boolean;
}
