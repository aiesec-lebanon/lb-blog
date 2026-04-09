"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/auth-context"
import { ApiClientError, createPost, getPost, updatePost } from "@/lib/api-client"

type PostFormMode = "create" | "edit"

type Props = {
  mode: PostFormMode
  postId?: string
}

export default function PostForm({ mode, postId }: Props) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [title, setTitle] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [body, setBody] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(mode === "edit")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loadedOwnerId, setLoadedOwnerId] = useState("")

  const isEditMode = useMemo(() => mode === "edit", [mode])
  const safePostId = useMemo(() => {
    if (!isEditMode || !postId) {
      return null
    }

    const parsed = Number(postId)
    return Number.isInteger(parsed) && parsed > 0 ? String(parsed) : null
  }, [isEditMode, postId])
  const isOwner = !isEditMode || !loadedOwnerId || Number(loadedOwnerId) === Number(user?.id || "")
  const canSubmit = !authLoading && !!user && !saving && !loading && isOwner && (!isEditMode || !!safePostId)

  useEffect(() => {
    let ignore = false

    async function loadExistingPost() {
      if (!isEditMode || !safePostId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getPost(safePostId)

        if (ignore) {
          return
        }

        setTitle(data.title)
        setBody(data.body)
        setAuthorName(data.author || "Anonymous")
        setImageUrl(data.image_url || "")
        setLoadedOwnerId(data.expa_id)
        setError("")
      } catch (requestError) {
        if (ignore) {
          return
        }

        const message = requestError instanceof ApiClientError
          ? requestError.message
          : "Unable to load the post"
        setError(message)
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadExistingPost()

    return () => {
      ignore = true
    }
  }, [isEditMode, safePostId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (!user) {
      setError("Sign in to create or edit posts.")
      return
    }

    setSaving(true)

    try {
      if (isEditMode) {
        if (!safePostId) {
          setError("Invalid post id")
          return
        }

        const response = await updatePost(safePostId, {
          title: title.trim(),
          body: body.trim(),
          image_url: imageUrl.trim() || undefined,
          author: authorName.trim() || "Anonymous",
          username: user.username || user.full_name?.trim() || "",
          expa_id: String(user.id),
        })

        setSuccess("Post updated successfully.")
        const targetId = response.post?.id || safePostId
        router.push(`/posts/${targetId}`)
        router.refresh()
        return
      }

      const response = await createPost({
        title: title.trim(),
        body: body.trim(),
        username: authorName.trim() || "Anonymous",
      })

      setSuccess("Post created successfully.")

      if (response.post?.id) {
        router.push(`/posts/${response.post.id}`)
      } else {
        router.push("/posts")
      }
    } catch (requestError) {
      const message = requestError instanceof ApiClientError
        ? requestError.message
        : "Something went wrong"
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return <div className="mx-auto max-w-xl px-3 py-12 text-center text-sm text-gray-500">Checking sign-in status...</div>
  }

  if (isEditMode && loading) {
    return <div className="mx-auto max-w-xl px-3 py-12 text-center text-sm text-gray-500">Loading post...</div>
  }

  if (isEditMode && !isOwner) {
    return (
      <div className="mx-auto max-w-xl px-3 py-10">
        <div className="rounded-2xl bg-white/80 p-6 shadow-xl ring-1 ring-black/10">
          <h1 className="text-2xl font-bold text-gray-900">Not authorized</h1>
          <p className="mt-3 text-sm text-gray-600">
            You can only edit posts that belong to your account.
          </p>
          <Link className="mt-6 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white" href="/posts">
            Back to posts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-3 py-6 sm:py-8">
      <div className="rounded-2xl bg-white/80 p-5 shadow-xl ring-1 ring-black/10 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Post" : "Create Post"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditMode ? "Update the post details below." : "Write a new post for the blog."}
            </p>
          </div>

          <Link href="/posts" className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
            Cancel
          </Link>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
            {success}
          </div>
        )}

        {!user && (
          <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>Sign in to create or edit posts.</span>
              <Link
                href="/login"
                className="inline-flex rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
              >
                Go to login
              </Link>
            </div>
          </div>
        )}

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30"
              maxLength={120}
              disabled={!canSubmit}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="body">
              Body
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={7}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30"
              disabled={!canSubmit}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="authorName">
              Author Name
            </label>
            <input
              id="authorName"
              type="text"
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30"
              maxLength={80}
              placeholder="Leave empty to publish as Anonymous"
              disabled={!canSubmit}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {saving ? (isEditMode ? "Saving..." : "Publishing...") : (isEditMode ? "Save changes" : "Publish")}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
