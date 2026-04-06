import BlogPost from "../types/blog-post"
import { truncate, clampBody } from "../lib/utils"

export default function BlogCard({ post }: { post: BlogPost }) {

  return (
    <div className="
        bg-white/40 
        backdrop-blur-lg 
        border border-white/20 
        rounded-xl 
        shadow-md 
        hover:shadow-xl 
        hover:-translate-y-1
        transition 
        p-4
      ">

      <h2 className="font-semibold text-lg mb-2">
        {truncate(post.title,120)}
      </h2>

      {post.image && (
        <img
          src={post.image}
          className="rounded mb-3 w-full object-cover"
        />
      )}

      {post.body && (
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {post.body}
        </p>
      )}

      <div className="text-xs text-gray-500 mt-3">

        {post.author && (
          <span>{post.author}</span>
        )}

        {post.author && <span> • </span>}

        <span>
          {new Date(post.timestamp).toLocaleDateString()}
        </span>

      </div>

    </div>
  )
}