export default interface Comment {
  id: string;
  post_id: string;
  body: string;
  username: string;
  expa_id: string;
  created_at: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export interface CreateCommentInput {
  post_id: string;
  expa_id?: string;
  username?: string;
  body: string;
}

export interface UpdateCommentInput {
  body: string;
}

export interface CommentApiErrorResponse {
  error: string;
}
