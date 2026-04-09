import Post from "@/types/post-types"

const TITLES = [
  "How to Run Better Team Standups",
  "7 Lessons From Organizing a Youth Summit",
  "Behind the Scenes: Building This Blog",
  "From Idea to Launch in One Weekend",
  "A Practical Guide to Cleaner UI States",
  "What We Learned From User Interviews",
  "Designing for Mobile-First Readers",
  "Why Content Pipelines Break (and How to Fix Them)",
  "Fast Wins for Frontend Performance",
  "The Checklist We Use Before Every Release"
]

const AUTHORS = [
  "Maya Haddad",
  "Karim Nader",
  "Lina Saad",
  "Omar Ghosn",
  "Nour Bazzi"
]

const OWNER_IDS = ["101", "202", "303", "404", "505"]

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=1200&q=80"
]

function buildMockPost(index: number): Post {
  const title = TITLES[index % TITLES.length]
  const username = AUTHORS[index % AUTHORS.length]
  const expaId = OWNER_IDS[index % OWNER_IDS.length]
  const createdAt = new Date(Date.now() - index * 1000 * 60 * 60 * 20).toISOString()
  const id = String(index + 1)

  return {
    id,
    created_at: createdAt,
    timestamp: createdAt,
    title: `${title} #${index + 1}`,
    body: "This is mock content used for frontend development. It helps validate spacing, typography, card height, and scrolling behavior before connecting to live backend data.",
    username,
    author: username,
    expa_id: expaId,
    image_url: index % 3 === 0 ? IMAGE_URLS[index % IMAGE_URLS.length] : undefined,
    image: index % 3 === 0 ? IMAGE_URLS[index % IMAGE_URLS.length] : undefined
  }
}

export const MOCK_BLOG_POSTS: Post[] = Array.from({ length: 80 }, (_, index) => buildMockPost(index))

