export default function SkeletonCard() {

  return (
    <div className="bg-gray-100 rounded-xl p-4 animate-pulse">

      <div className="h-5 bg-gray-300 rounded mb-3"></div>

      <div className="h-40 bg-gray-300 rounded mb-3"></div>

      <div className="h-4 bg-gray-300 rounded mb-2"></div>

      <div className="h-4 bg-gray-300 rounded w-2/3"></div>

    </div>
  )
}