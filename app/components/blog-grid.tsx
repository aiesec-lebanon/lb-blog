"use client"

import { useEffect, useState } from "react"
import BlogCard from "./blog-card"
import SkeletonCard from "./skeleton-card"
import { useInView } from "react-intersection-observer"
import BlogPost from "../types/blog-post"

export default function BlogGrid() {

  const [posts,setPosts] = useState<BlogPost[]>([])
  const [page,setPage] = useState(0)
  const [hasMore,setHasMore] = useState(true)
  const [loading,setLoading] = useState(false)

  const { ref,inView } = useInView()

  async function loadPosts() {

    if (loading || !hasMore) return

    setLoading(true)

    const res = await fetch(`/api/blogs?page=${page}`)
    const data = await res.json()

    console.log(data.posts)

    setPosts(prev => [...prev,...data.posts])
    setHasMore(data.hasMore)
    setPage(prev => prev + 1)

    setLoading(false)
  }

  // useEffect(()=>{
  //   loadPosts()
  // },[])

  useEffect(()=>{
    if(inView) loadPosts()
  },[inView])

  const columns: BlogPost[][] = [[], [], [], []]

  posts.forEach((post, index) => {
    columns[index % 4].push(post)
  })

  return (
    <div className="w-full max-w-full overflow-x-hidden">

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

        <div className="min-w-0 flex flex-col gap-4 px-1">
          {columns[0].map((post, i) => (
            <BlogCard key={`c1-${i}`} post={post} />
          ))}
          {loading && <SkeletonCard />}
        </div>

        <div className="min-w-0 flex flex-col gap-4 px-1">
          {columns[1].map((post, i) => (
            <BlogCard key={`c2-${i}`} post={post} />
          ))}
          {loading && <SkeletonCard />}
        </div>

        <div aria-hidden="true" />

        <div className="min-w-0 flex flex-col gap-4 px-1">
          {columns[2].map((post, i) => (
            <BlogCard key={`c3-${i}`} post={post} />
          ))}
          {loading && <SkeletonCard />}
        </div>

        <div className="min-w-0 flex flex-col gap-4 px-1">
          {columns[3].map((post, i) => (
            <BlogCard key={`c4-${i}`} post={post} />
          ))}
          {loading && <SkeletonCard />}
        </div>

        <div aria-hidden="true" />
      </div>

      <div ref={ref} className="h-10"></div>

    </div>
  )
}