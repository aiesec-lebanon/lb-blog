import PostDetail from "../../components/post-detail"

type Props = {
  params: Promise<{ id?: string }>
}

export default async function PostPage({ params }: Props) {
  const { id } = await params

  if (!id) {
    return <PostDetail postId={undefined} />
  }

  const parsedId = Number(id)

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return <PostDetail postId={undefined} />
  }

  return <PostDetail postId={String(parsedId)} />
}
