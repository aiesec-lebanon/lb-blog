import Post from "@/types/post-types"
import Comment from "@/types/comment-types"

function hashString(value: string) {
  let hash = 0

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }

  return Math.abs(hash).toString(36)
}

function syntheticPostId(item: any) {
  const seed = [
    item?.created_at,
    item?.timestamp,
    item?.title,
    item?.body,
    item?.username,
    item?.author,
  ]
    .filter(Boolean)
    .join("|")

  return seed ? `post_${hashString(seed)}` : ""
}

function syntheticCommentId(item: any) {
  const seed = [
    item?.post_id,
    item?.postId,
    item?.created_at,
    item?.timestamp,
    item?.body,
    item?.username,
    item?.author,
  ]
    .filter(Boolean)
    .join("|")

  return seed ? `comment_${hashString(seed)}` : ""
}

export function normalizePost(item: any, fallbackId?: string): Post {
  const createdAt = item?.created_at || item?.timestamp || new Date().toISOString()
  const username = item?.username || item?.author || item?.full_name || ""
  const expaId = String(item?.expa_id ?? item?.expaId ?? item?.user_id ?? "")
  const id = String(item?.id ?? item?.post_id ?? syntheticPostId(item) ?? fallbackId ?? "")

  return {
    id,
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
  const id = String(item?.id ?? item?.comment_id ?? syntheticCommentId(item) ?? fallbackId ?? "")

  return {
    id,
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
