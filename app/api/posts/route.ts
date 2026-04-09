import { NextRequest, NextResponse } from "next/server"
import { readBackendError } from "@/server-utils/backend-error"
import { getRequestUser, getRequestUsername } from "@/server-utils/session"
import { createMockPost, listMockPosts } from "@/lib/mock-content-store"
import { buildPostListResponse, normalizePost } from "@/lib/content-normalizers"
import type { CreatePostInput } from "@/types/post-types"

function getPagination(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pageValue = Number(searchParams.get("page") || 0)
  const page = Number.isNaN(pageValue) || pageValue < 0 ? 0 : pageValue
  const limitValue = Number(searchParams.get("limit") || 25)
  const limit = Number.isNaN(limitValue) || limitValue <= 0 ? 25 : limitValue

  return { page, limit }
}

export async function GET(req: NextRequest) {
  const { page, limit } = getPagination(req)
  const apiUrl = process.env.API_URL
  const useMockData = process.env.USE_MOCK_DATA === "true"

  if (useMockData) {
    return NextResponse.json(listMockPosts(page, limit))
  }

  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL is not configured" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(`${apiUrl}/posts?page=${page}`, {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      const message = await readBackendError(response)
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const data = await response.json()
    const rawPosts = Array.isArray(data)
      ? data
      : Array.isArray(data?.posts)
        ? data.posts
        : Array.isArray(data?.data)
          ? data.data
          : []

    const posts = rawPosts.map((item: any, index: number) =>
      normalizePost(item, String(page * limit + index + 1))
    )

    return NextResponse.json(buildPostListResponse(posts, limit))
  } catch {
    return NextResponse.json(
      { error: "Unable to load posts from the backend" },
      { status: 502 }
    )
  }
}

export async function POST(req: NextRequest) {
  const apiUrl = process.env.API_URL
  const useMockData = process.env.USE_MOCK_DATA === "true"
  const user = getRequestUser(req)

  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 })
  }

  try {
    const body = (await req.json()) as CreatePostInput

    if (!body.title?.trim() || !body.body?.trim()) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      )
    }

    if (useMockData) {
      const post = createMockPost(
        {
          title: body.title.trim(),
          body: body.body.trim(),
          image_url: body.image_url?.trim() || undefined,
        },
        user
      )

      return NextResponse.json({ success: true, post }, { status: 201 })
    }

    if (!apiUrl) {
      return NextResponse.json(
        { error: "API_URL is not configured" },
        { status: 500 }
      )
    }

    const response = await fetch(`${apiUrl}/posts`, {
      method: "POST",
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
    const post = normalizePost(data?.post ?? data?.data ?? data, data?.id)

    return NextResponse.json({ success: true, post }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Invalid post request" },
      { status: 400 }
    )
  }
}
