import PostForm from "../../../components/post-form"

type Props = {
  params: { id: string }
}

export default function EditPostPage({ params }: Props) {
  const { id } = params

  return <PostForm mode="edit" postId={id} />
}
