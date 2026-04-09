"use client"

import { usePathname, useRouter } from "next/navigation"

export default function CreateButton() {

  const router = useRouter()
  const pathname = usePathname()

  if (pathname === "/posts/new" || pathname === "/add") {
    return null
  }

  return (
    <button
      onClick={() => router.push("/posts/new")}
      className="
        fixed 
        top-[14vh]
        right-3
        sm:right-4
        md:top-[12vh]
        md:right-10
        z-50
        bg-black 
        text-white 
        text-sm
        px-3 
        py-2 
        rounded-lg 
        shadow-md 
        hover:scale-105 
        transition
      "
    >
      + Create
    </button>
  )
}