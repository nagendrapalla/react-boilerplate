import { NewTopics } from '@/domains/new-topics'
import { getAxios } from '@/shared/api/apiClient'
import { ScaleRotateTransition } from '@/shared/components/motion/transitions'
import { getItem } from '@/shared/utlis/localStorage'
// import { useAuthCheck } from '@/utils/useAuthCheck'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { z } from 'zod'

export const topicSchema = z.object({
  topicId: z.number(),
  topicName: z.string(),
  sequence: z.number(),
  completed: z.boolean(),
  scorePercent: z.number(),
  averageScorePercent: z.number(),
  metadata: z.string(),
})

export const courseTopicsResponseSchema = z
  .object({
    userId: z.number(),
    totalTopics: z.number(),
    completed: z.number(),
    incomplete: z.number(),
    courseId: z.number(),
    courseTitle: z.string(),
    topics: z.array(topicSchema),
  })
  .readonly()

export type ReadonlyTopic = Readonly<z.infer<typeof topicSchema>>
export type ReadonlyTopicsResponse = z.infer<typeof courseTopicsResponseSchema>

async function fetchTopics(courseId: string): Promise<ReadonlyTopicsResponse> {
  try {
    const userId = getItem('userId') as string
    const response = await getAxios(
      `/api/v0/courses/${courseId}/topics/user/${userId}`,
    )

    if (!response?.data) {
      throw new Error('No data received from the API')
    }
    const data = response.data
    console.log('API Response:', data) // Debug log
    return courseTopicsResponseSchema.parse(data)
  } catch (error) {
    console.error('Error fetching topics:', error)
    throw error
  }
}

export const Route = createFileRoute(
  '/training/student/all-courses/$courseId/chat-bot/',
)({
  // beforeLoad: ({ location }) => {
  //   useAuthCheck(location.pathname)
  // },
  component: RouteComponent,
  loader: ({ params }) => {
    return {
      topicsPromise: fetchTopics(params.courseId),
    }
  },
})

function RouteComponent() {
  const { topicsPromise } = Route.useLoaderData()
  const { courseId } = Route.useParams()

  const {
    data: topicsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['topics', courseId],
    queryFn: () => topicsPromise,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading topics: {error.message}</div>
  }

  if (!topicsResponse || !Array.isArray(topicsResponse.topics)) {
    return <div>No topics found</div>
  }

  return (
    <ScaleRotateTransition>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <NewTopics
          topics={topicsResponse.topics}
          courseId={topicsResponse.courseId}
          courseTitle={topicsResponse.courseTitle}
        />
      </motion.div>
    </ScaleRotateTransition>
  )
}
