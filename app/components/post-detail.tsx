"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/auth-context"
import { ApiClientError, deletePost, getComments, getPost } from "@/lib/api-client"
import Comment from "@/types/comment-types"
import Post from "@/types/post-types"
import CommentForm from "./comment-form"
import CommentItem from "./comment-item"
import ConfirmModal from "./confirm-modal"
import { formatDate } from "../lib/utils"

type Props = {
  postId: string | undefined
}

export default function PostDetail({ postId }: Props) {
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const safePostId = useMemo(() => {
    const n = Number(postId)
    return Number.isInteger(n) && n > 0 ? String(n) : null
  }, [postId])

  const isOwner = !!post && !!user && String(post.expa_id) === String(user.id)

  async function loadData() {
    if (!safePostId) {
      setError("Invalid post id")
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")

    try {
      const [postResponse, commentsResponse] = await Promise.all([
        getPost(safePostId),
        getComments(safePostId),
      ])

      setPost(postResponse.post)
      setComments(commentsResponse.comments)
    } catch (requestError) {
      const message = requestError instanceof ApiClientError
        ? requestError.status === 404
          ? "Post not found"
          : requestError.message
        : "Unable to load the post"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [safePostId])

  async function refreshComments() {
    if (!safePostId) return

    const response = await getComments(safePostId)
    setComments(response.comments)
  }

  async function handleDeletePost() {
    if (!safePostId) return

    setDeleting(true)
    try {
      await deletePost(safePostId)
      router.push("/posts")
    } catch (requestError) {
      setError(requestError instanceof ApiClientError ? requestError.message : "Unable to delete the post")
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl px-3 py-12 text-center text-sm text-gray-500">Loading post...</div>
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-12">
        <div className="rounded-2xl bg-white/80 p-6 shadow-xl ring-1 ring-black/10">
          <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
          <p className="mt-3 text-sm text-red-700">{error}</p>
          <Link className="mt-6 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white" href="/posts">
            Back to posts
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-3 py-8 sm:py-12">
      <article className="rounded-2xl bg-white/80 p-5 shadow-xl ring-1 ring-black/10 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              {post.username} • {formatDate(post.created_at)}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{post.title}</h1>
          </div>

          {isOwner && (
            <div className="flex flex-wrap gap-2">
              <Link href={`/posts/${post.id}/edit`} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 whitespace-pre-line text-base leading-7 text-gray-700">
          {post.body}
        </div>
      </article>

      <CommentForm postId={post.id} onCreated={refreshComments} />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
          <span className="text-sm text-gray-500">{comments.length} total</span>
        </div>

        {comments.length === 0 ? (
          <div className="rounded-2xl bg-white/80 p-5 text-sm text-gray-500 shadow-lg ring-1 ring-black/10">
            No comments yet.
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                canEdit={!!user && String(comment.expa_id) === String(user.id)}
                onChanged={refreshComments}
              />
            ))}
          </div>
        )}
      </section>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete this post?"
        message="This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDeletePost}
        onCancel={() => setShowDeleteModal(false)}
      />
    </main>
  )
}
