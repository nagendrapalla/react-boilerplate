import {  BookOpenIcon, AwardIcon } from "lucide-react";
import { Card, CardContent, Progress, Badge } from "ti-react-template/components";
import "./styles.css";
import "./animation.css"; // Import custom animation styles
import { getAxios, postAxios } from "@/shared/api/apiClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense, useState, useEffect } from "react";
import { useName } from "@/domains/auth/store/authAtom";
import { getItem } from "@/shared/utlis/localStorage";
import { StudentProgress } from "./types"
import { useCourseId } from "@/domains/course/store/courseAtom"; // Import the useCourseId hook
import { WelcomeBanner } from "@/shared/components/welcome-banner";
import { AIInsightsDialog } from "@/shared/components/ai-insights-dialog";
import { PerformanceInsightsCard } from "@/shared/components/performance-insights-card";

const ProgressSchema = z.object({
  traineeName: z.string().nullable(),
  cohortName: z.string().nullable(),
  rank: z.number(),
  totalQuizAttempted: z.number(),
  totalScore: z.string(),
  percentage: z.string().nullable(),
  completed: z.string(),
})

type Progress = z.infer<typeof ProgressSchema>

const defaultCoverImage = "https://img.freepik.com/free-vector/online-tutorials-concept_23-2148529256.jpg";

// Map of course titles to specific cover images
const courseImageMap: Record<string, string> = {
  "Image Review Specialist Manual": "/training/images/Image-Review-Specialist-Manual.jpg",
  // Add more course mappings as needed
};

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

async function fetchStudentProgress(courseId?: number): Promise<StudentProgress> {
  try {
    const userId = getItem('userId')
    console.log('UserId from localStorage:', userId)

    if (!courseId) {
      throw new Error('Course ID is required to fetch student progress')
    }

    console.log('Fetching progress for courseId:', courseId)
    const res = await getAxios(`/api/v0/user/${userId}/course/${courseId}/scoreboard`);
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

    return ProgressSchema.parse(res.data);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    throw error;
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

function useStudentCourseProgress(courseId?: number) {
  return useQuery<StudentProgress>({
    queryKey: ["progress", courseId],
    queryFn: () => courseId ? fetchStudentProgress(courseId) : Promise.reject(new Error('No course ID selected')),
    enabled: !!courseId, // Only run the query if we have a courseId
  });
}

// Create a separate component for course card to properly use hooks
function CourseCard({ course }: { course: Course }) {
  // Fetch progress for this specific course
  const {
    data: courseProgress,
    isLoading: isCourseProgressLoading,
    error: courseProgressError
  } = useStudentCourseProgress(course.courseId);

  // Import the useCourseId hook
  const { updateCourseId } = useCourseId();

  // Handler to update courseId when clicking on a course
  const handleCourseClick = () => {
    console.log('Course clicked:', course.courseId);
    updateCourseId(course.courseId);
  };

  return (
    <div className="flex flex-col">
      <Link
        key={course.courseId}
        to={'/training/student/course/$course-id'}
        params={{
          'course-id': String(course.courseId)
        }}
        search={{
          title: "New Hire Training Manual",
        }}
        className="block h-full"
        onClick={handleCourseClick}
      >
        <Card
          key={course.courseId}
          className="bg-white shadow-cards-long-default relative"
        >
          {course.completionStatus === 100 && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-white p-1 rounded-full shadow-md">
                <AwardIcon className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          )}
          <CardContent className="p-3 space-y-2.5">
            <div className="h-48 overflow-hidden rounded-lg">
              <img
                src={courseImageMap[course.title] || defaultCoverImage}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="rounded-2xl text-gray-800">
                {
                  !course.category
                    ? 'Document'
                    : course.category}
              </Badge>
            </div>
            <p className="font-medium text-sm text-black">
              {course.title}
            </p>
            <Progress
              value={course.completionStatus}
              className="h-1.5 bg-gray-100"
              indicatorClassName="bg-black"
            />
            {
              isCourseProgressLoading ? (
                <div className="flex justify-between items-center">
                  <div className="w-1/2 h-1.5 bg-gray-100 rounded"></div>
                  <div className="w-1/2 h-1.5 bg-gray-100 rounded"></div>
                </div>
              ) : courseProgressError ? (
                <div>
                  <div className="text-sm text-red-500">
                    Unable to load course progress
                  </div>
                </div>
              ) : (
                <div className="text-sm flex justify-between text-gray-700 tracking-wider font-medium ">
                  <div>
                    Topics Completed <br /> {courseProgress?.completed}
                  </div>
                  <div>Score <br /> {courseProgress?.totalScore}</div>
                </div>
              )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function StudentContent(): JSX.Element {
  const name = useName();
  const userId = getItem('userId') as number;
  const queryClient = useQueryClient();
  const [summaryError, setSummaryError] = useState<string | null>(null)
  // Track if we've attempted to fetch the summary
  const [hasFetchedSummary, setHasFetchedSummary] = useState(false)
  const [showFullSummary, setShowFullSummary] = useState(false)

  // Use useQuery instead of useMutation + useEffect
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['student-summary', userId],
    queryFn: async () => {
      try {
        const response = await postAxios(`/api/v0/gen-ai/${userId}/progress/summary`, {
          traineeName: name,
        })
        setSummaryError(null)
        return response.data
      } catch (error: any) {
        console.error('AI Summary generation error:', error)

        // Handle API errors with improved error detection
        const status = error.response?.status

        if (status === 403) {
          setSummaryError('You do not have permission to access the AI summary feature.')
        } else if (status === 404) {
          setSummaryError('AI summary endpoint not found. This feature may not be available yet.')
        } else {
          setSummaryError('Unable to generate AI summary. Please try again later.')
        }
        throw error // Let React Query handle the error state
      }
    },
    // Only run this query once when the component mounts
    enabled: !hasFetchedSummary,
    // Don't retry failed requests
    retry: false,
    staleTime: Infinity, // Prevent automatic refetching
  })

  // Set hasFetchedSummary to true after the query completes (success or error)
  useEffect(() => {
    // If the query was attempted (enabled) and is no longer loading, mark as fetched
    if (!hasFetchedSummary && !isSummaryLoading) {
      // Set after a short delay to avoid React state update conflicts
      const timeoutId = setTimeout(() => {
        setHasFetchedSummary(true);

        // If we have data, invalidate related queries
        if (summaryData) {
          queryClient.invalidateQueries({ queryKey: ['trainee', userId] })
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [hasFetchedSummary, isSummaryLoading, summaryData, queryClient, userId]);

  const { data: courses = [], isLoading: isCoursesLoading, error: coursesError } = useQuery<Course[]>({
    queryKey: ['all-courses'],
    queryFn: fetchCourses,
  })

  // Helper function to truncate text
  const truncateToWords = (str: string | null | undefined, numWords: number) => {
    if (!str || typeof str !== 'string') return '';
    const words = str.split(' ')
    if (words.length <= numWords) return str
    return words.slice(0, numWords).join(' ') + '...'
  }

  // Extract error details from the courses error object
  const coursesErrorDetails = coursesError ?
    (coursesError as any)?.status ? (coursesError as any) :
      (coursesError as Error)?.message ? { message: (coursesError as Error).message } :
        { message: 'An unknown error occurred' } : null;

  const displaySummary = summaryData ? truncateToWords(summaryData, 100) : ''

  // Function to handle summary generation
  // const handleGenerateSummary = useCallback(() => {
  //   // Reset error and fetch again
  //   setSummaryError(null)
  //   setHasFetchedSummary(false) // Allow the query to run again
  //   refetch() // Force a refetch
  // }, [refetch])

  return (
    <div className="page-container pb-4 pr-3 pl-2">
      <WelcomeBanner 
        name={name} 
        subText="Time to expand your knowledge."
        imageSrc="/training/images/instructor.svg"
      />

      <div>
        <PerformanceInsightsCard
          summaryData={summaryData}
          displaySummary={displaySummary}
          isLoading={isSummaryLoading}
          errorMessage={summaryError ?? undefined}
          subjectName={name ?? undefined}
          onReadMoreClick={() => setShowFullSummary(true)}
        />
      </div>

      {/* Full Summary Dialog */}
      <AIInsightsDialog 
        open={showFullSummary} 
        onOpenChange={setShowFullSummary}
        description={`Comprehensive analysis of ${name}'s performance`}
        content={summaryData}
      />

      {/* Sections */}
      <div className="w-full">
        <div className="bg-white rounded-md pl-6 pr-4 pb-5 h-full overflow-auto">
          <h1 className="text-lg font-semibold py-4">Courses</h1>
          {isCoursesLoading ? (
            <div className="flex justify-center items-center h-[calc(100vh-34rem)]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
            </div>
          ) : coursesError ? (
            <Card className="overflow-hidden border-none drop-shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <BookOpenIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <h2 className="text-lg font-medium text-gray-700 mb-2">Unable to load courses</h2>
                  <div className="text-sm text-gray-500">
                    <p className="mb-2">We encountered an error retrieving your courses:</p>
                    <p className="font-medium">{coursesErrorDetails?.status ? `${coursesErrorDetails.status} - ${coursesErrorDetails.message}` : coursesErrorDetails?.message}</p>
                    {coursesErrorDetails?.path && <p className="text-xs mt-1 text-gray-400">Resource: {coursesErrorDetails.path}</p>}
                    {coursesErrorDetails?.timestamp && <p className="text-xs text-gray-400">Time: {new Date(coursesErrorDetails.timestamp).toLocaleTimeString()}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Course Grid */}
                <div className="grid grid-cols-4 gap-[18px]">
                  {Array.isArray(courses) &&
                    courses.map((course) => {
                      if (!course?.courseId) {
                        console.error('Course ID is missing:', course)
                        return null
                      }

                      return <CourseCard key={course.courseId} course={course} />;
                    })}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export function StudentHomePage(): JSX.Element {
  return (
    <ErrorBoundary fallback={<div>Something went wrong loading the topics</div>}>
      <Suspense fallback={<div>Loading topics...</div>}>
        <StudentContent />
      </Suspense>
    </ErrorBoundary>
  );
}
