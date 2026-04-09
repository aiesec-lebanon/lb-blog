import PostForm from "../../../components/post-form"

type Props = {
  params: { id: string }
}

export default function EditPostPage({ params }: Props) {
  const { id } = params
  const parsedId = Number(id)

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return <PostForm mode="edit" />
  }

  return <PostForm mode="edit" postId={String(parsedId)} />
}
