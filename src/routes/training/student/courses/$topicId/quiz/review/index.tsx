import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Separator,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'ti-react-template/components'
import { z } from 'zod'
import { getAxios } from '@/shared/api/apiClient'
import { useState } from 'react'
import { MoveRight } from 'lucide-react'
import { useCourseId } from '@/domains/course/store/courseAtom'
import { useRole } from '@/domains/auth/store/authAtom'

// Define the choices schema
const choicesSchema = z.record(z.string()).readonly()

// Define the quiz set item schema
const quizSetItemSchema = z
  .object({
    quizId: z.number().nullable(),
    questionId: z.number(),
    question: z.string(),
    choices: choicesSchema,
    reason: z.string().nullable(),
    correctChoice: z.string(),
    userChoice: z.string(),
    // questionType: z.string(),
  })
  .readonly()
// "quizSetList": [
//     {
//       "quizId": null,
//       "questionId": 4061,
//       "question": "What is the phone number for the HCTRA Call Center?",
//       "choices": null,
//       "reason": "According to the training manual, the phone number for the HCTRA Call Center is 281-875-3279.",
//       "correctChoice": "A",
//       "userChoice": "A"
//     },

//   ]

// Define the quiz review response schema
const quizReviewResponseSchema = z
  .object({
    quizResultId: z.number(),
    userId: z.number(),
    quizId: z.number(),
    completed: z.boolean(),
    passed: z.boolean(),
    total: z.number(),
    score: z.number(),
    percentage: z.number(),
    badgesList: z.array(z.object({
      badgeId: z.number(),
      name: z.string(),
      earnedAt: z.string(),
      badgeType: z.string(),
    })).nullable(),
    quizSetList: z.array(quizSetItemSchema).readonly(),
    quizTitle: z.string(),
  })
  .readonly()
// "quizResultId": 8252,
// "userId": 5052,
// "quizId": 4052,
// "completed": false,
// "passed": false,
// "total": 12,
// "score": 5,
// "percentage": 41,
// "badgesList": null,
// "quizSetList": [
//     {
//         "quizId": null,
//         "questionId": 4061,
//         "question": "What is the phone number for the HCTRA Call Center?",
//         "choices": {
//             "A": "281-875-3279",
//             "B": "713-701-6000",
//             "C": "713-587-7732",
//             "D": "1-800-HCTRA"
//         },
//         "reason": "According to the training manual, the phone number for the HCTRA Call Center is 281-875-3279.",
//         "correctChoice": "A",
//         "userChoice": "A"
//     },

// type QuizReviewResponse = z.infer<typeof quizReviewResponseSchema>

// Define search parameters schema
const searchSchema = z
  .object({
    quizResponseId: z.coerce.number(),
  })
  .readonly()

export const Route = createFileRoute('/training/student/courses/$topicId/quiz/review/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ quizResponseId: search.quizResponseId }),
  loader: async ({ deps: { quizResponseId } }) => {
    try {
      console.log('Fetching quiz response with ID:', quizResponseId)
      const response = await getAxios(`/api/v0/quiz/${quizResponseId}`)
      console.log('Raw API Response:', JSON.stringify(response, null, 2))

      if (!response.data) {
        throw new Error('No data received from the API')
      }

      // Transform the response to match our schema
      const transformedResponse = {
        ...response.data,
        userId: response.data.userId ?? 0,
        quizSetList: response.data.quizSetList ?? [], // Map quizSet to quizSetList
        quizTitle: response.data.quizTitle ?? '',
      }

      // Validate the transformed response
      const validatedResponse =
        quizReviewResponseSchema.parse(transformedResponse)
      console.log('Validated Response:', validatedResponse)

      return { review: validatedResponse }
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(
          'Validation error:',
          JSON.stringify(error.errors, null, 2),
        )
      }
      console.error('Error fetching quiz response:', error)
      throw error
    }
  },
  component: ReviewComponent,
})

export function ReviewComponent(): JSX.Element {
  const { courseId } = useCourseId() 
  const { review } = Route.useLoaderData()
  const { topicId } = Route.useParams()
  const role=useRole()
  const [openExplanations, setOpenExplanations] = useState<Record<number, boolean>>({});
  // const navigate = useNavigate();
  console.log('Course ID:', courseId)
  
  // const handleBack = useCallback(() => {
  //   navigate({
  //     to: '/training/student/all-courses/$courseId/topics',
  //     params: { courseId: String(courseId) },
  //   });
  // }, [navigate]);


  if (!review || !Array.isArray(review.quizSetList)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f1f1f1]">
        <Card className="p-6">
          <CardContent>
            <p className="text-lg font-semibold text-center">
              No review data available.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-[#f1f1f1] min-h-screen">
      <div className="mx-auto relative p-4">

        <main>
        
          <Card className="bg-white">
            <CardHeader>
 
              
              <div className="flex justify-between items-center mb-6">
                <div>
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
<BreadcrumbLink href={`/training/student/courses/${topicId}/quiz`}>Quiz</BreadcrumbLink>
</BreadcrumbItem>
<BreadcrumbSeparator />
<BreadcrumbItem>
<BreadcrumbPage>Quiz Review</BreadcrumbPage>
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
<BreadcrumbPage>Quiz Review</BreadcrumbPage>
</BreadcrumbItem>
</BreadcrumbList>
</Breadcrumb> }
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold">Quiz Review</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Quiz - {review.quizTitle}</span>
                  <span className={`text-sm ${review.passed ? 'text-green-600' : 'text-red-500'}`}>
                    Result: {review.passed ? 'Passed' : 'Failed'} ({review.score}/{review.total})
                  </span>
                  <Link
                   to="/training/student/all-courses/$courseId/topics"                   
                   params={{ courseId: String(courseId) }}
                  >
                    <Button className='py-1'>Next <MoveRight className='w-4 h-4 ml-2' /></Button>
                  </Link>
                </div>
              </div>


              <Separator className="mt-2" />
            </CardHeader>
            <CardContent>
              {review.quizSetList.map((question, index) => (
                <div key={question.questionId} className="mb-8">
                  <div className="flex gap-4 mb-4">
                    <div className="w-6 h-6 flex items-center justify-center bg-[#131336] rounded-full">
                      <span className="text-white text-xs font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold">
                      {question.question}
                    </h3>
                    {question.reason && (
                      <div className="ml-auto">
                        <Button
                          variant={openExplanations[question.questionId] ? "default" : "outline"}
                          size="sm"
                          onClick={() => setOpenExplanations(prev => ({
                            ...prev,
                            [question.questionId]: !prev[question.questionId]
                          }))}
                          className={`${openExplanations[question.questionId] 
                            ? "bg-[#131336] hover:bg-[#1f1f54] text-white" 
                            : "border-[#131336] text-[#131336] hover:bg-[#131336] hover:text-white"}`}
                        >
                          Explain why
                        </Button>
                      </div>
                    )}
                  </div>

                  <Card className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="mt-4 flex-1">
                          <div className="border border-[#D9D9D9] rounded-lg overflow-hidden">
                            {Object.entries(question.choices).map(([key, value], index) => {
                              const isCorrect = index === question.correctChoice.charCodeAt(0) - 65;
                              const isSelected = index === question.userChoice.charCodeAt(0) - 65;

                              return (
                                <div
                                  key={key}
                                  className={`flex items-center px-4 py-3 space-x-4 w-full bg-white border-b border-[#DDE2E5] last:border-b-0 ${isCorrect
                                    ? 'text-[#00BD35]'
                                    : isSelected && !isCorrect
                                      ? 'text-[#F97066]'
                                      : 'bg-white'
                                    }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <span className={`w-6 ${isCorrect
                                      ? 'text-[#00BD35]'
                                      : isSelected && !isCorrect
                                        ? 'text-[#F97066]'
                                        : 'text-[#6F6F6F]'
                                      }`}>
                                      {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className={`${isCorrect ? 'font-medium' : ''}`}>
                                      {value as string}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {question.reason && openExplanations[question.questionId] && (
                        <div className="mt-4 bg-[#F8F8F8] p-4 rounded-[5px] border border-[#E5E7EB]">
                          <span className="font-bold">Explanation:</span>{' '}
                          {question.reason}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}