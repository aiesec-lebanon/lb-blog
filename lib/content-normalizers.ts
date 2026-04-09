import Post from "@/types/post-types"
import Comment from "@/types/comment-types"

export function normalizePost(item: any, fallbackId?: string): Post {
  const createdAt = item?.created_at || item?.timestamp || new Date().toISOString()
  const username = item?.username || item?.author || item?.full_name || ""
  const expaId = String(item?.expa_id ?? item?.expaId ?? item?.user_id ?? "")

  return {
    id: String(item?.id ?? fallbackId ?? item?.post_id ?? ""),
    title: item?.title || "",
    body: item?.body || "",
    username,
    expa_id: expaId,
    created_at: createdAt,
    updated_at: item?.updated_at || undefined,
    image_url: item?.image_url || item?.image || undefined,
    timestamp: item?.timestamp || createdAt,
    author: item?.author || username,
    image: item?.image || item?.image_url || undefined,
  }
}

export function normalizeComment(item: any, fallbackId?: string): Comment {
  return {
    id: String(item?.id ?? fallbackId ?? item?.comment_id ?? ""),
    post_id: String(item?.post_id ?? item?.postId ?? ""),
    body: item?.body || "",
    username: item?.username || item?.author || "",
    expa_id: String(item?.expa_id ?? item?.expaId ?? item?.user_id ?? ""),
    created_at: item?.created_at || item?.timestamp || new Date().toISOString(),
    updated_at: item?.updated_at || undefined,
  }
}

export function buildPostListResponse(posts: Post[], limit: number) {
  return {
    posts,
    hasMore: posts.length === limit,
  }
}
