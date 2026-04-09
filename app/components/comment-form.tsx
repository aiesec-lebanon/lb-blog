"use client"

import { useState } from "react"
import { useAuth } from "../context/auth-context"
import { ApiClientError, createComment } from "@/lib/api-client"

type Props = {
  postId: string
  onCreated: () => Promise<void> | void
}

export default function CommentForm({ postId, onCreated }: Props) {
  const { user } = useAuth()
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) {
      setError("Sign in to add comments.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await createComment({
        post_id: postId,
        expa_id: String(user.id),
        username: user.username || "",
        body: body.trim(),
      })

      setBody("")
      await onCreated()
    } catch (requestError) {
      const message = requestError instanceof ApiClientError
        ? requestError.message
        : "Unable to add the comment"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white/78 backdrop-blur-lg p-5 shadow-xl ring-1 ring-black/10 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900">Add a comment</h2>
      <p className="mt-1 text-sm text-gray-500">Share a quick thought about this post.</p>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>}

      {!user && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
          Sign in to leave a comment.
        </div>
      )}

      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30 disabled:bg-gray-100"
          placeholder="Write a comment..."
          disabled={!user || loading}
          required
        />

        <button
          type="submit"
          disabled={!user || loading}
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Posting..." : "Post comment"}
        </button>
      </form>
    </div>
  )
}
