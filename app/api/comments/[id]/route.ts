import { NextRequest, NextResponse } from "next/server"
import { readBackendError } from "@/server-utils/backend-error"
import { getRequestUser } from "@/server-utils/session"
import {
  deleteMockComment,
  getMockCommentById,
  updateMockComment,
} from "@/lib/mock-content-store"
import { normalizeComment } from "@/lib/content-normalizers"
import type Comment from "@/types/comment-types"
import type { UpdateCommentInput } from "@/types/comment-types"
import { parsePositiveInt } from "@/server-utils/ids"

function notFoundResponse() {
  return NextResponse.json({ error: "Comment not found" }, { status: 404 })
}

function unauthorizedResponse() {
  return NextResponse.json({ error: "You do not own this comment" }, { status: 403 })
}

function getPostIdFromRequest(req: NextRequest) {
  return req.nextUrl.searchParams.get("post_id") || ""
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const parsedCommentId = parsePositiveInt(id)
  const apiUrl = process.env.API_URL
  const useMockData = process.env.USE_MOCK_DATA === "true"
  const user = getRequestUser(req)
  const postId = getPostIdFromRequest(req)
  const parsedPostId = parsePositiveInt(postId)

  if (!parsedCommentId) {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 })
  }

  if (!parsedPostId) {
    return NextResponse.json({ error: "Invalid post_id" }, { status: 400 })
  }

  const safeCommentId = String(parsedCommentId)
  const safePostId = String(parsedPostId)

  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 })
  }

  try {
    const body = (await req.json()) as UpdateCommentInput

    if (!body.body?.trim()) {
      return NextResponse.json(
        { error: "Comment body is required" },
        { status: 400 }
      )
    }

    // TODO: Replace cookie-based ownership checks with verified backend/session auth.
    if (useMockData) {
      const existing = getMockCommentById(safeCommentId)
      if (!existing) {
        return notFoundResponse()
      }

      if (String(existing.expa_id) !== String(user.id)) {
        return unauthorizedResponse()
      }

      const comment = updateMockComment(safeCommentId, { body: body.body.trim() })

      return NextResponse.json({ success: true, comment })
    }

    if (!apiUrl) {
      return NextResponse.json(
        { error: "Missing API_URL" },
        { status: 500 }
      )
    }

    const commentsResponse = await fetch(`${apiUrl}/comments?post_id=${safePostId}`, {
      next: { revalidate: 0 },
    })

    if (!commentsResponse.ok) {
      const message = await readBackendError(commentsResponse)
      return NextResponse.json({ error: message }, { status: commentsResponse.status })
    }

    const commentsData = await commentsResponse.json().catch(() => null)
    const rawComments = Array.isArray(commentsData)
      ? commentsData
      : Array.isArray(commentsData?.comments)
        ? commentsData.comments
        : Array.isArray(commentsData?.data)
          ? commentsData.data
          : []

    const normalizedComments: Comment[] = rawComments
      .map((item: any, index: number) => normalizeComment(item, String(index + 1)))

    const existingComment = normalizedComments.find((comment) => comment.id === safeCommentId)

    if (!existingComment) {
      return notFoundResponse()
    }

    if (String(existingComment.expa_id) !== String(user.id)) {
      return unauthorizedResponse()
    }

    const response = await fetch(`${apiUrl}/comments/${safeCommentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: body.body.trim() }),
    })

    if (!response.ok) {
      const message = await readBackendError(response)
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const data = await response.json().catch(() => null)
    const comment = normalizeComment(data?.comment ?? data?.data ?? data, safeCommentId)

    return NextResponse.json({ success: true, comment })
  } catch {
    return NextResponse.json(
      { error: "Invalid comment update request" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const parsedCommentId = parsePositiveInt(id)
  const apiUrl = process.env.API_URL
  const useMockData = process.env.USE_MOCK_DATA === "true"
  const user = getRequestUser(req)
  const postId = getPostIdFromRequest(req)
  const parsedPostId = parsePositiveInt(postId)

  if (!parsedCommentId) {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 })
  }

  if (!parsedPostId) {
    return NextResponse.json({ error: "Invalid post_id" }, { status: 400 })
  }

  const safeCommentId = String(parsedCommentId)
  const safePostId = String(parsedPostId)

  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 })
  }

  // TODO: Replace cookie-based ownership checks with verified backend/session auth.
  if (useMockData) {
    const existing = getMockCommentById(safeCommentId)
    if (!existing) {
      return notFoundResponse()
    }

    if (String(existing.expa_id) !== String(user.id)) {
      return unauthorizedResponse()
    }

    deleteMockComment(safeCommentId)

    return NextResponse.json({ success: true })
  }

  if (!apiUrl) {
    return NextResponse.json(
      { error: "Missing API_URL" },
      { status: 500 }
    )
  }

  try {
    const commentsResponse = await fetch(`${apiUrl}/comments?post_id=${safePostId}`, {
      next: { revalidate: 0 },
    })

    if (!commentsResponse.ok) {
      const message = await readBackendError(commentsResponse)
      return NextResponse.json({ error: message }, { status: commentsResponse.status })
    }

    const commentsData = await commentsResponse.json().catch(() => null)
    const rawComments = Array.isArray(commentsData)
      ? commentsData
      : Array.isArray(commentsData?.comments)
        ? commentsData.comments
        : Array.isArray(commentsData?.data)
          ? commentsData.data
          : []

    const normalizedComments: Comment[] = rawComments
      .map((item: any, index: number) => normalizeComment(item, String(index + 1)))

    const existingComment = normalizedComments.find((comment) => comment.id === safeCommentId)

    if (!existingComment) {
      return notFoundResponse()
    }

    if (String(existingComment.expa_id) !== String(user.id)) {
      return unauthorizedResponse()
    }

    const response = await fetch(`${apiUrl}/comments/${safeCommentId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const message = await readBackendError(response)
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Invalid comment delete request" },
      { status: 400 }
    )
  }
}
