"use client"

import { useEffect, useState } from "react"
import Masonry from "react-masonry-css"
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

  useEffect(()=>{
    loadPosts()
  },[])

  useEffect(()=>{
    if(inView) loadPosts()
  },[inView])

  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    800: 2,
    500: 1
  }

  return (
    <div className="max-w-7xl mx-auto px-4">

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex gap-4"
        columnClassName="flex flex-col gap-4"
      >

        {posts.map((post,i)=>(
          <BlogCard key={i} post={post}/>
        ))}

        {loading &&
          Array.from({length:4}).map((_,i)=>(
            <SkeletonCard key={i}/>
          ))
        }

      </Masonry>

      <div ref={ref} className="h-10"></div>

    </div>
  )
}