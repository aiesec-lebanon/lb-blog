import { google } from "googleapis"
import BlogPost from "../types/blog-post"

function convertDriveLink(url: string) {
  if (!url) return ""

  const match = url.match(/\/d\/(.*?)\//)
  if (!match) return url

  return `https://drive.google.com/thumbnail?id=${match[1]}`
}

export async function getBlogs() {

  const sheets = google.sheets({
    version: "v4",
    auth: process.env.GOOGLE_API_KEY
  })

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: "Sheet1!A:E"
  })

  const rows = response.data.values?.slice(1) || []

  const blogs: BlogPost[] = rows.map((row) => ({
    timestamp: row[0],
    title: row[1],
    body: row[2],
    image: convertDriveLink(row[3]),
    author: row[4]
  }))

  return blogs.sort(
    (a,b) =>
      new Date(b.timestamp).getTime() -
      new Date(a.timestamp).getTime()
  )
}