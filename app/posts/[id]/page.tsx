import PostDetail from "../../components/post-detail"

type Props = {
  params: { id: string }
}

export default function PostPage({ params }: Props) {
  const { id } = params

  return <PostDetail postId={id} />
}
