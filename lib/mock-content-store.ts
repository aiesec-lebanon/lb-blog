import UserInfo from "@/types/user-types"
import Post, { CreatePostInput, UpdatePostInput } from "@/types/post-types"
import Comment, { CreateCommentInput, UpdateCommentInput } from "@/types/comment-types"
import { MOCK_BLOG_POSTS } from "@/lib/mock-blog-posts"

type MockStore = {
  posts: Post[]
  comments: Comment[]
  nextPostId: number
  nextCommentId: number
}

type GlobalMockStore = typeof globalThis & {
  __mockContentStore?: MockStore
}

function createSeedComments(posts: Post[]) {
  const comments: Comment[] = []
  let counter = 1

  posts.slice(0, 12).forEach((post, index) => {
    comments.push({
      id: String(counter++),
      post_id: post.id,
      body: `First comment for ${post.title}`,
      username: "Community Member",
      expa_id: index % 2 === 0 ? "777" : post.expa_id,
      created_at: new Date(Date.now() - index * 1000 * 60 * 35).toISOString(),
    })

    comments.push({
      id: String(counter++),
      post_id: post.id,
      body: `Second comment for ${post.title}`,
      username: "Blueprint Editor",
      expa_id: post.expa_id,
      created_at: new Date(Date.now() - index * 1000 * 60 * 25).toISOString(),
    })
  })

  return comments
}

function seedStore(): MockStore {
  const posts = MOCK_BLOG_POSTS.map((post) => ({
    ...post,
    updated_at: post.updated_at || post.created_at,
  }))

  return {
    posts,
    comments: createSeedComments(posts),
    nextPostId: posts.length + 1,
    nextCommentId: 1000,
  }
}

function getStore() {
  const store = globalThis as GlobalMockStore

  if (!store.__mockContentStore) {
    store.__mockContentStore = seedStore()
  }

  return store.__mockContentStore
}

function nowIso() {
  return new Date().toISOString()
}

function normalizeOwner(user: UserInfo) {
  return {
    expa_id: user.id,
    username: user.username || user.full_name.trim(),
  }
}

export function listMockPosts(page: number, limit: number) {
  const store = getStore()
  const start = page * limit
  const end = start + limit

  return {
    posts: store.posts.slice(start, end),
    hasMore: end < store.posts.length,
  }
}

export function getMockPostById(id: string) {
  return getStore().posts.find((post) => post.id === id) || null
}

export function createMockPost(input: CreatePostInput, user: UserInfo) {
  const store = getStore()
  const owner = normalizeOwner(user)
  const selectedAuthor = input.author?.trim() || "Anonymous"
  const createdAt = nowIso()
  const post: Post = {
    id: String(store.nextPostId++),
    title: input.title,
    body: input.body,
    username: owner.username,
    expa_id: owner.expa_id,
    created_at: createdAt,
    updated_at: createdAt,
    timestamp: createdAt,
    author: selectedAuthor,
  }

  store.posts.unshift(post)

  return post
}

export function updateMockPost(id: string, input: UpdatePostInput) {
  const store = getStore()
  const post = store.posts.find((item) => item.id === id)

  if (!post) {
    return null
  }

  post.title = input.title
  post.body = input.body
  post.updated_at = nowIso()

  return post
}

export function deleteMockPost(id: string) {
  const store = getStore()
  const existingLength = store.posts.length
  store.posts = store.posts.filter((post) => post.id !== id)
  store.comments = store.comments.filter((comment) => comment.post_id !== id)

  return store.posts.length !== existingLength
}

export function listMockComments(postId: string) {
  return getStore().comments.filter((comment) => comment.post_id === postId)
}

export function getMockCommentById(id: string) {
  return getStore().comments.find((comment) => comment.id === id) || null
}

export function createMockComment(input: CreateCommentInput, user: UserInfo) {
  const store = getStore()
  const owner = normalizeOwner(user)

  const comment: Comment = {
    id: String(store.nextCommentId++),
    post_id: input.post_id,
    body: input.body,
    username: owner.username,
    expa_id: owner.expa_id,
    created_at: nowIso(),
  }

  store.comments.unshift(comment)

  return comment
}

export function updateMockComment(id: string, input: UpdateCommentInput) {
  const comment = getStore().comments.find((item) => item.id === id)

  if (!comment) {
    return null
  }

  comment.body = input.body
  comment.updated_at = nowIso()

  return comment
}

export function deleteMockComment(id: string) {
  const store = getStore()
  const existingLength = store.comments.length
  store.comments = store.comments.filter((comment) => comment.id !== id)

  return store.comments.length !== existingLength
}
