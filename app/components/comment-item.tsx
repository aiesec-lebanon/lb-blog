"use client"

import { useMemo, useState } from "react"
import Comment from "@/types/comment-types"
import { ApiClientError, deleteComment, updateComment } from "@/lib/api-client"
import { formatDate } from "../lib/utils"
import ConfirmModal from "./confirm-modal"

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const displayDate = useMemo(() => formatDate(comment.updated_at || comment.created_at), [comment.updated_at, comment.created_at])
  const isDeleted = comment.is_deleted === true

  async function handleSave() {
    setSaving(true)
    setError("")

    try {
      await updateComment(comment.id, {
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
    setRemoving(true)
    setError("")

    try {
      await deleteComment(comment.id)
      await onChanged()
    } catch (requestError) {
      const message = requestError instanceof ApiClientError
        ? requestError.message
        : "Unable to delete the comment"
      setError(message)
    } finally {
      setRemoving(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <article className="rounded-2xl bg-white/78 backdrop-blur-lg p-4 shadow-lg ring-1 ring-black/10 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{comment.username}</p>
          <p className="mt-1 text-xs text-gray-500">{displayDate}</p>
        </div>

        {isDeleted && (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
            Deleted
          </span>
        )}

        {canEdit && !isEditing && !isDeleted && (
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
              onClick={() => setShowDeleteModal(true)}
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
        <p className={`mt-4 whitespace-pre-line text-sm leading-6 ${isDeleted ? "italic text-gray-400" : "text-gray-700"}`}>
          {isDeleted ? "This comment was deleted." : comment.body}
        </p>
      )}

      <ConfirmModal
        open={showDeleteModal}
        title="Delete this comment?"
        message="This action cannot be undone."
        confirmText="Delete"
        loading={removing}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </article>
  )
}
