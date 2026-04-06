"use client"

import { useEffect, useState } from "react"

export default function BlogCreateForm() {

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [author, setAuthor] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        body,
        author: author.trim() || "Anonymous"
      })
    })

    const data = await res.json()

    setLoading(false)

    if (data.success) {
      setToast({ message: "Post created!", type: "success" })

      setTitle("")
      setBody("")
      setAuthor("")
    } else {
      setToast({ message: data.error || "Something went wrong", type: "error" })
    }
  }

  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(() => {
      if (toast.type === "success") {
        window.location.href = "/"
      } else {
        setToast(null)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [toast])

  return (
    <>
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          
          {/* 🔥 Dark overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* 🔥 Modal */}
          <div className={`
            relative z-10
            px-6 py-5 rounded-2xl
            backdrop-blur-xl
            border border-white/20
            shadow-2xl
            max-w-sm w-full text-center
            animate-in fade-in zoom-in-95
            ${toast.type === "success"
              ? "bg-white text-green-900"
              : "bg-white text-red-900"}
          `}>
            <p className="font-semibold text-lg">
              {toast.message}
            </p>
          </div>

        </div>
      )}


      <main className="max-w-xl mx-auto">
        <div className="
          bg-white/40 
          backdrop-blur-lg 
          border border-white/20 
          rounded-2xl 
          shadow-xl 
          p-6
        ">

          <h1 className="text-2xl font-bold mb-6">
            Create Blog Post
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              placeholder="Title"
              className="w-full border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
            />

            <textarea
              placeholder="Body"
              className="w-full border p-2 rounded"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Author (Optional)"
              className="w-full border p-2 rounded"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded"
            >
              {loading ? "Publishing..." : "Publish"}
            </button>

            {/* Back button */}
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              // add padding to the left of the back button
              style={{ marginLeft: "20px" }}
              onClick={() => window.location.href = "/"}
            >
              Back
            </button>

          </form>
        </div>
      </main>
    </>
  )
}