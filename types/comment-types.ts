export default interface Comment {
  id: string;
  post_id: string;
  body: string;
  username: string;
  expa_id: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateCommentInput {
  post_id: string;
  body: string;
}

export interface UpdateCommentInput {
  body: string;
}
