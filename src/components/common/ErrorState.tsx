import { TriangleAlert } from 'lucide-react'

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="state state-error" role="alert">
      <TriangleAlert size={20} />
      <span>{message}</span>
    </div>
  )
}
