import PostForm from "../../../components/post-form"

type Props = {
  params: Promise<{ id?: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params

  if (!id) {
    return <PostForm mode="edit" />
  }

  const parsedId = Number(id)

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return <PostForm mode="edit" />
  }

  return <PostForm mode="edit" postId={String(parsedId)} />
}
