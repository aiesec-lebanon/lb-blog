"use client"

import { useRouter } from "next/navigation"

export default function CreateButton() {

  const router = useRouter()

  return (
    <button
      onClick={() => router.push("/add")}
      className="
        fixed 
        top-25vh 
        right-10
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