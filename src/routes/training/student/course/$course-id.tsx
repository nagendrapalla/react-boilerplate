import { createFileRoute, Link } from '@tanstack/react-router'
import { getAxios, postAxios } from '@/shared/api/apiClient'
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ScaleRotateTransition } from '@/shared/components/motion/transitions'
import { z } from 'zod'
import { useState, useCallback, useLayoutEffect } from 'react'
import { getItem } from '@/shared/utlis/localStorage'
// import { getInitials } from '@/shared/utlis/getIntial'
// import { jsPDF } from 'jspdf'
// import { BackButton } from '@/shared/components/back-button'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
  ScrollArea,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'ti-react-template/components'
// import { Download } from 'lucide-react'
import { useRole, useUserName } from '@/domains/auth/store/authAtom'
import { Sparkles, AlertCircle } from 'lucide-react'
import { AIInsightsDialog } from "@/shared/components/ai-insights-dialog";
import { PerformanceInsightsCard } from "@/shared/components/performance-insights-card";

// Feedback schema definition
const feedbackSchema = z.object({
  id: z.number(),
  comments: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  givenBy: z.string().nullable(),
})

interface Course {
  courseId: number
  title: string
  description: string
  courseUrl: string
  coverImage: string
  category: string
  hashValue: string | null
  createdBy: number
  completionStatus: number
  createdDate: string
  updatedBy: number | null
  updatedDate: string | null
}

const feedbackResponseSchema = z.array(feedbackSchema)
type FeedbackResponseSchema = z.infer<typeof feedbackResponseSchema>

// Trainee schema definition
const traineeSchema = z
  .object({
    traineeName: z.string().optional().nullable(),
    traineeFullName: z.string().optional().nullable(),
    cohortName: z.string().optional(),
    rank: z.number().optional(),
    courseCompletion: z.string().optional(),
    totalScore: z.string().optional(),
    percentage: z.string().optional(),
  })
  .readonly()

type TraineeData = z.infer<typeof traineeSchema>

// Topic stats schema definition
const topicStatsSchema = z.object({
  userId: z.number(),
  totalTopics: z.number(),
  completed: z.number(),
  incomplete: z.number(),
  topics: z.array(
    z.object({
      topicId: z.number(),
      topicName: z.string(),
      completed: z.boolean(),
      scorePercent: z.number(),
      averageScorePercent: z.number(),
    }),
  ),
})

type TopicStatsData = z.infer<typeof topicStatsSchema>

// Cohort schema definition
const cohortSchema = z.array(
  z.object({
    id: z.number(),
    cohortName: z.string(),
  }),
)

type CohortData = z.infer<typeof cohortSchema>

// Search params schema
const searchSchema = z.object({
  title: z.string().optional(),
  courseId: z.string().optional(),
})

const leaderboardSchema = z.array(
  z.object({
    traineeName: z.string(),
    traineeFullName: z.string(),
    cohortName: z.string().nullable(),
    rank: z.number(),
    totalScore: z.string(),
    percentage: z.string().nullable(),
    completed: z.string(),
  }),
)

type leaderboardData = z.infer<typeof leaderboardSchema>

// Data fetching functions
async function fetchFeedback(): Promise<FeedbackResponseSchema> {
  const userId = getItem('userId') as number
  const response = await getAxios(`/api/v0/trainee/${userId}/feedback`)
  return feedbackResponseSchema.parse(response.data)
}

async function fetchTrainee(courseId: string): Promise<TraineeData> {
  const userId = getItem('userId') as number
  const response = await getAxios(
    `/api/v0/trainee/${userId}/courses/${courseId}/performanceDetails`,
  )
  return traineeSchema.parse(response.data)
}

async function fetchTopicStats(courseId: string): Promise<TopicStatsData> {
  const userId = getItem('userId') as number
  const response = await getAxios(`/api/v0/courses/${courseId}/topicstats/user/${userId}`)
  return topicStatsSchema.parse(response.data)
}

async function fetchCohorts(): Promise<CohortData> {
  const response = await getAxios(`/api/v0/cohorts`)
  return cohortSchema.parse(response.data)
}


async function fetchLeaderboard(courseId: string): Promise<leaderboardData> {
  try {
    const response = await getAxios(`/api/v0/trainee/leaderboard/courses/${courseId}`)
    return leaderboardSchema.parse(response.data)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    throw error
  }
}
const fetchCourses = async (): Promise<Course[]> => {
  try {
    const userId = getItem('userId')
    console.log('UserId from localStorage:', userId)
    const res = await getAxios(`/api/v0/courses/user/${userId}`)
    console.log('API Response:', res.data)

    // Check if the response has an error status or contains an Unauthorized error
    if (res.status >= 400 || (res.data && typeof res.data === 'object' && res.data.error === 'Unauthorized')) {
      throw {
        status: res.status,
        message: res.data.error || 'An error occurred',
        path: res.data.path,
        timestamp: res.data.timestamp
      }
    }

    return res.data
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error; // Re-throw to be caught by React Query
  }
}

export const Route = createFileRoute('/training/student/course/$course-id')({
  component: RouteComponent,
  validateSearch: searchSchema,
  loader: async ({
    params,
  }): Promise<{
    feedback: FeedbackResponseSchema
    trainee: TraineeData
    topicStats: TopicStatsData
    cohorts: CohortData
    courses: Course[]
  }> => {
    const courseId = params['course-id']
    console.log(courseId);

    // Prefetch all required data for the student feedback component
    // Using Promise.all to fetch data in parallel for efficiency
    const [feedback, trainee, topicStats, cohorts, courses] = await Promise.all([
      fetchFeedback(),
      fetchTrainee(courseId),
      fetchTopicStats(courseId),
      fetchCohorts(),
      fetchCourses(),
    ])

    return {
      feedback,
      trainee,
      topicStats,
      cohorts,
      courses,
    }
  },
})

function RouteComponent() {
  const name = useUserName()
  const role = useRole()
  const { 'course-id': courseId } = Route.useParams()
  const loaderData = Route.useLoaderData()
  const initialFeedback = loaderData.feedback as FeedbackResponseSchema
  const initialTrainee = loaderData.trainee as TraineeData
  const initialTopicStats = loaderData.topicStats as TopicStatsData
  const initialCohorts = loaderData.cohorts as CohortData
  const search = Route.useSearch()
  // Default title if not provided in search params
  // const courseTitle =
  //   typeof search.title === 'string' ? search.title : 'Progress Report'
  // Store courseId from search params for potential future use
  const searchCourseId =
    typeof search.courseId === 'string' ? search.courseId : ''

  // State variables
  const [isChangingCohort, setIsChangingCohort] = useState(false)
  const [topicFilter, _setTopicFilter] = useState<
    'all' | 'completed' | 'incomplete'
  >('all')
  const [showFullSummary, setShowFullSummary] = useState(false)

  const queryClient = useQueryClient()

  // Helper function to truncate text
  const truncateToWords = (
    str: string | null | undefined,
    numWords: number,
  ) => {
    if (!str || typeof str !== 'string') return ''
    const words = str.split(' ')
    if (words.length <= numWords) return str
    return words.slice(0, numWords).join(' ') + '...'
  }

  // Use the data that was prefetched in the loader
  const { data: feedback } = useSuspenseQuery<FeedbackResponseSchema>({
    queryKey: ['feedback', courseId],
    queryFn: () => fetchFeedback(),
    initialData: initialFeedback,
  })

  const { data: trainee } = useSuspenseQuery<TraineeData>({
    queryKey: ['trainee', courseId],
    queryFn: () => fetchTrainee(courseId),
    initialData: initialTrainee,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevents unnecessary refetches
  })

  const { data: topicStats } = useSuspenseQuery<TopicStatsData>({
    queryKey: ['topicStats', courseId],
    queryFn: () => fetchTopicStats(courseId),
    initialData: initialTopicStats,
  })

  const { data: cohorts } = useSuspenseQuery<CohortData>({
    queryKey: ['cohorts'],
    queryFn: () => fetchCohorts(),
    initialData: initialCohorts,
  })
  const { data: courses  } = useSuspenseQuery<Course[]>({
    queryKey: ['all-courses',courseId],
    queryFn: fetchCourses,
  })
// if (isCoursesLoading) return <div>Loading...</div>
const courseTitle = courses.filter((course) => (course.courseId === Number(courseId)))[0].title

  // Generate AI summary
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const {
    mutate: generateSummary,
    data: summaryData,
    isPending: isSummaryPending,
    error: summaryMutationError,
  } = useMutation({
    mutationFn: async () => {
      try {
        const userId = getItem('userId') as number
        if (!userId) {
          setDebugInfo('User ID not found')
          setIsGeneratingSummary(false)
          throw new Error('User ID not found')
        }

        setDebugInfo(`Calling API for user ${userId}`)
        const response = await postAxios(
          `/api/v0/gen-ai/course/${courseId}/${userId}/summary`,
          {
            traineeName: trainee?.traineeName,
          }
        )

        // Check if response data is empty or undefined
        if (!response.data) {
          setDebugInfo('API returned empty response')
          setIsGeneratingSummary(false)
          throw new Error('No data received from AI service')
        }

        setDebugInfo('Successfully received data')
        setSummaryError(null)
        setIsGeneratingSummary(false)
        return response.data
      } catch (error: any) {
        console.error('AI Summary generation error:', error)
        setIsGeneratingSummary(false)

        // Capture basic error information for debugging
        setDebugInfo(`Error: ${error.message}`)

        // Set a generic error message
        setSummaryError('Unable to generate performance insights. Please try again later.')
        return null
      }
    },
    onSuccess: (data) => {
      if (data) {
        setDebugInfo('Summary data received successfully')
        // Manually update the query data instead of invalidating to prevent a refetch
        queryClient.setQueryData(['trainee', courseId], (oldData: TraineeData | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            // Only update fields that might be affected by the summary, if any
            // You can add specific field updates here if needed
          }
        })
      } else {
        setDebugInfo('Data was null in onSuccess')
      }
      setIsGeneratingSummary(false)
    },
    onError: (error: any) => {
      console.error('Mutation error handler:', error)
      setIsGeneratingSummary(false)
      const errorMessage = error?.message || 'Unknown error occurred'
      setDebugInfo(`onError called: ${errorMessage}`)
      setSummaryError(errorMessage)
    },
  })

  // Function to handle summary generation
  const handleGenerateSummary = useCallback(() => {
    // Don't trigger if already in progress
    if (isGeneratingSummary || isSummaryPending) {
      console.log('Summary generation already in progress, skipping');
      return;
    }

    // Clear any previous errors before generating a new summary
    setSummaryError(null)
    setDebugInfo(null)
    setIsGeneratingSummary(true) // Set loading state immediately
    generateSummary()
  }, [generateSummary, isGeneratingSummary, isSummaryPending])

  // Handle mutation error
  if (summaryMutationError && !summaryError) {
    console.error('Setting error from mutation error:', summaryMutationError)
    setSummaryError('Unable to generate performance insights. Please try again later.')
    setIsGeneratingSummary(false)
  }

  // Log debug info for development
  if (import.meta.env.DEV && (summaryError || debugInfo)) {
    console.log('Performance Insights Debug:', {
      summaryError,
      debugInfo,
      summaryData: summaryData ? 'Has data' : 'No data',
      isPending: isSummaryPending,
      isGenerating: isGeneratingSummary
    })
  }

  // Generate summary when component mounts
  useLayoutEffect(() => {
    handleGenerateSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displaySummary = summaryData ? truncateToWords(summaryData, 100) : ''

  // Submit feedback mutation
  // const { mutate: submitFeedback, isPending: isSubmittingFeedback } = useMutation({
  //   mutationFn: async () => {
  //     const response = await postAxios(`/api/v0/trainee/${courseId}/feedback?givenByUserId=${userId}`, {
  //       comments: feedbackText,
  //     })
  //     return response.data
  //   },
  //   onSuccess: () => {
  //     setFeedbackText('')
  //     queryClient.invalidateQueries({ queryKey: ['feedback', courseId] })
  //   },
  // })

  // Change cohort mutation
  const { mutate: changeCohort } = useMutation({
    mutationFn: async (cohortId: number) => {
      const response = await postAxios(`/api/v0/cohorts/users`, {
        userId: parseInt(courseId),
        cohortId: cohortId,
      })
      return response.data
    },
    onSuccess: () => {
      setIsChangingCohort(false)
      queryClient.invalidateQueries({ queryKey: ['trainee', courseId] })
    },
  })

  // // Delete feedback mutation
  // const { mutate: deleteFeedback } = useMutation({
  //   mutationFn: async (feedbackId: number) => {
  //     const response = await deleteAxios(
  //       `/api/v0/trainee/${courseId}/feedback/${feedbackId}?givenByUserId=${userId}`
  //     )
  //     return response.data
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['feedback', courseId] })
  //   },
  // })

  // // Update feedback mutation
  // const { mutate: updateFeedback } = useMutation({
  //   mutationFn: async ({ feedbackId, comments }: { feedbackId: number, comments: string }) => {
  //     const response = await putAxios(
  //       `/api/v0/trainee/${courseId}/feedback/${feedbackId}?userId=${courseId}&givenByUserId=${userId}`,
  //       { comments }
  //     )
  //     return response.data
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['feedback', courseId] })
  //     setEditingFeedback(null)
  //   },
  // })

  const {
    data: leaderBoard,
    isLoading: isLeaderboardLoading,
    error: leaderboardError
  } = useQuery<leaderboardData>({
    queryKey: ['leaderboard', courseId],
    queryFn: () => fetchLeaderboard(courseId),
  })


  const handleCohortChange = (cohortId: number) => {
    changeCohort(cohortId)
  }

  // const handleDeleteFeedback = (feedbackId: number) => {
  //   deleteFeedback(feedbackId)
  // }

  // const handleUpdateFeedback = (feedbackId: number, comments: string) => {
  //   updateFeedback({ feedbackId, comments })
  // }

  // const handleSubmit = () => {
  //   if (!feedbackText.trim()) {
  //     return
  //   }
  //   submitFeedback()
  // }

  if (!feedback || !trainee || !topicStats || !cohorts) {
    throw new Error('Required data not found')
  }

  return (
    <ScaleRotateTransition>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div
          className="bg-neutral-100 min-h-screen"
          data-course-id={courseId}
          data-search-course-id={searchCourseId}
        >
          <div className="max-w-[1920px] mx-auto relative p-5">
            <div className="grid grid-cols-3 items-center mb-4 sticky top-0 z-30 p-2 bg-neutral-100">
              <div className="justify-self-start">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/training/student">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Course Stats</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <h1 className="text-xl text-neutral-900 tracking-wider font-bold justify-self-center">
                {courseTitle}
              </h1>
              <div className="justify-self-end"></div>
            </div>

            {/* Student Profile Card */}
            <Card className="mb-3">
              <CardContent className="p-3">
                <div className="flex items-start gap-6">
                  <div className="flex items-center gap-6 w-full">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-3 ml-6 cursor-pointer">
                            <div className="w-[2.6875rem] h-[2.6875rem] bg-gray-50 rounded-full flex items-center justify-center">
                              <img
                                src="https://c.animaapp.com/0pbQA243/img/fi-3060967.svg"
                                alt="Cohort"
                                className="w-1.5rem h-1.5rem"
                              />
                            </div>
                            <div className="flex flex-col items-start">
                              <h4 className="text-xs font-semibold whitespace-nowrap">
                                Classroom: {trainee.cohortName}
                              </h4>
                              {role === 'ROLE_Instructor' && (
                                <Dialog
                                  open={isChangingCohort}
                                  onOpenChange={setIsChangingCohort}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="gap-1 p-0"
                                    >
                                      <img
                                        src="https://c.animaapp.com/0pbQA243/img/fi-9883181.svg"
                                        alt="Change"
                                        className="w-1rem h-1rem"
                                      />{' '}
                                      Change Classroom
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Select Classroom
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 gap-2">
                                      {cohorts.map((cohort) => (
                                        <Button
                                          key={cohort.id}
                                          variant={
                                            cohort.cohortName ===
                                              trainee.cohortName
                                              ? 'secondary'
                                              : 'outline'
                                          }
                                          onClick={() =>
                                            handleCohortChange(cohort.id)
                                          }
                                          className="w-full justify-start"
                                        >
                                          {cohort.cohortName}
                                        </Button>
                                      ))}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Classroom</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <div className='flex items-center w-full'>
                      <div className="flex flex-wrap gap-4">
                        <Card className="bg-blue-gray50 w-auto border-none shadow-none">
                          <CardContent className="flex items-center gap-4 p-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                              <img
                                src="/training/images/total-score.svg"
                                alt="Total Score"
                                className="w-10 h-10"
                              />
                            </div>
                            <div className="whitespace-nowrap">
                              <p className="text-xs font-semibold flex items-center">Total Score <span className="text-base font-semibold text-gray-4 text-center pl-1">{trainee.totalScore}</span></p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-blue-gray50 w-auto border-none shadow-none">
                          <CardContent className="flex items-center gap-4 p-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                              <img
                                src="/training/images/course-completion-logo.svg"
                                alt="Percentage"
                                className="w-6 h-6"
                              />
                            </div>
                            <div className="whitespace-nowrap">
                              <p className="text-xs font-semibold flex items-center">
                                Course Completion <span className="text-base font-semibold text-gray-4 text-center pl-1">{trainee.courseCompletion}</span>
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-blue-gray50 w-auto border-none shadow-none">
                          <CardContent className="flex items-center gap-4 p-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                              <img
                                src="https://c.animaapp.com/0pbQA243/img/trophy.svg"
                                alt="Rank"
                                className="w-6 h-6"
                              />
                            </div>
                            <div className="whitespace-nowrap pr-3">
                              <p className="text-xs font-semibold flex items-center">Rank <span className="text-base font-semibold text-gray-4 text-center pl-1">{trainee.rank}</span></p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="flex items-center justify-end ml-auto">
                        <Link to={`/training/student/all-courses/$courseId/topics`}
                          params={{ courseId: String(courseId) }}
                        >
                          <Button> Continue Learning </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-3">
              <PerformanceInsightsCard
                summaryData={summaryData}
                displaySummary={displaySummary}
                isLoading={isGeneratingSummary || isSummaryPending}
                errorMessage={summaryError ?? undefined}
                subjectName={trainee.traineeName || undefined}
                onReadMoreClick={() => setShowFullSummary(true)}
              />
            </div>

            <div className="grid grid-cols-2 gap-6 mt-3">
              {/* Topic Stats Card */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      <h2 className="text-lg font-semibold">Topics Performance</h2>
                    </div>
                    {/* <Select
                      value={topicFilter}
                      onValueChange={(
                        value: 'all' | 'completed' | 'incomplete',
                      ) => setTopicFilter(value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter topics" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Topics</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="incomplete">Incomplete</SelectItem>
                      </SelectContent>
                    </Select> */}
                  </div>
                </CardHeader>

                <div className="p-4">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-800/50 rounded-full" />
                      <span className="text-xs font-medium">
                        Student Score
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-600 rounded-full" />
                      <span className="text-xs font-medium">
                        Average Score
                      </span>
                    </div>
                  </div>

                  <ScrollArea className="h-[26.25rem] pr-4">
                    <div className="space-y-4">
                      {topicStats.topics
                        ?.filter((topic) =>
                          topicFilter === 'all'
                            ? true
                            : topicFilter === 'completed'
                              ? topic.completed
                              : !topic.completed,
                        )
                        .map((topic) => (
                          <div key={topic.topicName}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                {topic.topicName}
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="relative w-40">
                                      <Progress
                                        value={topic.averageScorePercent}
                                        className="absolute inset-0 [&>div]:bg-gray-600 z-10"
                                      />
                                      <Progress
                                        value={topic.scorePercent}
                                        className="bg-transparent [&>div]:bg-blue-800/50 z-20"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-1">
                                      <p className="text-sm text-gray-500">
                                        Average Score:{' '}
                                        {topic.averageScorePercent}%
                                      </p>
                                      <p className="text-sm text-blue-800/90">
                                        Student Score: {topic.scorePercent}%
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            {topicStats.topics.indexOf(topic) <
                              topicStats.topics.length - 1 && <Separator />}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </Card>

              <Card>
                <div className="h-full">
                  {/* Performance section */}
                  <Card className="border-none shadow-none">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src="https://c.animaapp.com/0pbQA243/img/trophy.svg"
                          alt="Top Performers"
                          className="w-6 h-6"
                        />
                        <CardTitle>
                          <h2 className="text-lg font-semibold">
                            Top Performers
                          </h2>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0 px-1 pl-4">
                      <Separator className="mb-2" />
                      <div className="py-2">
                        {isLeaderboardLoading ? (
                          <div className="h-[26rem] flex flex-col justify-center items-center py-8 gap-2 animate-pulse">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <p className="text-sm text-gray-500">Loading leaderboard...</p>
                          </div>
                        ) : leaderboardError || !leaderBoard ? (
                          <div className="h-[26rem] flex flex-col justify-center items-center py-8 gap-2 animate-fadeIn">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                            <div className="text-center max-w-md">
                              <p className="text-red-500 font-medium">Unable to load leaderboard</p>
                              <p className="text-sm text-gray-500 mt-1 break-words">
                                {leaderboardError instanceof Error ? leaderboardError.message : "The leaderboard service may be unavailable."}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-hidden">
                            <div className="bg-white px-4 py-2">
                              <div className="grid grid-cols-12 text-sm font-medium text-gray-600">
                                <div className="col-span-2 text-center font-semibold">
                                  Rank
                                </div>
                                <div className="col-span-7  font-semibold">
                                  Student
                                </div>
                                <div className="col-span-3  font-semibold text-right">
                                  Percentage
                                </div>
                              </div>
                            </div>

                            <div className="h-[26rem] overflow-y-auto">
                              {leaderBoard?.length === 0 ?
                                <div className="flex items-center justify-center h-full">
                                  <p className="text-sm text-gray-500">No Students available</p>
                                </div>
                                :
                                leaderBoard.slice(0, 10).map((user) => (
                                  <div
                                    key={user.rank}
                                    className={`grid grid-cols-12 px-4 py-2 text-sm ${user.traineeFullName === name ? 'bg-blue-50 font-medium rounded-sm' : ''}`}
                                  >
                                    <div className="col-span-2 text-center">
                                      {user.rank <= 0 ? (
                                        <div
                                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${user.rank === 1
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : user.rank === 2
                                              ? 'bg-gray-200 text-gray-700'
                                              : 'bg-amber-100 text-amber-700'
                                            } font-bold`}
                                        >
                                          {user.rank}
                                        </div>
                                      ) : (
                                        <span>{user.rank}</span>
                                      )}
                                    </div>
                                    <div className="col-span-7 flex items-center">
                                      <span>
                                        {user.traineeFullName}
                                        {user.traineeFullName === name && ' (You)'}
                                      </span>
                                    </div>
                                    <div className="col-span-3 text-right">
                                      <Badge
                                        variant="outline"
                                        className="bg-blue-50 border-blue-100"
                                      >
                                        {user.percentage}%
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feedback Card */}
                  {/* <Card className="mt-3">

                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://c.animaapp.com/0pbQA243/img/frame-1.svg"
                        alt="Feedback"
                        className="w-6 h-6"
                      />
                      <CardTitle>
                        <h2 className="text-lg font-semibold">Feedback</h2>
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Separator className="mb-2" />
                    <div className="border-2 border-gray-100 rounded-lg pl-3 py-2">
                      <div className="space-y-2">
                        {feedback.length === 0 ? (
                          <div className="text-center py-6 text-gray-500">
                            <div className="mb-2">
                              <img
                                src="https://c.animaapp.com/0pbQA243/img/message-square.svg"
                                alt="No feedback"
                                className="w-12 h-12 mx-auto opacity-30"
                              />
                            </div>
                            <p>No feedback available yet</p>
                          </div>
                        ) : (
                          feedback.map((item) => (
                            <Card
                              key={item.id}
                              className="overflow-hidden border-0 shadow-sm"
                            >
                              <CardContent className="px-2 py-2 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="font-medium text-xs text-gray-600">
                                    <span className="mr-1">📅</span>
                                    {item.updatedAt}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="bg-white/80 text-blue-800 border-blue-200 font-medium text-xs px-2 py-0"
                                  >
                                    {item.givenBy}
                                  </Badge>
                                </div>

                                <p className="text-gray-700 text-sm leading-relaxed bg-white/50 px-2 py-1 rounded border border-gray-100">
                                  {item.comments}
                                </p>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                  </Card> */}
                </div>
              </Card>
            </div>

            <div className="gap-6 mt-3">
              {/* Feedback Card */}
              <Card className="mt-3">
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://c.animaapp.com/0pbQA243/img/frame-1.svg"
                      alt="Feedback"
                      className="w-6 h-6"
                    />
                    <CardTitle>
                      <h2 className="text-lg font-semibold">Feedback</h2>
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <Separator className="mb-2" />
                  <div className="py-2">
                    <div className="space-y-2">
                      {feedback.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <p>No feedback available yet</p>
                        </div>
                      ) : (
                        feedback.map((item) => (
                          <Card
                            key={item.id}
                            className="overflow-hidden border-none shadow-none"
                          >
                            <CardContent className="px-2 py-2 rounded-sm">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium text-xs text-gray-600">
                                  <span className="mr-1">📅</span>
                                  {item.updatedAt}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-white/80 text-blue-800 border-blue-200 font-medium text-xs px-2 py-0"
                                >
                                  {item.givenBy}
                                </Badge>
                              </div>

                              <p className="text-gray-700 text-sm leading-relaxed bg-white/50 px-2 py-1">
                                {item.comments}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Full Summary Dialog */}
            <AIInsightsDialog
              open={showFullSummary}
              onOpenChange={setShowFullSummary}
              description={`Comprehensive analysis of ${trainee.traineeFullName}'s performance`}
              content={summaryData}
            />
          </div>
        </div>
      </motion.div>
    </ScaleRotateTransition>
  )
}
