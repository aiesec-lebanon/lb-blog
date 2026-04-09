import { NextRequest, NextResponse } from "next/server"
import { readBackendError } from "@/server-utils/backend-error"
import { getRequestUser } from "@/server-utils/session"
import {
  deleteMockComment,
  getMockCommentById,
  updateMockComment,
} from "@/lib/mock-content-store"
import type { UpdateCommentInput } from "@/types/comment-types"
import { parsePositiveInt } from "@/server-utils/ids"

function notFoundResponse() {
  return NextResponse.json({ error: "Comment not found" }, { status: 404 })
}

function unauthorizedResponse() {
  return NextResponse.json({ error: "You do not own this comment" }, { status: 403 })
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

  if (!parsedCommentId) {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 })
  }

  const safeCommentId = String(parsedCommentId)

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

    await response.json().catch(() => null)

    return NextResponse.json({ success: true })
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

  if (!parsedCommentId) {
    return NextResponse.json({ error: "Invalid comment id" }, { status: 400 })
  }

  const safeCommentId = String(parsedCommentId)

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
