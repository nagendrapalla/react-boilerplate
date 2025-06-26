// import { CourseDetail } from '@/domains/course-details'
import { createFileRoute } from '@tanstack/react-router'
// import { z } from 'zod'
// import { getAxios } from '@/shared/api/apiClient'
// import { useQuery } from '@tanstack/react-query'
// import { ScaleRotateTransition } from '@/shared/components/motion/transitions'
// import { motion } from 'framer-motion'
// import { useAuthCheck } from '@/utils/useAuthCheck'

export const Route = createFileRoute('/training/student/courses/topics/')({
  component: RouteComponent1,
})

function RouteComponent1() {
  return <div>Hello "/student/courses/topics/"!</div>
}

// const topicSchema = z
//   .object({
//     id: z.number(),
//     name: z.string(),
//     description: z.string().optional(),
//     courseId: z.number(),
//     progress: z.number().optional().default(0),
//   })
//   .passthrough() // Allow additional fields

// const topicsResponseSchema = z
//   .object({
//     data: z.array(topicSchema),
//   })
//   .transform((res) => res.data)

// type Topic = z.infer<typeof topicSchema>
// type Topics = readonly Topic[]

// async function fetchTopics(courseId: string): Promise<Topics> {
//   const response = await getAxios(
//     `http://localhost:6003/trainings/api/v0/courses/${courseId}/topics`,
//   )
//   return topicsResponseSchema.parse(response)
// }

// export const Route = createFileRoute('/training/student/courses/topics/')({
//   beforeLoad: ({ location }) => {
//     useAuthCheck(location.pathname)
//   },
//   component: CourseContent,
//   validateParams: z.object({
//     courseId: z.string(),
//   }),
//   loader: ({ params }) => {
//     return {
//       topicsPromise: fetchTopics(params.courseId),
//     }
//   },
// })

// function CourseContent(): JSX.Element {
//   const { courseId } = Route.useParams()
//   const { data: topics } = useQuery({
//     queryKey: ['topics', courseId],
//     queryFn: () => fetchTopics(courseId),
//     suspense: true,
//   })

//   if (!topics) {
//     throw new Error('Topics not found')
//   }

//   return (
//     <ScaleRotateTransition>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2, duration: 0.5 }}
//       >
//         <CourseDetail topics={topics} />
//       </motion.div>
//     </ScaleRotateTransition>
//   )
// }
