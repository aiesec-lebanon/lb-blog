import Post, { CreatePostInput, UpdatePostInput } from "@/types/post-types"
import Comment, { CreateCommentInput, UpdateCommentInput } from "@/types/comment-types"
import type { ApiErrorResponse } from "@/types/post-types"

export class ApiClientError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiClientError"
    this.status = status
  }
}

type ApiResponse<T> = T & Partial<ApiErrorResponse>

function isValidPositiveIntString(value: string) {
  if (!value) {
    return false
  }

  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  })

  const data = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (!response.ok) {
    throw new ApiClientError(
      data?.error || `Request failed with status ${response.status}`,
      response.status
    )
  }

  return (data || ({} as T)) as T
}

export async function getPosts(page = 0, limit = 25) {
  return requestJson<{ posts: Post[]; hasMore: boolean }>(
    `/api/posts?page=${page}&limit=${limit}`
  )
}

export async function getPost(id: string) {
  if (!isValidPositiveIntString(id)) {
    throw new ApiClientError("Invalid post id", 400)
  }

  const data = await requestJson<Post | { post: Post }>(`/api/posts/${id}`)
  return (data as { post?: Post }).post ?? (data as Post)
}

export async function createPost(payload: CreatePostInput) {
  return requestJson<{ success: boolean; post?: Post }>("/api/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updatePost(id: string, payload: UpdatePostInput) {
  if (!isValidPositiveIntString(id)) {
    throw new ApiClientError("Invalid post id", 400)
  }

  return requestJson<{ success: boolean; post?: Post }>(`/api/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function deletePost(id: string) {
  if (!isValidPositiveIntString(id)) {
    throw new ApiClientError("Invalid post id", 400)
  }

  return requestJson<{ success: boolean }>(`/api/posts/${id}`, {
    method: "DELETE",
  })
}

export async function getComments(postId: string) {
  if (!isValidPositiveIntString(postId)) {
    throw new ApiClientError("Invalid post id", 400)
  }

  const data = await requestJson<Comment[] | { comments: Comment[] }>(
    `/api/comments?post_id=${encodeURIComponent(postId)}`
  )

  return Array.isArray(data) ? data : data.comments || []
}

export async function createComment(payload: CreateCommentInput) {
  return requestJson<{ success: boolean; comment?: Comment }>("/api/comments", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateComment(
  id: string,
  postId: string,
  payload: UpdateCommentInput
) {
  return requestJson<{ success: boolean; comment?: Comment }>(
    `/api/comments/${id}?post_id=${encodeURIComponent(postId)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  )
}

export async function deleteComment(id: string, postId: string) {
  return requestJson<{ success: boolean }>(
    `/api/comments/${id}?post_id=${encodeURIComponent(postId)}`,
    {
      method: "DELETE",
    }
  )
}
