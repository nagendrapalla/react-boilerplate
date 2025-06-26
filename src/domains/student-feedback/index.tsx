import { FeedbackResponseSchema } from "@/routes/training/tutor/$courseId/trainee/$traineeId";
import {
  TrashIcon, PencilIcon,
  //  Download, 
  // Sparkles,
  // Wand,
} from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  // DialogTrigger,
  ScrollArea,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "ti-react-template/components";
import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { getAxios, postAxios, deleteAxios, putAxios } from "@/shared/api/apiClient";
import {
  useState
} from "react";
import { z } from "zod";
import { getInitials } from "@/shared/utlis/getIntial";
// import { jsPDF } from "jspdf";
import { useEffect } from 'react';
// import { BackButton } from "@/shared/components/back-button";
import { AIInsightsDialog } from "@/shared/components/ai-insights-dialog";
import { PerformanceInsightsCard } from "@/shared/components/performance-insights-card";

const cohortSchema = z.array(z.object(
  {
    id: z.number(),
    cohortName: z.string()
  })
)
type cohortData = z.infer<typeof cohortSchema>;

const traineeSchema = z.object({
  traineeName: z.string().optional().nullable(),
  traineeFullName:z.string().optional().nullable(),
  cohortName: z.string().optional(),
  rank: z.number().optional(),
  totalScore: z.string().optional(),
  percentage: z.string().optional(),
  courseCompletion: z.string().optional()
}).readonly();

type TraineeData = z.infer<typeof traineeSchema>;

const topicStats = z.object({
  userId: z.number(),
  totalTopics: z.number(),
  completed: z.number(),
  incomplete: z.number(),
  topics: z.array(z.object({
    topicId: z.number(),
    topicName: z.string(),
    completed: z.boolean(),
    scorePercent: z.number(),
    averageScorePercent: z.number()
  })
  )
});


type topicStatsData = z.infer<typeof topicStats>;

async function fetchCohorts(): Promise<cohortData> {
  const response = await getAxios(`/api/v0/cohorts`);
  return cohortSchema.parse(response.data);
}

async function fetchTopicStats(traineeId: string, courseId: string): Promise<topicStatsData> {
  const response = await getAxios(`/api/v0/courses/${courseId}/topicstats/user/${traineeId}/`);
  return topicStats.parse(response.data);
}

async function fetchTrainee(traineeId: string, courseId: string): Promise<TraineeData> {
  const response = await getAxios(`/api/v0/trainee/${traineeId}/courses/${courseId}/performanceDetails`);
  return traineeSchema.parse(response.data);
}

/**
 * Renders the Student Feedback component, which displays feedback and performance details
 * for a specific trainee in a course.
 *
 * @param {Object} props - The properties for the component.
 * @param {FeedbackResponseSchema} props.feedback - The feedback data for the trainee.
 * @param {string} props.traineeId - The ID of the trainee.
 * @param {string} props.courseId - The ID of the course.
 * @param {string} props.courseTitle - The title of the course.
 * @param {string} props.userId - The ID of the user giving feedback.
 * @returns {JSX.Element} - The rendered Student Feedback component.
 */
export const StudentFeedback = ({ feedback, traineeId, courseId, courseTitle, userId }: { feedback: FeedbackResponseSchema, traineeId: string, courseId: string, courseTitle: string, userId: string }): JSX.Element => {


  const [feedbackText, setFeedbackText] = useState("");
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [editingFeedback, setEditingFeedback] = useState<{ id: number, text: string } | null>(null);
  // const [isChangingCohort, setIsChangingCohort] = useState(false);
  const queryClient = useQueryClient();
  const [topicFilter, setTopicFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [showFullSummary, setShowFullSummary] = useState(false)


  const truncateToWords = (str: string | undefined, numWords: number): string => {
    if (!str) return '';
    const words = str.split(' ');
    if (words.length <= numWords) return str;
    return words.slice(0, numWords).join(' ') + '...';
  };

  const { data: trainee } = useSuspenseQuery({
    queryKey: ["trainee", traineeId, courseId],
    queryFn: () => fetchTrainee(traineeId, courseId),
  });

  if (!trainee) {
    throw new Error("Trainee data not found");
  }

  const { mutate: generateSummary, data: summaryData, isPending: isSummaryPending } = useMutation({
    mutationFn: async () => {
      const response = await postAxios(`/api/v0/admin/gen-ai/course/${courseId}/${traineeId}/summary`, {
        traineeName: trainee.traineeFullName,
      });
      if (response.status !== 200) {
        return "No valid response received.";
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainee", traineeId] });
    },
  });

  useEffect(() => {
    generateSummary();
  }, [traineeId]);
  const displaySummary = summaryData ? truncateToWords(summaryData,50) : "";

  const { data: topicStats } = useSuspenseQuery({
    queryKey: ["topicStats", traineeId, courseId],
    queryFn: () => fetchTopicStats(traineeId, courseId),

  });
  if (!topicStats) {
    throw new Error("TopicStats data not found");
  }

  const { data: cohorts } = useSuspenseQuery({
    queryKey: ["cohorts"],
    queryFn: () => fetchCohorts(),

  });
  if (!cohorts) {
    throw new Error("cohorts data not found");
  }

  const { mutate: submitFeedback, isPending: isSubmittingFeedback } = useMutation({
    mutationFn: async () => {
      const response = await postAxios(`/api/v0/trainee/${traineeId}/feedback?givenByUserId=${userId}`, {
        comments: feedbackText,
      });
      return response.data;
    },
    onSuccess: () => {
      setFeedbackText("");
      setShowFeedback(false);
      queryClient.invalidateQueries({ queryKey: ['feedback', traineeId] });
    },
  });

  // const { mutate: changeCohort, } = useMutation({
  //   mutationFn: async (Id: number) => {
  //     const response = await postAxios(`/api/v0/cohorts/users`, {
  //       userId: parseInt(traineeId),
  //       cohortId: Id
  //     });
  //     return response.data;
  //   },
  //   onSuccess: () => {
  //     setIsChangingCohort(false);
  //     queryClient.invalidateQueries({ queryKey: ['trainee', traineeId] });
  //   },
  // });

  const { mutate: deleteFeedback, } = useMutation({
    mutationFn: async (feedbackId: number) => {
      const response = await deleteAxios(
        `/api/v0/trainee/${traineeId}/feedback/${feedbackId}?givenByUserId=${userId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', traineeId] });
    },
  });

  const { mutate: updateFeedback } = useMutation({
    mutationFn: async ({ feedbackId, comments }: { feedbackId: number, comments: string }) => {
      const response = await putAxios(
        `/api/v0/trainee/${traineeId}/feedback/${feedbackId}?userId=${traineeId}&givenByUserId=${userId}`,
        { comments }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', traineeId] });
      setEditingFeedback(null);
    },
  });

  const handleShowFeedback = () => {
    setShowFeedback(!showFeedback)
  }

  // const handleCohortChange = (cohortId: number) => {
  //   console.log(cohortId, "Id")
  //   changeCohort(cohortId);
  // };

  const handleDeleteFeedback = (feedbackId: number) => {
    deleteFeedback(feedbackId);
  };

  const handleUpdateFeedback = (feedbackId: number, comments: string) => {
    updateFeedback({ feedbackId, comments });
  };

  const handleSubmit = () => {
    if (!feedbackText.trim()) {
      return;
    }
    submitFeedback();
  };

  return (
    <div className="bg-neutral-100 min-h-screen">
      <div className="max-w-[1920px] mx-auto relative p-5 ">


        <div className="flex justify-between items-center m-2 p-2">
        <Breadcrumb>
        <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/training/tutor">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Student Feedback</BreadcrumbPage>
        </BreadcrumbItem>
        </BreadcrumbList>
        </Breadcrumb>
          <h1 className="text-xl text-neutral-900 tracking-wider font-semibold">{courseTitle}</h1>
          <div className="flex items-center gap-4">
            {/* <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                const doc = new jsPDF();
                const margin = 20;
                let currentY = margin;

                const addText = (text: string, fontSize: number, indent: number = 0) => {
                  doc.setFontSize(fontSize);
                  const maxWidth = doc.internal.pageSize.width - 2 * margin - indent;
                  const lines = doc.splitTextToSize(text, maxWidth);
                  
                  lines.map((line: string) => {
                    if (currentY > doc.internal.pageSize.height - margin) {
                      doc.addPage();
                      currentY = margin;
                    }
                    doc.text(line, margin + indent, currentY);
                    currentY += fontSize * 0.5;
                  });
                  currentY += 5;
                };

                addText(`Performance Summary - ${trainee.traineeName}`, 16);
                currentY += 10;

                addText("Student Details", 14);
                const details = [
                  `Name: ${trainee.traineeName}`,
                  `Classroom: ${trainee.cohortName}`,
                  `Rank: ${trainee.rank}`,
                  `Total Score: ${trainee.totalScore}`,
                  `Overall Performance: ${trainee.percentage}`
                ];
                details.map(detail => addText(detail, 11, 10));
                currentY += 10;

                if (summaryData) {
                  currentY += 10;
                  addText("Performance Summary", 14);
                  addText(summaryData, 11, 10);
                }

                if (topicStats) {
                  addText("Topic Statistics", 14);
                  addText(`Total Topics: ${topicStats.totalTopics}`, 11, 10);
                  addText(`Completed: ${topicStats.completed}`, 11, 10);
                  addText(`Incomplete: ${topicStats.incomplete}`, 11, 10);
                  currentY += 10;

                  addText("Topic-wise Performance", 14);
                  topicStats.topics.map(topic => {
                    const topicText = `${topic.topicName}\n` +
                      `Status: ${topic.completed ? 'Completed' : 'Incomplete'}\n` +
                      `Score: ${topic.scorePercent}%\n` +
                      `Average Score: ${topic.averageScorePercent}%`;
                    addText(topicText, 11, 10);
                    currentY += 5;
                  });
                }
                
                if (feedback && feedback.length > 0) {
                  currentY += 10;
                  addText("Feedback History", 14);
                  feedback.map(item => {
                    const feedbackText = `${item.comments}\n` +
                      `Given by: ${item.givenBy || 'Anonymous'}\n` +
                      `Date: ${item.updatedAt || 'No Date provided'}`;
                    addText(feedbackText, 11, 10);
                    currentY += 5;
                  });
                }

                doc.save(`${trainee.traineeName}_performance_summary.pdf`);
              }}
              disabled={!summaryData || isSummaryPending}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button> */}
          </div>
        </div>



        {/* Student Profile Card */}
        <Card className="mb-6 ">
          <CardContent className="p-6">
            <div className="flex  items-start justify-start w-full ">
              <div className="flex items-center gap-6 w-full">
                <div
                  className="w-[43px] h-[43px] rounded-full bg-gray-700 flex items-center justify-center text-sm text-white font-medium"
                >
                  {getInitials(trainee.traineeName ?? "")}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{trainee.traineeFullName}</h3>
                </div>
                <div className="flex items-center gap-3 ml-6">
                  <div className="w-[43px] h-[43px] bg-gray-50 rounded-full flex items-center justify-center">
                    <img
                      src="https://c.animaapp.com/0pbQA243/img/fi-3060967.svg"
                      alt="Cohort"
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="text-xs font-medium">Classroom: {trainee.cohortName}</div>
                    {/* <Dialog open={isChangingCohort} onOpenChange={setIsChangingCohort}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="gap-1 p-0 h-[50%] text-xs font-medium">
                          <img
                            src="https://c.animaapp.com/0pbQA243/img/fi-9883181.svg"
                            alt="Change"
                            className="w-4 h-4"
                          />{" "}
                          Change Classroom
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Select Classroom</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-2">
                          {cohorts.map((cohort) => (
                            <Button
                              key={cohort.id}
                              variant={cohort.cohortName === trainee.cohortName ? "secondary" : "outline"}
                              onClick={() => handleCohortChange(cohort.id)}
                              className="w-full justify-start"
                            >
                              {cohort.cohortName}
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog> */}
                  </div>
                </div>
              <div className="flex items-center justify-center gap-6 ">
                  <Card className="bg-blue-gray50 border-none shadow-none">
                    <CardContent className="flex items-center gap-4 p-4 ">
                      <div className=" bg-white rounded-lg flex items-center justify-center">
                        <img
                          src="/training/images/total-score.svg"
                          alt="Total Score"
                          className="w-10 h-10"
                        />
                      </div>
                      <div className="flex w-[150px] h-[40px] gap-1 items-center justify-start">
                        <p className="text-xs font-medium">Total Score</p>
                        <p className="text-base font-semibold text-gray-4">
                          {trainee.totalScore}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-gray50 border-none shadow-none">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="w-[42px] h-[42px] bg-white rounded-lg flex items-center justify-center">
                        <img
                          src="/training/images/course-completion-logo.svg"
                          alt="Percentage"
                          className="w-6 h-6"
                        />
                      </div>
                      <div className="flex w-[150px] h-[40px] gap-1 items-center justify-start">
                        <p className="text-xs font-medium">Course Completion</p>
                        <p className="text-base font-semibold text-gray-4">
                          {trainee.courseCompletion}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-gray50 border-none shadow-none">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className=" bg-white rounded-lg flex items-center justify-center">
                        <img
                          src="https://c.animaapp.com/0pbQA243/img/trophy.svg"
                          alt="Rank"
                          className="w-6 h-6"
                        />
                      </div>
                      <div className="flex w-[150px]  h-[40px] gap-1 items-center justify-start">
                        <p className="text-xs font-medium">Rank</p>
                        <p className="text-base font-semibold text-gray-4">
                          {trainee.rank}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <PerformanceInsightsCard
            summaryData={summaryData}
            displaySummary={displaySummary}
            isLoading={isSummaryPending}
            onReadMoreClick={() => setShowFullSummary(true)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Topic Stats Card */}
          <Card>

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Topics Performance</h2>
                <Select value={topicFilter} onValueChange={(value: "all" | "completed" | "incomplete") => setTopicFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <ScrollArea className="h-[60vh] rounded-md">
              <CardContent>

                <div className="flex items-center gap-2 justify-end">

                  <div className="flex items-center gap-2">
                    <div className="w-[11px] h-[11px]  bg-blue-800/50 rounded-full" />
                    <span className="text-xs font-medium">Student Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-[11px] h-[11px] bg-gray-600 rounded-full" />
                    <span className="text-xs font-medium">Average Score</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {topicStats.topics?.filter(topic =>
                    topicFilter === "all" ? true :
                      topicFilter === "completed" ? topic.completed :
                        !topic.completed
                  ).map((topic) => (
                    <div key={topic.topicName}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{topic.topicName}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative w-[173px]">
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
                                <p className="text-sm text-gray-500">Average Score: {topic.averageScorePercent}%</p>
                                <p className="text-sm text-blue-800/90">Student Score: {topic.scorePercent}%</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {topicStats.topics.indexOf(topic) < topicStats.topics.length - 1 && (
                        <Separator />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Feedback Card */}
          <Card>

            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="https://c.animaapp.com/0pbQA243/img/frame-1.svg"
                  alt="Feedback"
                  className="w-6 h-6"
                />
                <CardTitle>Feedback</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="bg-white outline outline-1 hover:bg-gray-50" onClick={handleShowFeedback}>Give Feedback</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              {
                showFeedback &&
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Give Feedback</h4>
                  <Textarea
                    placeholder="Enter your feedback here..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="min-h-[150px] mb-4"
                  />
                  <Button
                    className={`w-full ${!feedbackText.trim() ? "bg-gray-700" : "bg-black"}`}
                    onClick={handleSubmit}
                    disabled={isSubmittingFeedback || !feedbackText.trim()}
                  >
                    {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              }
              <ScrollArea className="h-[60vh] rounded-md pr-4">
                <div className="space-y-2">
                  {feedback.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>No feedback available yet</p>
                    </div>
                  ) : (
                    feedback.map((item, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="font-semibold mb-1">{item.updatedAt}</div>
                              <div className="font-semibold mb-1">{item.givenBy}</div>
                            </div>

                            <div className="flex justify-between items-center">
                              {editingFeedback?.id === item.id ? (
                                <div className="flex-1 mr-2">
                                  <Textarea
                                    value={editingFeedback.text}
                                    onChange={(e) => setEditingFeedback({ ...editingFeedback, text: e.target.value })}
                                    className="min-h-[60px]"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleUpdateFeedback(item.id, editingFeedback.text)}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingFeedback(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-1 justify-between items-center">
                                  <p className="text-gray-600">{item.comments}</p>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingFeedback({ id: item.id, text: item.comments })}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteFeedback(item.id)}
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )
                  }
                </div>
              </ScrollArea>
            </CardContent>

          </Card>
        </div>
        <AIInsightsDialog 
          open={showFullSummary}
          onOpenChange={setShowFullSummary}
          description={`Comprehensive analysis of ${trainee.traineeFullName}'s performance`}
          content={summaryData}
        />
      </div>
    </div>
  );
};