"use client"

import { useMemo, useState } from "react"
import Comment from "@/types/comment-types"
import { ApiClientError, deleteComment, updateComment } from "@/lib/api-client"
import { formatDateTime } from "../lib/utils"

type Props = {
  comment: Comment
  canEdit: boolean
  onChanged: () => Promise<void> | void
}

export default function CommentItem({ comment, canEdit, onChanged }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(comment.body)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState("")

  const displayDate = useMemo(() => formatDateTime(comment.updated_at || comment.created_at), [comment.updated_at, comment.created_at])

  async function handleSave() {
    setSaving(true)
    setError("")

    try {
      await updateComment(comment.id, comment.post_id, {
        body: draft.trim(),
      })
      setIsEditing(false)
      await onChanged()
    } catch (requestError) {
      const message = requestError instanceof ApiClientError
        ? requestError.message
        : "Unable to update the comment"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this comment?")

    if (!confirmed) {
      return
    }

    setRemoving(true)
    setError("")

    try {
      await deleteComment(comment.id, comment.post_id)
      await onChanged()
    } catch (requestError) {
      const message = requestError instanceof ApiClientError
        ? requestError.message
        : "Unable to delete the comment"
      setError(message)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <article className="rounded-2xl bg-white/80 p-4 shadow-lg ring-1 ring-black/10 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{comment.username}</p>
          <p className="mt-1 text-xs text-gray-500">{displayDate}</p>
        </div>

        {canEdit && !isEditing && (
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 disabled:opacity-60"
              onClick={handleDelete}
              disabled={removing}
            >
              {removing ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{error}</div>}

      {isEditing ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:bg-gray-400"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
              onClick={() => {
                setDraft(comment.body)
                setIsEditing(false)
                setError("")
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-700">{comment.body}</p>
      )}
    </article>
  )
}
