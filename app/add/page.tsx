"use client"

import { useState } from "react"

export default function BlogCreateForm() {

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [author, setAuthor] = useState("")
  const [loading, setLoading] = useState(false)

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
        author
      })
    })

    const data = await res.json()

    setLoading(false)

    if (data.success) {
      alert("Post created!")

      setTitle("")
      setBody("")
      setAuthor("")
    } else {
      alert(data.error || "Something went wrong")
    }
  }

  return (
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
            placeholder="Author"
            className="w-full border p-2 rounded"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
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
            onClick={() => window.history.back()}
          >
            Back
          </button>

        </form>
      </div>
    </main>
  )
}