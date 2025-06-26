import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Button,
  Card,
  CardContent,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'ti-react-template/components'
import { getAxios, postAxios } from '@/shared/api/apiClient'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { getItem } from '@/shared/utlis/localStorage'
import { CircleCheck, RefreshCcw, XCircle } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
// import { PageHeader } from '@/shared/components/page-header'
import { useAtom } from 'jotai'
import { activeNavAtom } from '@/shared/components/side-navbar'
import { useCourseId } from '@/domains/course/store/courseAtom'
import { useRole } from '@/domains/auth/store/authAtom'
import { useQueryClient } from '@tanstack/react-query'
import { Confetti } from '@/shared/components/confetti'

// Define the quiz set schema for individual questions
const quizSetItemSchema = z
  .object({
    questionId: z.number(),
    question: z.string(),
    choices: z.record(z.string()),
    reason: z.string(),
    correctChoice: z.string(),
    userChoice: z.string(),
    questionType: z.string(),
  })
  .readonly()

// Define the quiz response schema
const quizResponseSchema = z
  .object({
    data: z
      .object({
        quizTitle: z.string(),
        quizResponseId: z.number(),
        userId: z.number(),
        quizId: z.number(),
        total: z.number(),
        responses: z.string(),
        quizSet: z.array(quizSetItemSchema),
        attemptedAt: z.string().datetime(),
        quizNotCreated: z.boolean().optional(),
        timeTracker: z.string(),
      })
      .readonly(),
  })
  .readonly()

// type QuizResponse = z.infer<typeof quizResponseSchema>

// New API Response Schemas
const quizQuestionSchema = z
  .object({
    questionId: z.number().nullable().default(0),
    question: z.string().nullable().default(''),
    choices: z.record(z.string()).nullable().default({}),
    userChoice: z.string().optional().nullable(),
  })
  .readonly()

const quizApiResponseSchema = z
  .object({
    quizTitle: z.string().nullable().default(''),
    userId: z.number().nullable().default(0),
    quizId: z.number().nullable().default(0),
    total: z.number().nullable().default(0),
    quizSet: z.array(quizQuestionSchema).nullable().default([]),
  })
  .readonly()

// type QuizApiResponse = z.infer<typeof quizApiResponseSchema>

// Type for quiz answers
type QuizAnswer = Readonly<{
  questionId: number
  selectedOption: number
}>

// Type for form data
const quizSubmissionSchema = z
  .object({
    userId: z.number(),
    quizId: z.number(),
    responses: z.null(),
    timeTaken: z.string(),
    quizSetList: z.array(
      z
        .object({
          questionId: z.number(),
          userChoice: z.string(),
        })
        .readonly(),
    ),
  })
  .readonly()

// type QuizSubmission = z.infer<typeof quizSubmissionSchema>

export const Route = createFileRoute(
  '/training/student/courses/$topicId/quiz/',
)({
  loader: async ({ params }) => {
    const userId = getItem('userId')
    const topicId = params.topicId
    // const topicId = 301;
    try {
      const response = await getAxios(
        `/api/v0/quiz/topic/${topicId}/user/${userId}`,
      )

      if (!response?.data) {
        throw new Error('No quiz data available')
      }

      // Log the raw response for debugging
      console.log('Raw API response:', JSON.stringify(response.data, null, 2))

      // Check if all fields are null (quiz doesn't exist yet)
      if (
        response.data.userId === null &&
        response.data.quizId === null &&
        response.data.total === null &&
        response.data.quizSet === null
      ) {
        return {
          quiz: {
            quizTitle: response.data.quizTitle ?? '',
            quizResponseId: 0,
            userId: Number(userId),
            quizId: 0,
            total: 0,
            responses: '',
            quizSet: [],
            attemptedAt: new Date().toISOString(),
            quizNotCreated: true, // Special flag to indicate quiz doesn't exist yet
            timeTracker: '00:00',
          },
          key: Date.now(), // Add a unique key for each load
        }
      }

      // Validate the raw API response
      const validatedApiResponse = quizApiResponseSchema.parse(response.data)
      console.log(
        'Validated API response:',
        JSON.stringify(validatedApiResponse, null, 2),
      )

      // Transform the validated API response to match the existing quiz structure
      const transformedResponse = {
        data: {
          quizTitle: validatedApiResponse.quizTitle ?? '',
          quizResponseId: 0,
          userId: validatedApiResponse.userId ?? 0,
          quizId: validatedApiResponse.quizId ?? 0,
          total: validatedApiResponse.total ?? 0,
          responses: '',
          quizSet: (validatedApiResponse.quizSet || []).map((q) => ({
            quizId: validatedApiResponse.quizId ?? 0,
            questionId: q.questionId ?? 0,
            question: q.question ?? '',
            choices: q.choices ?? {},
            reason: '',
            correctChoice: '',
            userChoice: q.userChoice ?? '',
            questionType: 'single',
          })),
          attemptedAt: new Date().toISOString(),
          timeTracker: '00:00',
        },
      }

      // Validate the transformed response against the existing schema
      const result = quizResponseSchema.parse(transformedResponse)
      const quiz = result.data

      return { quiz, key: Date.now() } // Add a unique key for each load
    } catch (error) {
      console.error('Error loading quiz:', error)
      if (error instanceof z.ZodError) {
        console.error(
          'Zod validation error:',
          JSON.stringify(error.errors, null, 2),
        )
      }
      throw error
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { quiz, key } = Route.useLoaderData()
  const { topicId } = Route.useParams()
  const navigate = useNavigate()
  const [, setActiveNav] = useAtom(activeNavAtom) // Add this line to access the activeNavAtom setter
  const { courseId } = useCourseId() // Only get the courseId from the atom
  const queryClient = useQueryClient()
  const role = useRole();
  const activePath = role === "ROLE_Instructor" ? "/training/student/all-courses" : "/training/student";
  const [initialLoad, setInitialLoad] = useState(true)
  const [quizData, setQuizData] = useState<typeof quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showScoreDialog, setShowScoreDialog] = useState(false)
  const [showAlreadyTakenDialog, setShowAlreadyTakenDialog] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [totalQuizQuestions, setTotalQuizQuestions] = useState(0)
  const [quizResponseId, setQuizResponseId] = useState(0)
  const [answers, setAnswers] = useState<readonly QuizAnswer[]>([])
  const [quizResultMessage, setQuizResultMessage] = useState('')
  const [isPassed, setIsPassed] = useState(false)
  const [timeTracker, setTimeTracker] = useState('00:00')
  const [finalTime, setFinalTime] = useState('')
  const [startTime, setStartTime] = useState(new Date())
  const [timerActive, setTimerActive] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  // Effect to handle quiz data initialization with the unique key
  useEffect(() => {
    // Reset state when key changes (new quiz loaded)
    setInitialLoad(true);
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsSubmitted(false);
    setShowSubmitDialog(false);
    setShowScoreDialog(false);
    setShowAlreadyTakenDialog(false);
    setQuizScore(0);
    setTotalQuizQuestions(0);
    setQuizResponseId(0);
    setQuizResultMessage('');
    setIsPassed(false);
    setTimeTracker('00:00');
    setFinalTime('');
    setTimerActive(true);
    setShowConfetti(false);
    // Short timeout to ensure clean state before setting new data
    const timer = setTimeout(() => {
      setQuizData(quiz);
      setInitialLoad(false);
    }, 100);
    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timer);
  }, [key, quiz]);

  useEffect(() => {
    if (!timerActive || isSubmitted) {
      return
    }

    const timer = setInterval(() => {
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      const minutes = Math.floor(diffInSeconds / 60)
      const seconds = diffInSeconds % 60
      setTimeTracker(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, isSubmitted, timerActive])

  // Add validation to ensure quiz data exists
  if (initialLoad || !quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f1f1f1]">
        <Card className="p-6 max-w-md w-full">
          <CardContent>
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Loading Quiz</h2>
              <Progress className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!quizData || !Array.isArray(quizData.quizSet) || quizData.quizSet.length === 0) {
    if (quizData?.quizNotCreated) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#f1f1f1]">
          <Card className="p-6 max-w-md w-full">
            <CardContent>
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Quiz Not Found
                </h2>
                <p className="text-gray-600">
                  We couldn&apos;t find any quiz questions for this topic. This
                  might be because:
                </p>
                <ul className="text-left text-gray-600 list-disc pl-6 space-y-2">
                  <li>The quiz hasn&apos;t been created yet</li>
                  <li>The topic ID might be incorrect</li>
                  <li>You might not have access to this quiz</li>
                </ul>
                <p className="text-gray-600 pt-2">
                  Please return to the student dashboard and try accessing your
                  courses again.
                </p>
                <Button
                  onClick={() => navigate({ to: '/training/student' })}
                  className="w-full mt-4"
                >
                  Back to Student Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f1f1f1]">
        <Card className="p-6 max-w-md w-full">
          <CardContent>
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Error Loading Quiz
              </h2>
              <p className="text-gray-600">
                There was a problem loading the quiz questions. Please return to
                the dashboard and try again.
              </p>
              <Button
                onClick={() => navigate({ to: '/training/student' })}
                className="w-full mt-4"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = quizData.quizSet[currentQuestionIndex]
  const progress = (answers.length / quizData.quizSet.length) * 100
  const isLastQuestion = currentQuestionIndex === quizData.quizSet.length - 1

  const handleAnswerSelect = (value: string) => {
    const selectedOption = parseInt(value, 10)
    setAnswers((prev) => {
      const newAnswers = [...prev]
      const existingIndex = newAnswers.findIndex(
        (a) => a.questionId === currentQuestion.questionId,
      )

      if (existingIndex !== -1) {
        return [
          ...newAnswers.slice(0, existingIndex),
          { questionId: currentQuestion.questionId, selectedOption },
          ...newAnswers.slice(existingIndex + 1),
        ] as const
      }

      return [
        ...newAnswers,
        {
          questionId: currentQuestion.questionId,
          selectedOption,
        },
      ] as const
    })
  }

  const getSelectedAnswer = (questionId: number): string => {
    const answer = answers.find((a) => a.questionId === questionId)
    return answer?.selectedOption.toString() ?? ''
  }

  const handleNext = () => {
    if (isLastQuestion && getSelectedAnswer(currentQuestion.questionId)) {
      setShowSubmitDialog(true)
    } else if (currentQuestionIndex < quizData.quizSet.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    // Capture the current time before stopping the timer
    const currentTime = timeTracker
    setTimerActive(false)
    setFinalTime(currentTime)

    if (answers.length !== quizData.quizSet.length) {
      setShowSubmitDialog(false)
      setTimerActive(true)
      return
    }

    const formData = quizSubmissionSchema.parse({
      userId: quizData.userId,
      quizId: quizData.quizId,
      responses: null,
      timeTaken: currentTime,
      quizSetList: answers.map((answer) => ({
        questionId: answer.questionId,
        userChoice: String.fromCharCode(65 + answer.selectedOption),
      })),
    })

    console.log('Quiz Submission Data:', formData)

    try {
      const response = await postAxios('/api/v0/quiz', formData)
      console.log('Quiz submission response:', response)

      if (response.status === 200) {
        setQuizScore(response.data.score || 0)
        setTotalQuizQuestions(response.data.total || 0)
        setQuizResponseId(response.data.quizResultId || 0)
        setShowSubmitDialog(false)
        setShowScoreDialog(true)
        setIsSubmitted(true)

        // Set quiz result message based on passed status
        const resultMessage = response.data.passed
          ? "Congratulations!"
          : "Unfortunately, you did not pass this time.Please review the material and try again."
        setQuizResultMessage(resultMessage)
        setIsPassed(response.data.passed)
        
        // Trigger confetti if student passed the quiz
        if (response.data.passed) {
          setShowConfetti(true)
        }
        
        // Invalidate topics query to refresh topic badges
        if (courseId) {
          queryClient.invalidateQueries({ queryKey: ['topics', courseId.toString()] })
        }
      } else if (response.status === 409) {
        setIsSubmitted(true)

        setShowAlreadyTakenDialog(true)
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error)
      setShowSubmitDialog(false)

      if (error.response?.status === 409) {
        setShowAlreadyTakenDialog(true)
      } else {
        setQuizResultMessage("An error occurred while submitting the quiz.")
        setShowScoreDialog(true)
      }
    }
  }

  // Quiz result action buttons component
  const QuizResultActions = () => {
    const reviewQuizProps = {
      to: '/training/student/courses/$topicId/quiz/review' as const,
      params: { topicId: topicId.toString() },
      search: { quizResponseId },
      className: "inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-md"
    }

    const retryQuizProps = {
      variant: "destructive" as const,
      size: "sm" as const,
      onClick: () => {
        // Close the dialog first
        setShowScoreDialog(false);
        
        // Reset all quiz state
        setInitialLoad(true);
        setQuizData(null);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setIsSubmitted(false);
        setShowSubmitDialog(false);
        setShowAlreadyTakenDialog(false);
        setQuizScore(0);
        setTotalQuizQuestions(0);
        setQuizResponseId(0);
        setQuizResultMessage('');
        setIsPassed(false);
        setTimeTracker('00:00');
        setFinalTime('');
        setTimerActive(true);
        setStartTime(new Date()); // Reset the start time to the current time
        
        // Fetch fresh quiz data without navigating
        const fetchNewQuiz = async () => {
          try {
            const userId = getItem('userId');
            const response = await getAxios(`/api/v0/quiz/topic/${topicId}/user/${userId}`);
            
            if (!response?.data) {
              throw new Error('No quiz data available');
            }
            
            // Validate and transform the response as in the loader
            const transformedResponse = {
              data: {
                quizTitle: response.data.quizTitle ?? '',
                quizResponseId: 0,
                userId: response.data.userId ?? 0,
                quizId: response.data.quizId ?? 0,
                total: response.data.total ?? 0,
                responses: '',
                quizSet: (response.data.quizSet || []).map((q: any) => ({
                  quizId: response.data.quizId ?? 0,
                  questionId: q.questionId ?? 0,
                  question: q.question ?? '',
                  choices: q.choices ?? {},
                  reason: '',
                  correctChoice: '',
                  userChoice: q.userChoice ?? '',
                  questionType: 'single',
                })),
                attemptedAt: new Date().toISOString(),
                timeTracker: '00:00',
              },
            };
            
            const result = quizResponseSchema.parse(transformedResponse);
            setQuizData(result.data);
            setInitialLoad(false);
          } catch (error) {
            console.error('Error loading new quiz:', error);
            // If there's an error, navigate as fallback
            setActiveNav("/training/student/courses");
            navigate({
              to: '/training/student/courses/$topicId/quiz',
              params: { topicId: topicId.toString() },
              search: { refresh: Date.now().toString() },
            });
          }
        };
        
        fetchNewQuiz();
      },
      className: " bg-purple-600 hover:bg-purple-700 rounded-md inline-flex items-center justify-center gap-1.5 ml-2"
    }

    if (isPassed) {
      return (
        <Link {...reviewQuizProps}>
          Review Quiz
        </Link>
      )
    }

    return (
      <Button {...retryQuizProps}>
        <RefreshCcw className="w-3.5 h-3.5" />
        Retake Quiz
      </Button>
    )
  }

  const handleSubmitDialogClose = (open: boolean) => {
    setShowSubmitDialog(open)
    if (!open && !isSubmitted) { // Only resume timer if quiz hasn't been submitted
      setTimerActive(true)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      className="bg-[#f1f1f1] flex flex-row justify-center w-full min-h-screen"
    >
      <Dialog open={showSubmitDialog} onOpenChange={handleSubmitDialogClose}>
        <DialogContent className="sm:max-w-[25rem] flex flex-col items-center justify-center min-h-[18.75rem]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-center text-2xl">Submit Quiz</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center mb-6">
            Are you sure you want to submit your quiz?
          </DialogDescription>
          <DialogFooter className="flex justify-center gap-4">
            <Button type="button" onClick={handleSubmit}>
              Submit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showScoreDialog} onOpenChange={(open) => {
        if (!open) {
          // Close the dialog
          setShowScoreDialog(false);
          
          // Set the active nav state to match the destination we're navigating to
          // Use the base path without parameters to ensure proper highlighting
          setActiveNav(activePath);
          
          // Navigate to the all-courses/topics path with the courseId from the atom
          if (courseId) {
            navigate({
              to: '/training/student/all-courses/$courseId/topics',
              params: { courseId: String(courseId) },
            });
          }
        }
      }}>
        <DialogContent className="sm:max-w-[25rem] flex flex-col items-center justify-center min-h-[18.75rem]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Quiz Result</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center">
            {
              isPassed ?
                <CircleCheck className="w-24 h-24 text-green-600" />
                :
                <XCircle className="w-24 h-24 text-black" />
            }
          </div>
          <div className="text-center space-y-3">
            <div className="text-xl">You Scored {quizScore}/{totalQuizQuestions}</div>
            <div className="text-base">
              {quizResultMessage === "Congratulations!" ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold ">{quizResultMessage}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-semibold text-[#F1416C] text-sm">{quizResultMessage}</span>
                </div>
              )}
            </div>
            <div className="mt-2 inline-flex items-center justify-center">
              <QuizResultActions />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAlreadyTakenDialog} onOpenChange={setShowAlreadyTakenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Quiz Already Completed</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-lg">You have already taken this quiz.</p>
            <DialogFooter className="sm:justify-center">
              <Button
                onClick={() => {
                  setShowAlreadyTakenDialog(false)
                  navigate({ to: '/training/student/all-courses' })
                }}
              >
                Go to All Courses
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-[#f1f1f1] w-full max-w-[1920px] relative p-7">
        {/* Header */}
        {/* <PageHeader className="mb-4" /> */}

        {/* Main Content */}
        <div className="max-w-full">
          {/* Course Title */}
          <div className="flex items-center justify-between gap-2.5 mb-4 w-full">
          <div className='w-[28%]'>
{role==="ROLE_Instructor"?<Breadcrumb>
<BreadcrumbList>
<BreadcrumbItem>
<BreadcrumbLink href="/training/student/all-courses">Courses</BreadcrumbLink>
</BreadcrumbItem>
<BreadcrumbSeparator />
<BreadcrumbItem>
<BreadcrumbLink href={`/training/student/all-courses/${courseId}/topics`}>Topics</BreadcrumbLink>
</BreadcrumbItem>
<BreadcrumbSeparator />
<BreadcrumbItem>
<BreadcrumbLink href={`/training/student/all-courses/${courseId}/chat-bot`}>Chat Bot</BreadcrumbLink>
</BreadcrumbItem>
<BreadcrumbSeparator />
<BreadcrumbItem>
<BreadcrumbPage>Quiz</BreadcrumbPage>
</BreadcrumbItem>
</BreadcrumbList>
</Breadcrumb> :
<Breadcrumb>
<BreadcrumbList>
<BreadcrumbItem>
<BreadcrumbLink href="/training/student">Home</BreadcrumbLink>
</BreadcrumbItem>
<BreadcrumbSeparator />
<BreadcrumbItem>
<BreadcrumbLink href={`/training/student/course/${courseId}`}>Course Stats</BreadcrumbLink>
</BreadcrumbItem>
<BreadcrumbSeparator />
<BreadcrumbItem>
<BreadcrumbLink href={`/training/student/all-courses/${courseId}/chat-bot`}>Chat Bot</BreadcrumbLink>
</BreadcrumbItem>
<BreadcrumbSeparator />
<BreadcrumbItem>
<BreadcrumbPage>Quiz</BreadcrumbPage>
</BreadcrumbItem>
</BreadcrumbList>
</Breadcrumb> }

</div>
            <div className="flex items-center gap-2.5 w-[60%]">
              <img
                className="w-6 h-6"
                alt="Book open check"
                src="https://c.animaapp.com/9MHOVCpl/img/book-open-check.svg"
              />
              <h1 className="text-xl font-semibold">
                {quizData.quizTitle}
              </h1>
            </div>

            <div className="text-sm font-medium w-[10%]">
              Question: {currentQuestionIndex + 1}/{quizData.quizSet.length}
            </div>
          </div>

          {/* Quiz Card */}
          <Card className="mb-4">
            <CardContent className="p-6">
              {/* Quiz Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#131336] rounded-full flex items-center justify-center text-white text-xs">
                    {currentQuestionIndex + 1}
                  </div>
                  <h2 className="text-xl font-semibold">Quiz</h2>
                </div>
                {/* <span className="text-sm font-medium">
                  Question: {currentQuestionIndex + 1}/{quiz.quizSet.length}
                </span> */}
                <div className="text-lg font-bold">
                  Time: {!timerActive || isSubmitted ? finalTime : timeTracker}
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Question */}
              <p className="text-base font-normal mb-6">
                {currentQuestion.question}
              </p>

              {/* Options */}
              <RadioGroup
                key={currentQuestion.questionId}
                value={getSelectedAnswer(currentQuestion.questionId)}
                onValueChange={handleAnswerSelect}
                className="space-y-[1px]"
                disabled={isSubmitted}
              >
                {Object.entries(currentQuestion.choices).map(
                  ([key, value], index) => (
                    <div
                      key={key}
                      className="flex items-center space-x-4 w-full bg-white border border-[#DDE2E5] rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4 w-full">
                        <div className="flex items-center space-x-2">
                          <span className="font-normal text-base text-[#6F6F6F] w-6 px-4">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <RadioGroupItem
                            value={index.toString()}
                            id={`option-${currentQuestion.questionId}-${index}`}
                          />
                        </div>
                        <label
                          htmlFor={`option-${currentQuestion.questionId}-${index}`}
                          className="text-base font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 p-4 cursor-pointer"
                        >
                          {value as string}
                        </label>
                      </div>
                    </div>
                  ),
                )}
              </RadioGroup>

              {/* Action Buttons */}
              <div className="flex gap-2.5 mt-6">
                {!isSubmitted ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous Question
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleNext}
                      disabled={!getSelectedAnswer(currentQuestion.questionId)}
                    >
                      {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <Card>
            <CardContent className="p-3">
              <div className="text-sm font-semibold mb-2.5">Progress</div>
              <Progress value={progress} className="h-2.5" indicatorClassName='bg-black' />
            </CardContent>
          </Card>
        </div>
      </div>
      <Confetti active={showConfetti} />
    </form>
  )
}
