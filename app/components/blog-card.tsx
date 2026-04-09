"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import Post from "@/types/post-types"
import { ApiClientError, deletePost } from "@/lib/api-client"
import { clampBody, formatDate, truncate } from "../lib/utils"
import { useAuth } from "../context/auth-context"
import ConfirmModal from "./confirm-modal"

type Props = {
  post: Post
  onDeleted?: (postId: string) => void
}

export default function BlogCard({ post, onDeleted }: Props) {
  const { user } = useAuth()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const isOwner = useMemo(
    () => !!user && String(post.expa_id) === String(user.id),
    [post.expa_id, user]
  )

  async function handleDelete() {
    setDeleting(true)
    setError("")

    try {
      await deletePost(post.id)
      onDeleted?.(post.id)
    } catch (requestError) {
      const message = requestError instanceof ApiClientError
        ? requestError.message
        : "Unable to delete the post"
      setError(message)
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="
        bg-white/78 
        backdrop-blur-lg 
        ring-1 ring-black/10
        rounded-xl 
        shadow-[0_8px_24px_rgba(15,23,42,0.12)] 
        hover:shadow-[0_12px_30px_rgba(15,23,42,0.16)] 
        transition 
        p-4
        overflow-hidden
      ">

      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg break-words text-gray-900">
            {truncate(post.title, 120)}
          </h2>

          <div className="mt-1 text-xs text-gray-500">
            <span>{post.username || post.author}</span>
            <span> • </span>
            <span>{formatDate(post.created_at || post.timestamp || "")}</span>
          </div>
        </div>

        {isOwner && (
          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
            Yours
          </span>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <p className="mt-3 text-sm leading-6 text-gray-700">
        {clampBody(post.body, 180)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/posts/${post.id}`}
          className="rounded-lg bg-black px-3 py-2 text-xs font-medium text-white"
        >
          View
        </Link>

        {isOwner && (
          <>
            <Link
              href={`/posts/${post.id}/edit`}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700"
            >
              Edit
            </Link>

            <button
              type="button"
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 disabled:opacity-60"
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        )}
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete this post?"
        message="This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

    </div>
  )
}