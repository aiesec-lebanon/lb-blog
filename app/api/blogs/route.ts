import { NextRequest, NextResponse } from "next/server"
import Post from "@/types/post-types"
import { MOCK_BLOG_POSTS } from "@/lib/mock-blog-posts"
import { normalizePost } from "@/lib/content-normalizers"

function getMockPage(page: number, limit: number) {
  const start = page * limit
  const end = start + limit
  const posts = MOCK_BLOG_POSTS.slice(start, end)

  return {
    posts,
    hasMore: end < MOCK_BLOG_POSTS.length
  }
}

export async function GET(req: NextRequest) {

  try {
    const { searchParams } = new URL(req.url)

    const pageValue = Number(searchParams.get("page") || 0)
    const page = Number.isNaN(pageValue) || pageValue < 0 ? 0 : pageValue
    const limit = 25

    const API = process.env.API_URL
    const useMockData = process.env.USE_MOCK_DATA === "true"

    if (useMockData || !API) {
      return NextResponse.json(getMockPage(page, limit))
    }

    const res = await fetch(`${API}/posts?page=${page}`, {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      return NextResponse.json(getMockPage(page, limit))
    }

    const data = await res.json()
    const items = Array.isArray(data) ? data : []

    const posts: Post[] = items.map((item: any, index: number) =>
      normalizePost(item, String(page * limit + index + 1))
    )

    return NextResponse.json({
      posts,
      hasMore: posts.length === limit
    })

  } catch (err) {
    const page = 0
    const limit = 25
    return NextResponse.json(getMockPage(page, limit))
  }
}