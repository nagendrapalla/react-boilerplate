// import { AllCourses } from '@/domains/all-courses'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/training/student/courses/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <>ALL</>
}
