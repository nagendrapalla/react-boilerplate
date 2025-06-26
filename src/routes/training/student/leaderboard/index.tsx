import LeaderBoard from '@/domains/leader-board'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/training/student/leaderboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LeaderBoard />
}
