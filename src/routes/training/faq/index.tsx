import FAQ from '@/domains/faq'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/training/faq/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FAQ />
}
