import { NextRequest, NextResponse } from "next/server"
import { readBackendError } from "@/server-utils/backend-error"
import { getRequestUser, getRequestUsername } from "@/server-utils/session"
import {
  createMockComment,
  listMockComments,
} from "@/lib/mock-content-store"
import { normalizeComment } from "@/lib/content-normalizers"
import type { CreateCommentInput } from "@/types/comment-types"
import { parsePositiveInt } from "@/server-utils/ids"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get("post_id")
  const parsedPostId = parsePositiveInt(postId)
  const apiUrl = process.env.API_URL
  const useMockData = process.env.USE_MOCK_DATA === "true"

  if (!parsedPostId) {
    return NextResponse.json(
      { error: "Invalid post_id" },
      { status: 400 }
    )
  }

  const safePostId = String(parsedPostId)

  if (useMockData) {
    return NextResponse.json(listMockComments(safePostId))
  }

  if (!apiUrl) {
    return NextResponse.json(
      { error: "Missing API_URL" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(`${apiUrl}/comments?post_id=${safePostId}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      const message = await readBackendError(response)
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const data = await response.json().catch(() => null)
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

    return NextResponse.json(comments)
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
    const parsedPostId = parsePositiveInt(body.post_id)
    const username = getRequestUsername(user)
    const expaId = String(user.id)

    if (!parsedPostId || !body.body?.trim()) {
      return NextResponse.json(
        { error: "Valid post_id and body are required" },
        { status: 400 }
      )
    }

    if (useMockData) {
      const comment = createMockComment(
        {
          post_id: String(parsedPostId),
          body: body.body.trim(),
        },
        user
      )

      return NextResponse.json({ success: true, comment }, { status: 201 })
    }

    if (!apiUrl) {
      return NextResponse.json(
        { error: "Missing API_URL" },
        { status: 500 }
      )
    }

    const response = await fetch(`${apiUrl}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_id: String(parsedPostId),
        body: body.body.trim(),
        username,
        expa_id: expaId,
      }),
    })

    if (!response.ok) {
      const message = await readBackendError(response)
      return NextResponse.json({ error: message }, { status: response.status })
    }

    await response.json().catch(() => null)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Invalid comment request" },
      { status: 400 }
    )
  }
}
