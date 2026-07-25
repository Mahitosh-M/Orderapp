import { Inbox } from 'lucide-react'

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty-state">
      <Inbox size={34} />
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  )
}
