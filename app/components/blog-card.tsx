import BlogPost from "../../types/blog-post"
import { truncate } from "../lib/utils"

export default function BlogCard({ post }: { post: BlogPost }) {

  return (
    <div className="
        bg-white/78 
        backdrop-blur-lg 
        ring-1 ring-black/10
        rounded-xl 
        shadow-[0_8px_24px_rgba(15,23,42,0.12)] 
        hover:shadow-[0_12px_30px_rgba(15,23,42,0.16)] 
        transition 
        p-4
        overflow-hidden
      ">

      <h2 className="font-semibold text-lg mb-2 break-words">
        {truncate(post.title,120)}
      </h2>

      {post.image && (
        <img
          src={post.image}
          className="block rounded mb-3 w-full object-cover"
          loading="lazy"
          alt={post.title}
        />
      )}

      {post.body && (
        <p className="text-sm text-gray-700 whitespace-pre-line break-words">
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