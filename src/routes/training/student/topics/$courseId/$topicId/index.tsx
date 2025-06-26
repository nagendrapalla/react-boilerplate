import { createFileRoute } from '@tanstack/react-router'
import { Pdf } from '@/domains/topics'

export const Route = createFileRoute(
  '/training/student/topics/$courseId/$topicId/',
)({
  component: Pdf,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      initialPage: search.initialPage ? Number(search.initialPage) : 1,
    }
  },
})
