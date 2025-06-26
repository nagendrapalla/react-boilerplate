import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BarChart3Icon,
  Monitor,
  Siren,
  Sparkles,
  Star,
  Wand,
} from "lucide-react";
import {
  Badge,
  // Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "ti-react-template/components";
import { z } from "zod";
import { useState, useTransition, useEffect } from "react";
import { useName } from "@/domains/auth/store/authAtom";
import { getInitials } from "@/shared/utlis/getIntial";
import { getItem } from "@/shared/utlis/localStorage";
import { WelcomeBanner } from "@/shared/components/welcome-banner";
// import { AIInsightsDialog } from "@/shared/components/ai-insights-dialog";
// import { PerformanceInsightsCard } from "@/shared/components/performance-insights-card";
import { getAxios, postAxios } from "@/shared/api/apiClient";

const cohortSchema = z.array(
  z.object({
    id: z.number(),
    cohortName: z.string(),
  })
);
type cohortData = z.infer<typeof cohortSchema>;

const traineeSchema = z.object({
  needsCoaching: z.array(
    z.object({
      traineeId: z.number(),
      traineeName: z.string().nullable(),
      traineeProfileImage: z.string().nullable(),
      traineePerformanceCategory: z.string().nullable(),
      traineePercentage: z.number(),
    })
  ),
  monitor: z.array(
    z.object({
      traineeId: z.number(),
      traineeName: z.string().nullable(),
      traineeProfileImage: z.string().nullable(),
      traineePerformanceCategory: z.string().nullable(),
      traineePercentage: z.number(),
    })
  ),
  superstar: z.array(
    z.object({
      traineeId: z.number(),
      traineeName: z.string().nullable(),
      traineeProfileImage: z.string().nullable(),
      traineePerformanceCategory: z.string().nullable(),
      traineePercentage: z.number(),
    })
  ),
  needsCoachingCount: z.number(),
  monitorCount: z.number(),
  superstarCount: z.number(),
});

type traineeData = z.infer<typeof traineeSchema>;

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

type TraineeArrayKeys = "needsCoaching" | "monitor" | "superstar";
type TraineeDataKey = TraineeArrayKeys;

const categories = [
  {
    id: "needs-coaching",
    icon:<Siren />,
    title: "Needs Coaching",
    dataKey: "needsCoaching" as TraineeDataKey,
    color: "#ff8484",
  },
  {
    id: "monitor",
    icon:<Monitor />,
    title: "Monitor",
    dataKey: "monitor" as TraineeDataKey,
    color: "#ffbc58",
  },
  {
    id: "super-star",
    icon:<Star />,
    title: "Super Star",
    dataKey: "superstar" as TraineeDataKey,
    color: "#76c788",
  },
];

const getBgColorClass = (color: string): string => {
  switch (color) {
    case "#ff8484":
      return "bg-red-100";
    case "#ffbc58":
      return "bg-orange-100";
    default:
      return "bg-green-100";
  }
};

const getProgressBarClass = (color: string): string => {
  switch (color) {
    case "#ff8484":
      return "bg-[#ff8484]";
    case "#ffbc58":
      return "bg-[#ffbc58]";
    case "#76c788":
      return "bg-[#76c788]";
    default:
      return "bg-gray-500";
  }
};

async function fetchCohorts(): Promise<cohortData> {
  const response = await getAxios("/api/v0/cohorts");
  return cohortSchema.parse(response.data);
}

async function fetchCourses(userId: string): Promise<CourseData> {
  const response = await getAxios(`/api/v0/courses/user/${userId}`);
  return courseSchema.parse(response.data);
}

async function fetchTrainees(cohortId?: number, courseId?: number): Promise<traineeData> {
  let url = `/api/v0/admin/reports/trainee/courses/${courseId}`;

  if (cohortId && courseId) {
    url = `/api/v0/admin/reports/trainee/courses/${courseId}?viewBy=cohort&cohortId=${cohortId}`;
  }

  const response = await getAxios(url);
  return traineeSchema.parse(response.data);
}


export function TutorHome() {
  const [summaryData, setSummaryData] = useState<string>("");
  const [displaySummary, setDisplaySummary] = useState<string>("");
  const [_isPending, startTransition] = useTransition();
  // const [showFullSummary, setShowFullSummary] = useState(false)


  const { data: cohorts } = useSuspenseQuery({
    queryKey: ["cohorts"],
    queryFn: fetchCohorts,
  });

  const userId = getItem('userId');

  const { data: courses } = useSuspenseQuery({
    queryKey: ["courses", userId],
    queryFn: () => fetchCourses(userId as string),
  });

  const [selectedCohortId, setSelectedCohortId] = useState<number | undefined>(
    cohorts && cohorts.length > 0 ? cohorts[0].id : undefined
  );

  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(
    courses && courses.length > 0 ? courses[0].courseId : undefined
  );

  const { data: trainees } = useSuspenseQuery({
    queryKey: ["trainees", selectedCohortId, selectedCourseId],
    queryFn: () => fetchTrainees(selectedCohortId, selectedCourseId),
    staleTime: 0,
  });

  const selectedCohort = cohorts?.find((c) => c.id === selectedCohortId);

  const { mutate: generateSummary, data: batchSummary } = useMutation({
    mutationKey: ["batchSummary", selectedCohort?.id, selectedCourseId],
    mutationFn: async () => {
      if (!selectedCohort) return "No data";
      const response = await postAxios(`/api/v0/admin/gen-ai/course/${selectedCourseId}/cohort/summary`, {
        id: selectedCohort.id,
        cohortName: selectedCohort.cohortName,
      });
      return response.status === 200 ? response.data : "No Valid Response Received";
    },
  });

  useEffect(() => {
    if (selectedCohort && selectedCourseId) {
      generateSummary();

    }
  }, [selectedCohort, selectedCourseId]);

  useEffect(() => {
    if (batchSummary) {
      setSummaryData(batchSummary);
      setDisplaySummary(batchSummary);
    }
  }, [batchSummary]);



  const handleCohortChange = (value: string) => {
    startTransition(() => {
      const newCohortId = value === "unassigned" ? undefined : Number(value);
      setSelectedCohortId(newCohortId);
      if (newCohortId) {
        const cohort = cohorts?.find(c => c.id === newCohortId);
        if (cohort) {
          setDisplaySummary("")
          setSummaryData("")
        }
      } else {
        setSummaryData("");
        setDisplaySummary("");
      }
    });
  };

  const handleCourseChange = (value: string) => {
    startTransition(() => {
      const newCourseId = value === "unassigned" ? undefined : Number(value);
      setSelectedCourseId(newCourseId);
    });
  };

  const name = useName();

  if (!trainees) {
    throw new Error("Trainees data not found");
  }

  const getCategoryCount = (category: string) => {
    switch (category) {
      case "needs-coaching":
        return trainees.needsCoachingCount;
      case "monitor":
        return trainees.monitorCount;
      case "super-star":
        return trainees.superstarCount;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-row justify-center w-full">
      <div className="bg-gray-0 w-full h-screen relative pr-3 pl-2">
        <div className="flex justify-between items-center">
          <div></div>
          <div className="flex items-center gap-4">
            {/* <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleDownloadPDF}
              disabled={!summaryData}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button> */}
          </div>
        </div>
        <div className=" mx-auto">
          <WelcomeBanner 
            name={name} 
            imageSrc="  /training/images/instructor.svg"
            // containerClassName="mt-7 flex"
            // imageSize="h-32"
            subText="Track your students and their progress towards your goals."
          />
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3Icon className="w-6 h-6" />
              <h2 className="text-xl font-semibold">
                Your Students Performance
              </h2>
              <Select
                value={selectedCourseId?.toString()}
                onValueChange={handleCourseChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.courseId} value={course.courseId.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}

                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Select
                value={selectedCohortId?.toString() ?? "unassigned"}
                onValueChange={handleCohortChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select cohort" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts?.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id.toString()}>
                      {cohort.cohortName}
                    </SelectItem>
                  ))}
                  <SelectItem value="unassigned">Unassigned</SelectItem>

                </SelectContent>
              </Select>


            </div>
          </div>

          <Separator className="my-4" />
{/* 
          <PerformanceInsightsCard
            summaryData={summaryData}
            displaySummary={displaySummary}
            isLoading={typeof selectedCohortId === "undefined" ? false : !batchSummary}
            placeholderMessage="Please Select Classroom to View Summary"
            showScrollArea={true}
            showPlaceholder={typeof selectedCohortId === "undefined"}
            onReadMoreClick={() => setShowFullSummary(true)}
            subjectName={selectedCohort?.cohortName}
          /> */}

          <Card className="mb-3">
             <CardHeader className="py-3 bg-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Performance Insights</h2>
                </div>
                {summaryData && (
                  <Badge variant="outline" className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                    AI Generated    <Wand />
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-0 h-full min-h-[10vh]">
                {typeof selectedCohortId === "undefined" ? (
                  <div className="flex items-center justify-center p-3">
                    Please Select Classroom to View Summary
                  </div>
                ) : !batchSummary ? (
                  <div className="flex flex-col justify-center items-center py-4 gap-2 animate-pulse">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="text-sm text-gray-500">Generating insights...</p>
                    <p className="text-xs text-gray-400">This may take a moment</p>
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="whitespace-pre-line text-gray-700  animate-fadeIn text-sm">
                      {displaySummary}
                    </div>
                    {/* {summaryData && summaryData.length > displaySummary.length && (
                      <Button
                        variant="link"
                        className="p-0 h-auto mt-2 text-blue-600"
                        onClick={() => setShowFullSummary(true)}
                      >
                        Read more
                      </Button>
                    )} */}
                  </div>
                )}
              </CardContent>
            </Card>

          <div className="grid grid-cols-3 gap-3 ">
            {categories.map((category) => (
              <Card key={category.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      <div className="flex gap-2">
                       {category.icon}
                       {category.title}
                      </div>
                      
                    </CardTitle>
                    <Badge variant="outline">
                      {getCategoryCount(category.id)}
                    </Badge>
                  </CardHeader>
                <ScrollArea className="h-[60vh] rounded-md">
                  <CardContent className="h-[40vh] mb-8">
                    <div className="flex flex-col gap-8">
                      {trainees[category.dataKey].length === 0 ? <p className="flex h-[40vh] items-center justify-center text-sm text-gray-500">There are no students in this group at the moment.</p> :
                        <>
                          {trainees[category.dataKey].map((trainee, index) => (
                            <Link
                              to="/training/tutor/$courseId/trainee/$traineeId"
                              params={{
                                traineeId: trainee.traineeId.toString(),
                                courseId: selectedCourseId?.toString() ?? "",
                              }}

                              key={index}
                            >
                              <div
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-100"
                                  style={{
                                    backgroundColor: `${category.color}20`,
                                  }}
                                >
                                  {getInitials(trainee.traineeName)}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium mb-1">
                                    {trainee.traineeName}
                                  </div>
                                  <Progress
                                    value={trainee.traineePercentage}
                                    className="h-1.5"
                                    indicatorClassName={getProgressBarClass(category.color)}
                                  />
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`bg-opacity-20 ${getBgColorClass(
                                    category.color
                                  )}`}
                                >
                                  {trainee.traineePercentage}%
                                </Badge>
                              </div>
                            </Link>
                          ))}
                        </>}
                    </div>
                  </CardContent>
                </ScrollArea>
              </Card>

            ))}

          </div>
          {/* Spacer div to add extra space at the bottom */}
          <div className="h-4"></div>
        </div>
        {/* <AIInsightsDialog 
          open={showFullSummary}
          onOpenChange={setShowFullSummary}
          description={`Comprehensive analysis of ${selectedCohort?.cohortName}'s performance`}
          content={summaryData}
        /> */}
      </div>
    </div>
  );
}
