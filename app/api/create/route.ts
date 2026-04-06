import BlogCreate from "@/types/blog-create"
import UserInfo from "@/types/user-types"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const data: BlogCreate = await req.json()

    if (!data.title || !data.body || !data.author) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const user: UserInfo = await JSON.parse(req.cookies.get("user")?.value || "{}")
    if (!user.id) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    const expa_id = user.full_name.trim() + "-" + user.id

    const API = process.env.API_URL

    const response = await fetch(`${API}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...data, expa_id })
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    )
  }
}