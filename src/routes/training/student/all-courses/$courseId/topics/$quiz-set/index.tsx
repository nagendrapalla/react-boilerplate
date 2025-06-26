import {
  deleteAxios,
  getAxios,
  postAxios,
  putAxios,
  patchAxios,
} from '@/shared/api/apiClient'
import { ScaleRotateTransition } from '@/shared/components/motion/transitions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { FieldApi, useForm } from '@tanstack/react-form'
import { motion } from 'framer-motion'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  Input,
  Textarea,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'ti-react-template/components'
import { toast } from 'react-toastify'
import { SquarePen, Trash, Plus, Sparkles, X, Wand } from 'lucide-react'
import { Dispatch, SetStateAction, useState, useEffect } from 'react'
// import { PageHeader } from '@/shared/components/page-header'

const quizQuestionSchema = z.object({
  quizId: z.number(),
  questionId: z.number(),
  question: z.string().nullable(),
  choices: z.record(z.string().nullable()),
  reason: z.string().nullable().optional(),
  correctChoice: z.string().nullable(),
  userChoice: z.null().optional(),
  questionSource: z.string(),
  disabled: z.boolean(),
})

const quizSetSchema = z.object({
  quizId: z.number(),
  topicId: z.number(),
  topicName: z.string(),
  quizSetsDTO: z.array(quizQuestionSchema),
})

// type QuizSet = z.infer<typeof quizSetSchema>["quizSetsDTO"];

type ApiErrorResponse = {
  error?: string
  message?: string
}

type QuizSetResponse = {
  quizSets: z.infer<typeof quizSetSchema>['quizSetsDTO']
  topicName: string
  quizId: number
}

async function fetchQuizSet(quizSetId: string): Promise<QuizSetResponse> {
  try {
    if (!quizSetId) {
      throw new Error('Quiz set ID is required')
    }

    console.log('Fetching quiz set with ID:', quizSetId)
    const { data: response } = await getAxios(
      `/api/v0/admin/quiz-sets/topic/${quizSetId}/`,
    )

    // Check if the response is an error
    if (
      typeof response === 'object' &&
      ((response as ApiErrorResponse).error ||
        (response as ApiErrorResponse).message)
    ) {
      const errorResponse = response as ApiErrorResponse
      const errorMessage = errorResponse.error || errorResponse.message
      throw new Error(errorMessage || 'Unknown error occurred')
    }

    // Parse and validate the response
    const parsedData = quizSetSchema.parse(response)
    return {
      quizSets: parsedData.quizSetsDTO,
      topicName: parsedData.topicName,
      quizId: parsedData.quizId,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        'Zod validation error:',
        JSON.stringify(error.issues, null, 2),
      )
      const formattedIssues = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')
      throw new Error(`Invalid quiz set data structure: ${formattedIssues}`)
    }

    if (error instanceof Error) {
      console.error('Error fetching quiz set:', error.message)
      throw error
    }

    console.error('Unknown error:', error)
    throw new Error('An unexpected error occurred while fetching the quiz set')
  }
}

const quizQuestionSchemaForAdd = z.object({
  quizId: z.number().nullable(),
  questionId: z.number(),
  question: z.string(),
  choices: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
  }),
  reason: z.string().nullable(),
  correctChoice: z.enum(['A', 'B', 'C', 'D']).or(z.string().length(0)),
  userChoice: z.enum(['A', 'B', 'C', 'D']).nullable(),
  // questionSource: z.string(),
  // disabled: z.boolean(),
})

type QuizQuestion = z.infer<typeof quizQuestionSchemaForAdd>

type Choice = 'A' | 'B' | 'C' | 'D'
type ChoiceField = `choices.${Choice}`

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'] as const

// const toggleQuestionSchema = z.object({
//   enable: z.boolean(),
// });

// type ToggleQuestionRequest = z.infer<typeof toggleQuestionSchema>;

async function toggleQuestionState(
  questionId: number,
  enable: boolean,
): Promise<string> {
  const { data } = await patchAxios(
    `/api/v0/admin/quiz-sets/${questionId}/question/${enable}`,
    {},
  )

  if ((data as ApiErrorResponse).error || (data as ApiErrorResponse).message) {
    const errorResponse = data as ApiErrorResponse
    throw new Error(
      errorResponse.error ||
        errorResponse.message ||
        'Failed to toggle question state',
    )
  }
  
  // Return success message from response or a default message
  return data?.message || (enable ? 'Question enabled successfully' : 'Question disabled successfully')
}

export const Route = createFileRoute(
  '/training/student/all-courses/$courseId/topics/$quiz-set/',
)({
  component: RouteComponent,
})

function AddQuizDialog({
  isOpen,
  onOpenChange,
  topicQuizId,
  quizSetId,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  topicQuizId?: number
  quizSetId: string
}): JSX.Element {
  const [showErrors, setShowErrors] = useState(false)
  type QuizFormData = Readonly<{
    quizId: number
    question: string
    choices: Readonly<{
      A: string
      B: string
      C: string
      D: string
    }>
    correctChoice: string
    reason: string
    userChoice: null
  }>

  const quizFormSchema = z.object({
    quizId: z.number(),
    question: z.string().min(1, 'Question is required'),
    choices: z.object({
      A: z.string().min(1, 'Option A is required'),
      B: z.string().min(1, 'Option B is required'),
      C: z.string().min(1, 'Option C is required'),
      D: z.string().min(1, 'Option D is required'),
    }),
    correctChoice: z
      .string()
      .min(1, 'Correct answer is required')
      .refine(
        (val) => ['A', 'B', 'C', 'D'].includes(val.toUpperCase()),
        'Answer must be A, B, C, or D',
      )
      .transform((val) => val.toUpperCase()),
    reason: z.string().min(1, 'Explanation is required'),
    userChoice: z.null(),
  })

  function FieldError({
    field,
    showErrors,
  }: Readonly<{
    field: FieldApi<QuizFormData, any>
    showErrors: boolean
  }>) {
    return (
      <>
        {showErrors && field.state.meta.errors?.length > 0 && (
          <span className="text-sm text-red-500 mt-1 block">
            {field.state.meta.errors.join(', ')}
          </span>
        )}
      </>
    )
  }

  const form = useForm<QuizFormData>({
    defaultValues: {
      quizId: topicQuizId ?? 0,
      question: '',
      choices: {
        A: '',
        B: '',
        C: '',
        D: '',
      },
      correctChoice: '',
      reason: '',
      userChoice: null,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value)
      } catch (error) {
        console.error('Failed to submit:', error)
      }
    },
    validators: {
      onSubmit: quizFormSchema,
      onChange: quizFormSchema,
    },
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (newQuestion: QuizFormData) => {
      console.log('Adding new question with payload:', newQuestion)
      const response = await postAxios(
        `/api/v0/admin/quiz-sets/question`,
        newQuestion,
      )
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizSet', quizSetId] })
      toast.success('Question added successfully')
      onOpenChange(false)
      resetForm()
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add question'
      toast.error(errorMessage)
      console.error('Failed to add question:', error)
    },
  })

  const resetForm = () => {
    form.reset({
      quizId: topicQuizId ?? 0,
      question: '',
      choices: {
        A: '',
        B: '',
        C: '',
        D: '',
      },
      correctChoice: '',
      reason: '',
      userChoice: null,
    })
    setShowErrors(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex justify-between items-center">
          <DialogTitle className="text-lg">Question</DialogTitle>
          <DialogClose className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none">
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowErrors(true)
            form.handleSubmit()
          }}
          className="space-y-3"
        >
          <div className="hidden">
            <form.Field name="quizId">
              {(fieldApi) => (
                <input
                  type="hidden"
                  value={fieldApi.state.value}
                  onChange={(e) =>
                    fieldApi.handleChange(Number(e.target.value))
                  }
                />
              )}
            </form.Field>

            <form.Field name="userChoice">
              {(fieldApi) => (
                <input
                  type="hidden"
                  value={fieldApi.state.value ?? ''}
                  onChange={(_e) => fieldApi.handleChange(null)}
                />
              )}
            </form.Field>
          </div>

          <form.Field name="question">
            {(fieldApi) => (
              <div className="space-y-1">
                <Input
                  placeholder="Enter your question"
                  value={fieldApi.state.value}
                  onChange={(e) => fieldApi.handleChange(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus-visible:ring-0 focus-visible:border-gray-300"
                />
                <FieldError field={fieldApi} showErrors={showErrors} />
              </div>
            )}
          </form.Field>

          <div className="space-y-3">
            {CHOICES.map((option) => {
              const fieldName = `choices.${option}` as ChoiceField
              return (
                <form.Field key={option} name={fieldName}>
                  {(fieldApi) => (
                    <div className="space-y-1">
                      <div className="flex gap-3 items-center">
                        <span className="text-sm text-gray-600 min-w-[16px]">
                          {option}
                        </span>
                        <Textarea
                          placeholder={`Enter option ${option}`}
                          value={fieldApi.state.value}
                          onChange={(e) =>
                            fieldApi.handleChange(e.target.value)
                          }
                          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus-visible:ring-0 focus-visible:border-gray-300 min-h-[50px] resize-none"
                        />
                      </div>
                      <FieldError field={fieldApi} showErrors={showErrors} />
                    </div>
                  )}
                </form.Field>
              )
            })}
          </div>

          <form.Field name="correctChoice">
            {(fieldApi) => (
              <div className="space-y-1">
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-gray-600 min-w-[16px]">
                    Answer
                  </span>
                  <Select
                    value={fieldApi.state.value}
                    onValueChange={(value) => fieldApi.handleChange(value)}
                  >
                    <SelectTrigger className="border border-gray-200 rounded px-3 py-2 text-sm focus-visible:ring-0 focus-visible:border-gray-300 w-full">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHOICES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FieldError field={fieldApi} showErrors={showErrors} />
              </div>
            )}
          </form.Field>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">Explanation</div>
            <form.Field name="reason">
              {(fieldApi) => (
                <div className="space-y-1">
                  <Textarea
                    placeholder="Enter the explanation"
                    value={fieldApi.state.value ?? ''}
                    onChange={(e) => fieldApi.handleChange(e.target.value)}
                    className="min-h-[120px] w-full border border-gray-200 rounded px-3 py-2 text-sm resize-none focus-visible:ring-0 focus-visible:border-gray-300"
                  />
                  <FieldError field={fieldApi} showErrors={showErrors} />
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-[#0F172A] text-white hover:bg-[#1E293B] px-6"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RouteComponent() {
  const { 'quiz-set': quizSetId ,courseId } = Route.useParams()
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null,
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddQuizDialogOpen, setIsAddQuizDialogOpen] = useState(false)
  // const [hiddenQuestions, setHiddenQuestions] = useState<number[]>([]);

  // const toggleQuestionVisibility = (questionId: number) => {
  //   setHiddenQuestions(prev =>
  //     prev.includes(questionId)
  //       ? prev.filter(id => id !== questionId)
  //       : [...prev, questionId]
  //   );
  // };

  // const isQuestionVisible = (questionId: number) => !hiddenQuestions.includes(questionId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['quizSet', quizSetId],
    queryFn: () => fetchQuizSet(quizSetId),
    enabled: !!quizSetId,
  })

  // Store the quizId from the API response
  const quizId = data?.quizId
  // Get the topicId from the URL parameter (which is the quizSetId in this case)
  const topicId = quizSetId

  const deleteMutation = useMutation({
    mutationFn: async (questionId: number) => {
      return await deleteAxios(`/api/v0/admin/quiz-sets/${questionId}/question`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizSet', quizSetId] })
      toast.success('Question deleted successfully')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete question'
      toast.error(errorMessage)
      console.error('Failed to delete question:', error)
    },
  })

  const toggleQuestionMutation = useMutation({
    mutationFn: ({
      questionId,
      enable,
    }: {
      questionId: number
      enable: boolean
    }) => toggleQuestionState(questionId, enable),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizSet', quizSetId] })
      toast.success(data)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update question state')
    },
  })

  // Auto generate questions mutation
  const autoGenerateQuestionsMutation = useMutation({
    mutationFn: async () => {
      if (!topicId) {
        throw new Error('Topic ID is required to generate questions')
      }
      // Call the API
      const response = await putAxios(`/api/v0/admin/quiz-sets/topic/${topicId}/questions`, {})
      
      // Check for error status codes
      if (response.status >= 400) {
        throw new Error(response.data?.message || `Request failed with status code ${response.status}`)
      }
      
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizSet', quizSetId] })
      toast.success('Questions auto-generated successfully')
    },
    onError: (error: any) => {
      // Check for specific error status codes
      if (error.response?.status === 404) {
        toast.error('The requested resource was not found. Please check if the topic still exists.')
      } else if (error.response?.status === 429) {
        toast.error("You've reached the limit for generating questions. Please try again later!")
      } else {
        toast.error("You've reached the limit for generating questions. Please try again later!")
      }
      console.error('Error auto-generating questions:', error)
    },
  })

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await deleteMutation.mutateAsync(questionId)
    } catch (error) {
      console.error('Failed to delete question:', error)
    }
  }

  const handleToggleQuestion = (questionId: number, currentState: boolean) => {
    // If trying to disable a question (currentState is currently true, toggling to false)
    // and there are 10 or fewer enabled questions, prevent the action
    if (!currentState) {
      // Count the number of enabled questions
      const enabledQuestionsCount = data?.quizSets?.filter(q => !q.disabled).length || 0;
      
      // If there are 10 or fewer enabled questions, show an error message and don't toggle
      if (enabledQuestionsCount <= 10) {
        toast.error('Cannot disable this question. At least 10 questions must remain enabled for Quiz.');
        return;
      }
    }
    
    toggleQuestionMutation.mutate({
      questionId,
      enable: currentState,
    })
  }

  const handleAutoGenerateQuestions = () => {
    autoGenerateQuestionsMutation.mutate()
  }

  const queryClient = useQueryClient()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    console.error('Error loading quiz set:', error)
    return <div>Error loading quiz set</div>
  }

  if (!data) {
    return <div>No quiz set found</div>
  }

  // Sort the questions by questionId to ensure consistent order
  const sortedQuizSets = data?.quizSets //? [...data.quizSets].sort((a, b) => a.questionId - b.questionId) : []

  return (
    <ScaleRotateTransition>
      <motion.div className="h-screen px-6 py-3 flex flex-col">
        {/* <PageHeader className="mb-4" /> */}
      
        <Card className="flex-1 bg-[#faf8f7] rounded-lg px-4">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between w-full">
                <div className='w-full'>

              <Breadcrumb>
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
          <BreadcrumbPage>Compose Quiz</BreadcrumbPage>
        </BreadcrumbItem>
        </BreadcrumbList>
        </Breadcrumb> 
        </div>

                <CardTitle className='w-full items-center'>{data.topicName}</CardTitle>
                <div className="w-full"></div>
                <AddQuizDialog
                  isOpen={isAddQuizDialogOpen}
                  onOpenChange={setIsAddQuizDialogOpen}
                  topicQuizId={quizId}
                  quizSetId={quizSetId}
                />
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="default"
                  className="bg-[#0F172A] text-white hover:bg-[#1E293B] flex items-center gap-2"
                  onClick={() => setIsAddQuizDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
                <Button
                  variant="default"
                  className="bg-[#1E293B] text-white hover:bg-[#334155] flex items-center gap-2"
                  onClick={handleAutoGenerateQuestions}
                  disabled={autoGenerateQuestionsMutation.isPending}
                >
                  <Sparkles className="h-4 w-4" />
                  {autoGenerateQuestionsMutation.isPending ? 'Generating...' : 'Auto Generate Questions'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-250px)] pr-4">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {Array.isArray(sortedQuizSets)
                  ? sortedQuizSets.map((question, index) => (
                      <AccordionItem
                        key={question.questionId}
                        value={`question-${question.questionId}`}
                        className="border rounded-lg px-3 bg-white"
                      >
                        <AccordionTrigger
                          className={`hover:no-underline [&[data-state=open]>div>div:last-child]:rotate-0 ${question.disabled ? 'opacity-70' : ''}`}
                        >
                          <div className="flex items-start justify-between w-full py-1">
                            <div className="flex gap-4">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md text-base text-gray-900">
                                Q{index + 1}.
                              </div>
                              <div className="text-start">
                                <div className="text-medium text-gray-900">
                                  {question.question}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 mr-2">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (question.questionId !== undefined) {
                                      setSelectedQuestionId(question.questionId)
                                      setIsDialogOpen(true)
                                    }
                                  }}
                                  className="rounded-md p-1.5 text-[#1F2937] hover:text-[#111827] cursor-pointer"
                                  role="button"
                                  aria-label="Edit question"
                                >
                                  <SquarePen className="h-4 w-4" />
                                </div>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteQuestion(question.questionId)
                                  }}
                                  className="rounded-md p-1.5 text-[#1F2937] hover:text-[#111827] cursor-pointer"
                                  role="button"
                                  aria-label="Delete question"
                                >
                                  <Trash className="h-4 w-4" />
                                </div>

                                <div
                                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer ${!question.disabled ? 'bg-[#1F2937]' : 'bg-[#D1D5DB]'}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleQuestion(
                                      question.questionId,
                                      question.disabled,
                                    )
                                  }}
                                  role="switch"
                                  aria-checked={!question.disabled}
                                  aria-label="Toggle question state"
                                  tabIndex={0}
                                >
                                  <span className="sr-only">
                                    {!question.disabled ? 'Disable question' : 'Enable question'}
                                  </span>
                                  <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${!question.disabled ? 'translate-x-[14px]' : 'translate-x-0.5'}`}
                                  />
                                </div>

                                {question.questionSource !== 'Revised' && (
                                  <span
                                    // className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-[#F3F4F6] text-[#4B5563] ring-[#E5E7EB]`}
                                  >
                                    {question.questionSource === "AI Generated" ? (
                                      <>
                                        {/* AI Generated <Wand className="h-3 w-3 ml-1" /> */}
                                     
                                      <Badge variant="outline" className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap flex items-center gap-1">
                                      <span>AI Generated</span> <Wand className="h-3 w-3 flex-shrink-0"/>
                                    </Badge>
                                    </>
                                    ) : question.questionSource}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4 space-y-2">
                            {Object.entries(question.choices).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className={`flex items-center gap-3 p-3 rounded-lg border border-[#eae5e3] ${
                                    question.correctChoice === key
                                      ? 'bg-[#f3f4f6]'
                                      : 'bg-white'
                                  }`}
                                >
                                  <div className="text-sm text-gray-900 font-medium min-w-[20px]">
                                    {key}. {value}
                                  </div>
                                </div>
                              ),
                            )}
                            {question.reason && (
                              <div className="mt-6">
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                  <div className="text-sm font-medium text-gray-900">
                                    Explanation:
                                  </div>
                                  <div className="text-sm text-gray-600 leading-relaxed">
                                    {question.reason}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))
                  : null}
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>
        <EditQuizDialog
          questionId={selectedQuestionId}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          topicQuizId={quizId}
          quizSetId={quizSetId}
        />
      </motion.div>
    </ScaleRotateTransition>
  )
}

async function fetchQuestionById(questionId: number): Promise<QuizQuestion> {
  try {
    const { data } = await getAxios(`/api/v0/admin/quiz-sets/${questionId}`)
    if (!data) {
      throw new Error('No data found for the given question ID')
    }
    return quizQuestionSchemaForAdd.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        'Zod validation error:',
        JSON.stringify(error.issues, null, 2),
      )
      throw new Error('Invalid quiz question data structure')
    }
    console.error('Error fetching quiz question:', error)
    throw new Error(
      'An unexpected error occurred while fetching the quiz question',
    )
  }
}

function EditQuizDialog({
  questionId,
  isOpen,
  onOpenChange,
  topicQuizId,
  quizSetId,
}: {
  readonly questionId: number | null
  readonly isOpen: boolean
  readonly onOpenChange: Dispatch<SetStateAction<boolean>>
  readonly topicQuizId: number | undefined
  readonly quizSetId: string
}): JSX.Element {
  console.log('Question ID:', questionId)

  const {
    data: quizQuestion,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['quizQuestion', questionId],
    queryFn: () => fetchQuestionById(questionId!),
    enabled: !!questionId && isOpen,
    refetchOnMount: true,
  })

  console.log('Quiz Question:', quizQuestion)

  const [showErrors, setShowErrors] = useState(false)

  type QuizFormData = Readonly<{
    quizId: number
    question: string
    choices: Readonly<{
      A: string
      B: string
      C: string
      D: string
    }>
    correctChoice: string
    reason: string
    userChoice: null
  }>

  const quizFormSchema = z.object({
    quizId: z.number(),
    question: z.string().min(1, 'Question is required'),
    choices: z.object({
      A: z.string().min(1, 'Option A is required'),
      B: z.string().min(1, 'Option B is required'),
      C: z.string().min(1, 'Option C is required'),
      D: z.string().min(1, 'Option D is required'),
    }),
    correctChoice: z
      .string()
      .min(1, 'Correct answer is required')
      .refine(
        (val) => ['A', 'B', 'C', 'D'].includes(val.toUpperCase()),
        'Answer must be A, B, C, or D',
      )
      .transform((val) => val.toUpperCase()),
    reason: z.string().min(1, 'Explanation is required'),
    userChoice: z.null(),
  })

  function FieldError({
    field,
    showErrors,
  }: Readonly<{
    field: FieldApi<QuizFormData, any>
    showErrors: boolean
  }>) {
    return (
      <>
        {showErrors && field.state.meta.errors?.length > 0 && (
          <span className="text-sm text-red-500 mt-1 block">
            {field.state.meta.errors.join(', ')}
          </span>
        )}
      </>
    )
  }

  const form = useForm<QuizFormData>({
    defaultValues: quizQuestion
      ? {
          quizId: topicQuizId ?? 0,
          question: quizQuestion.question,
          choices: quizQuestion.choices,
          correctChoice: quizQuestion.correctChoice,
          reason: quizQuestion.reason ?? '',
          userChoice: null,
        }
      : {
          quizId: topicQuizId ?? 0,
          question: '',
          choices: {
            A: '',
            B: '',
            C: '',
            D: '',
          },
          correctChoice: '',
          reason: '',
          userChoice: null,
        },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value)
      } catch (error) {
        console.error('Failed to update:', error)
      }
    },
    validators: {
      onSubmit: quizFormSchema,
      onChange: quizFormSchema,
    },
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (updatedQuestion: QuizFormData) => {
      // Include the questionId in the API call but not in the form schema
      const payload = questionId
        ? {
            ...updatedQuestion,
            questionId, // Include questionId in the payload as per updated requirements
          }
        : updatedQuestion

      console.log('Submitting payload:', payload)

      const response = await putAxios(
        `/api/v0/admin/quiz-sets/question`,
        payload,
      )
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizSet', quizSetId] })
      queryClient.invalidateQueries({ queryKey: ['quizQuestion', questionId] })
      toast.success('Question updated successfully')
      onOpenChange(false)
      resetForm()
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update question'
      toast.error(errorMessage)
      console.error('Failed to update question:', error)
    },
  })

  useEffect(() => {
    if (quizQuestion && questionId !== null) {
      form.reset({
        quizId: topicQuizId ?? 0,
        question: quizQuestion.question,
        choices: quizQuestion.choices,
        correctChoice: quizQuestion.correctChoice,
        reason: quizQuestion.reason ?? '',
        userChoice: null,
      })
    }
  }, [quizQuestion, questionId, topicQuizId, form])

  useEffect(() => {
    if (isOpen && questionId) {
      refetch();
    }
  }, [isOpen, questionId, refetch]);

  const resetForm = () => {
    form.reset({
      quizId: topicQuizId ?? 0,
      question: '',
      choices: {
        A: '',
        B: '',
        C: '',
        D: '',
      },
      correctChoice: '',
      reason: '',
      userChoice: null,
    })
    setShowErrors(false)
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <DialogContent>
          <div>Loading...</div>
        </DialogContent>
      )
    }

    if (error) {
      return (
        <DialogContent>
          <div>Error loading quiz question</div>
        </DialogContent>
      )
    }

    return (
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setShowErrors(true)
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold">
              Question
            </DialogTitle>
          </div>

          <div className="hidden">
            <form.Field name="quizId">
              {(fieldApi) => (
                <input
                  type="hidden"
                  value={fieldApi.state.value}
                  onChange={(e) =>
                    fieldApi.handleChange(Number(e.target.value))
                  }
                />
              )}
            </form.Field>

            <form.Field name="userChoice">
              {(fieldApi) => (
                <input
                  type="hidden"
                  value={fieldApi.state.value ?? ''}
                  onChange={(_e) => fieldApi.handleChange(null)}
                />
              )}
            </form.Field>
          </div>

          <form.Field name="question">
            {(fieldApi) => (
              <div className="space-y-1">
                <Input
                  placeholder="Enter your question"
                  value={fieldApi.state.value}
                  onChange={(e) => fieldApi.handleChange(e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus-visible:ring-0 focus-visible:border-gray-300"
                />
                <FieldError field={fieldApi} showErrors={showErrors} />
              </div>
            )}
          </form.Field>

          <div className="space-y-3">
            {CHOICES.map((option) => {
              const fieldName = `choices.${option}` as ChoiceField
              return (
                <form.Field key={option} name={fieldName}>
                  {(fieldApi) => (
                    <div className="space-y-1">
                      <div className="flex gap-3 items-center">
                        <span className="text-sm text-gray-600 min-w-[16px]">
                          {option}
                        </span>
                        <Textarea
                          placeholder={`Enter option ${option}`}
                          value={fieldApi.state.value}
                          onChange={(e) =>
                            fieldApi.handleChange(e.target.value)
                          }
                          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus-visible:ring-0 focus-visible:border-gray-300 min-h-[50px] resize-none"
                        />
                      </div>
                      <FieldError field={fieldApi} showErrors={showErrors} />
                    </div>
                  )}
                </form.Field>
              )
            })}
          </div>

          <form.Field name="correctChoice">
            {(fieldApi) => (
              <div className="space-y-1">
                <div className="flex gap-3 items-center">
                  <span className="text-sm text-gray-600 min-w-[16px]">
                    Answer
                  </span>
                  <Select
                    value={fieldApi.state.value || undefined}
                    onValueChange={(value) => fieldApi.handleChange(value)}
                    defaultValue={quizQuestion?.correctChoice || undefined}
                  >
                    <SelectTrigger className="border border-gray-200 rounded px-3 py-2 text-sm focus-visible:ring-0 focus-visible:border-gray-300 w-full">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHOICES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FieldError field={fieldApi} showErrors={showErrors} />
              </div>
            )}
          </form.Field>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">Explanation</div>
            <form.Field name="reason">
              {(fieldApi) => (
                <div className="space-y-1">
                  <Textarea
                    placeholder="Enter the explanation"
                    value={fieldApi.state.value ?? ''}
                    onChange={(e) => fieldApi.handleChange(e.target.value)}
                    className="min-h-[120px] w-full border border-gray-200 rounded px-3 py-2 text-sm resize-none focus-visible:ring-0 focus-visible:border-gray-300"
                  />
                  <FieldError field={fieldApi} showErrors={showErrors} />
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-[#0F172A] text-white hover:bg-[#1E293B] px-6"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    )
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm()
        }
        onOpenChange(open)
      }}
    >
      <DialogContent className="relative w-full max-w-lg border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
