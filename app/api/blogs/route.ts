import { NextRequest, NextResponse } from "next/server"
import BlogPost from "@/app/types/blog-post"

export async function GET(req: NextRequest) {

  try {
    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get("page") || 0)
    const limit = 10

    const API = process.env.API_URL

    const res = await fetch(`${API}/posts?page=${page}`, {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      )
    }

    const data = await res.json()

    // Transform to match frontend type
    const posts: BlogPost[] = data.map((item: any) => ({
      timestamp: item.created_at,
      title: item.title,
      body: item.body,
      image: item.image_url || undefined,
      author: item.author
    }))

    return NextResponse.json({
      posts,
      hasMore: posts.length === limit
    })

  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}