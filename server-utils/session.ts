import { NextRequest } from "next/server"
import UserInfo from "@/types/user-types"

export function getRequestUser(req: NextRequest): UserInfo | null {
  const rawUser = req.cookies.get("user")?.value

  if (!rawUser) {
    return null
  }

  try {
    const user = JSON.parse(rawUser) as UserInfo

    if (!user?.id) {
      return null
    }

    return {
      ...user,
      username: user.username || user.full_name?.trim() || "",
    }
  } catch {
    return null
  }
}

export function getRequestUsername(user: UserInfo | null) {
  return user?.username?.trim() || user?.full_name?.trim() || ""
}
