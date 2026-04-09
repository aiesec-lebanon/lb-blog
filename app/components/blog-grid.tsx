"use client"

import { useCallback, useEffect, useState } from "react"
import BlogCard from "./blog-card"
import SkeletonCard from "./skeleton-card"
import { useInView } from "react-intersection-observer"
import Post from "@/types/post-types"
import { ApiClientError, getPosts } from "@/lib/api-client"

export default function BlogGrid() {

  const [posts,setPosts] = useState<Post[]>([])
  const [page,setPage] = useState(0)
  const [hasMore,setHasMore] = useState(true)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")

  const { ref,inView } = useInView()

  const loadPosts = useCallback(async () => {

    if (loading || !hasMore) return

    setLoading(true)
    setError("")

    try {
      const data = await getPosts(page)
      setPosts((prev) => [...prev, ...data.posts])
      setHasMore(data.hasMore)
      setPage((prev) => prev + 1)
    } catch (requestError) {
      const message = requestError instanceof ApiClientError
        ? requestError.message
        : "Unable to load posts"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [hasMore, loading, page])

  useEffect(() => {
    if (inView) {
      void loadPosts()
    }
  }, [inView, loadPosts])

  const columns: Post[][] = [[], [], [], []]

  posts.forEach((post, index) => {
    columns[index % 4].push(post)
  })

  function handleDeleted(postId: string) {
    setPosts((prev) => prev.filter((post) => post.id !== postId))
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-3 md:px-0">

      {error && (
        <div className="mx-auto mb-4 max-w-3xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div
        className="
          grid w-full
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-4 
          lg:grid-cols-[5.25%_15.8%_15.8%_26.3%_15.8%_15.8%_5.25%]
        "
      >
        <div aria-hidden="true" />

        <div className="min-w-0 flex flex-col gap-4 px-0.5 sm:px-1 pt-2">
          {columns[0].map((post, i) => (
            <BlogCard key={post.id || `c1-${i}`} post={post} onDeleted={handleDeleted} />
          ))}
          {loading && <SkeletonCard />}
        </div>

        <div className="min-w-0 flex flex-col gap-4 px-0.5 sm:px-1 pt-2">
          {columns[1].map((post, i) => (
            <BlogCard key={post.id || `c2-${i}`} post={post} onDeleted={handleDeleted} />
          ))}
          {loading && <SkeletonCard />}
        </div>

        <div aria-hidden="true" />

        <div className="min-w-0 flex flex-col gap-4 px-0.5 sm:px-1 pt-2">
          {columns[2].map((post, i) => (
            <BlogCard key={post.id || `c3-${i}`} post={post} onDeleted={handleDeleted} />
          ))}
          {loading && <SkeletonCard />}
        </div>

        <div className="min-w-0 flex flex-col gap-4 px-0.5 sm:px-1 pt-2">
          {columns[3].map((post, i) => (
            <BlogCard key={post.id || `c4-${i}`} post={post} onDeleted={handleDeleted} />
          ))}
          {loading && <SkeletonCard />}
        </div>

        <div aria-hidden="true" />
      </div>

      <div ref={ref} className="h-10"></div>

    </div>
  )
}