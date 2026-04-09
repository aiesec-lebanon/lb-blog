import { NextRequest, NextResponse } from "next/server"
import { readBackendError } from "@/server-utils/backend-error"
import { getRequestUser, getRequestUsername } from "@/server-utils/session"
import {
  deleteMockPost,
  getMockPostById,
  updateMockPost,
} from "@/lib/mock-content-store"
import { normalizePost } from "@/lib/content-normalizers"
import type { UpdatePostInput } from "@/types/post-types"
import type Post from "@/types/post-types"

function notFoundResponse() {
  return NextResponse.json({ error: "Post not found" }, { status: 404 })
}

function unauthorizedResponse() {
  return NextResponse.json({ error: "You do not own this post" }, { status: 403 })
}

async function findPostFromList(apiUrl: string, id: string) {
  const maxPages = 25

  for (let page = 0; page < maxPages; page += 1) {
    const response = await fetch(`${apiUrl}/posts?page=${page}`, {
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json().catch(() => null)
    const rawPosts = Array.isArray(data)
      ? data
      : Array.isArray(data?.posts)
        ? data.posts
        : Array.isArray(data?.data)
          ? data.data
          : []

    const posts: Post[] = rawPosts.map((item: any, index: number) =>
      normalizePost(item, String(page * 25 + index + 1))
    )

    const match = posts.find((post) => String(post.id) === String(id))

    if (match) {
      return match
    }

    if (posts.length < 25) {
      break
    }
  }

  return null
}

async function getBackendPostById(apiUrl: string, id: string) {
  const response = await fetch(`${apiUrl}/posts/${id}`, {
    next: { revalidate: 0 },
  })

  if (response.ok) {
    const data = await response.json().catch(() => null)
    return normalizePost(data?.post ?? data?.data ?? data, id)
  }

  if (response.status !== 404) {
    return null
  }

  return findPostFromList(apiUrl, id)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiUrl = process.env.API_URL
  const useMockData = process.env.USE_MOCK_DATA === "true"

  if (useMockData) {
    const post = getMockPostById(id)
    if (!post) {
      return notFoundResponse()
    }

    return NextResponse.json({ post })
  }

  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL is not configured" },
      { status: 500 }
    )
  }

  try {
    const post = await getBackendPostById(apiUrl, id)

    if (!post) {
      return notFoundResponse()
    }

    return NextResponse.json({ post })
  } catch {
    return NextResponse.json(
      { error: "Unable to load the post" },
      { status: 502 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiUrl = process.env.API_URL
  const useMockData = process.env.USE_MOCK_DATA === "true"
  const user = getRequestUser(req)

  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 })
  }

  try {
    const body = (await req.json()) as UpdatePostInput

    if (!body.title?.trim() || !body.body?.trim()) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      )
    }

    // TODO: Replace cookie-based ownership checks with verified backend/session auth.
    if (useMockData) {
      const existing = getMockPostById(id)
      if (!existing) {
        return notFoundResponse()
      }

      if (String(existing.expa_id) !== String(user.id)) {
        return unauthorizedResponse()
      }

      const post = updateMockPost(id, {
        title: body.title.trim(),
        body: body.body.trim(),
        image_url: body.image_url?.trim() || undefined,
      })

      return NextResponse.json({ success: true, post })
    }

    if (!apiUrl) {
      return NextResponse.json(
        { error: "API_URL is not configured" },
        { status: 500 }
      )
    }

    const existingPost = await getBackendPostById(apiUrl, id)

    if (!existingPost) {
      return notFoundResponse()
    }

    if (String(existingPost.expa_id) !== String(user.id)) {
      return unauthorizedResponse()
    }

    const response = await fetch(`${apiUrl}/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: body.title.trim(),
        body: body.body.trim(),
        image_url: body.image_url?.trim() || undefined,
        username: getRequestUsername(user),
        expa_id: user.id,
      }),
    })

    if (!response.ok) {
      const message = await readBackendError(response)
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const data = await response.json().catch(() => null)
    const post = normalizePost(data?.post ?? data?.data ?? data, id)

    return NextResponse.json({ success: true, post })
  } catch {
    return NextResponse.json(
      { error: "Invalid post update request" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiUrl = process.env.API_URL
  const useMockData = process.env.USE_MOCK_DATA === "true"
  const user = getRequestUser(req)

  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 })
  }

  // TODO: Replace cookie-based ownership checks with verified backend/session auth.
  if (useMockData) {
    const existing = getMockPostById(id)
    if (!existing) {
      return notFoundResponse()
    }

    if (String(existing.expa_id) !== String(user.id)) {
      return unauthorizedResponse()
    }

    deleteMockPost(id)

    return NextResponse.json({ success: true })
  }

  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL is not configured" },
      { status: 500 }
    )
  }

  try {
    const existingPost = await getBackendPostById(apiUrl, id)

    if (!existingPost) {
      return notFoundResponse()
    }

    if (String(existingPost.expa_id) !== String(user.id)) {
      return unauthorizedResponse()
    }

    const response = await fetch(`${apiUrl}/posts/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const message = await readBackendError(response)
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Invalid post delete request" },
      { status: 400 }
    )
  }
}
