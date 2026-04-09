import PostDetail from "../../components/post-detail"

type Props = {
  params: { id: string }
}

export default function PostPage({ params }: Props) {
  const { id } = params
  const parsedId = Number(id)

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return <PostDetail postId={undefined} />
  }

  return <PostDetail postId={String(parsedId)} />
}
