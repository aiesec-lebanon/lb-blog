"use client"

import { useRouter } from "next/navigation"
import { Anton } from "next/font/google"

const anton = Anton({
  subsets: ["latin"],
  weight: "400"
})

export default function Header() {

  const router = useRouter()

  // 🔧 Customize colors here
  const BLUE_COLOR = "#037EF3"
  const GREEN_COLOR = "#00c16e"

  return (
    <header className="relative py-6">

      {/* Center Title */}
      <div className={`text-center cursor-pointer ${anton.className}`} onClick={() => router.push("/")}>
        <h1 className="text-6xl font-extrabold tracking-wide">
          <span style={{ color: GREEN_COLOR }}>THE </span>
          <span style={{ color: BLUE_COLOR }}>BLUE </span>
          <span style={{ color: GREEN_COLOR }}>HOUSE</span>
        </h1>
      </div>

    </header>
  )
}