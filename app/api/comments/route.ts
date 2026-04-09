import { NextRequest, NextResponse } from "next/server"
import { readBackendError } from "@/server-utils/backend-error"
import { getRequestUser, getRequestUsername } from "@/server-utils/session"
import {
  createMockComment,
  listMockComments,
} from "@/lib/mock-content-store"
import { normalizeComment } from "@/lib/content-normalizers"
import type { CreateCommentInput } from "@/types/comment-types"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get("post_id")
  const apiUrl = process.env.API_URL
  const useMockData = process.env.USE_MOCK_DATA === "true"

  if (!postId) {
    return NextResponse.json(
      { error: "post_id is required" },
      { status: 400 }
    )
  }

  if (useMockData) {
    return NextResponse.json({ comments: listMockComments(postId) })
  }

  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL is not configured" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(`${apiUrl}/comments?post_id=${postId}`, {
      next: { revalidate: 30 },
    })

    if (!response.ok) {
      const message = await readBackendError(response)
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const data = await response.json()
    const rawComments = Array.isArray(data)
      ? data
      : Array.isArray(data?.comments)
        ? data.comments
        : Array.isArray(data?.data)
          ? data.data
          : []

    const comments = rawComments.map((item: any, index: number) =>
      normalizeComment(item, String(index + 1))
    )

    return NextResponse.json({ comments })
  } catch {
    return NextResponse.json(
      { error: "Unable to load comments" },
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
    const body = (await req.json()) as CreateCommentInput

    if (!body.post_id?.trim() || !body.body?.trim()) {
      return NextResponse.json(
        { error: "post_id and body are required" },
        { status: 400 }
      )
    }

    if (useMockData) {
      const comment = createMockComment(
        {
          post_id: body.post_id.trim(),
          body: body.body.trim(),
        },
        user
      )

      return NextResponse.json({ success: true, comment }, { status: 201 })
    }

    if (!apiUrl) {
      return NextResponse.json(
        { error: "API_URL is not configured" },
        { status: 500 }
      )
    }

    const response = await fetch(`${apiUrl}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_id: body.post_id.trim(),
        body: body.body.trim(),
        username: getRequestUsername(user),
        expa_id: user.id,
      }),
    })

    if (!response.ok) {
      const message = await readBackendError(response)
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const data = await response.json().catch(() => null)
    const comment = normalizeComment(data?.comment ?? data?.data ?? data)

    return NextResponse.json({ success: true, comment }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Invalid comment request" },
      { status: 400 }
    )
  }
}
