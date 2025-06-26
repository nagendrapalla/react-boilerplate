import { ScaleRotateTransition } from '@/shared/components/motion/transitions'
import { StudentFeedback } from '@/domains/student-feedback'
import { getAxios } from '@/shared/api/apiClient'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { getItem } from '@/shared/utlis/localStorage'



const feedbackSchema = z.object({
  id: z.number(),
  comments: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  givenBy: z.string().nullable(),
})

const feedbackResponseSchema = z.array(feedbackSchema)
export type FeedbackResponseSchema = z.infer<typeof feedbackResponseSchema>

const courseSchema = z.array(
  z.object({
    courseId: z.number(),
    title: z.string(),
    description: z.string(),
    courseUrl: z.string(),
    coverImage: z.string().nullable(),
    hashValue: z.string().nullable(),
    createdBy: z.number(),
    completionStatus: z.number(),
    createdDate: z.string(),
    updatedBy: z.number().nullable(),
    updatedDate: z.string().nullable(),
  })
);

type CourseData = z.infer<typeof courseSchema>;



async function fetchCourse(
  userId: string,
): Promise<CourseData> {

  const response = await getAxios(`/api/v0/courses/user/${userId}`)
  return courseSchema.parse(response.data)
}

async function fetchFeedback(
  traineeId: string,
): Promise<FeedbackResponseSchema> {
  const response = await getAxios(`/api/v0/trainee/${traineeId}/feedback`)
  return feedbackResponseSchema.parse(response.data)
}

export const Route = createFileRoute(
  '/training/tutor/$courseId/trainee/$traineeId/',
)({
  component: Trainee,
  loader: ({ params }) => {
    return {
      feedbackPromise: fetchFeedback(params.traineeId),
      coursePromise: fetchCourse(getItem('userId') as string),
    }
  },
})

function Trainee() {
  const userId = getItem('userId') as string

  const { traineeId, courseId } = Route.useParams()
  const { data: feedback } = useSuspenseQuery({
    queryKey: ['feedback', traineeId],
    queryFn: () => fetchFeedback(traineeId),
  })
  const { data: course } = useSuspenseQuery({
    queryKey: ['course', courseId,traineeId],
    queryFn: () => fetchCourse(getItem('userId') as string),
  })

const courseTitle= course.find((course) => course.courseId === Number(courseId))?.title ??""

  if (!feedback) {
    throw new Error('feeback not found')
  }

  return (
    <ScaleRotateTransition>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <StudentFeedback feedback={feedback} traineeId={traineeId} courseId={courseId} courseTitle={courseTitle} userId={userId} />
      </motion.div>
    </ScaleRotateTransition>
  )
}
