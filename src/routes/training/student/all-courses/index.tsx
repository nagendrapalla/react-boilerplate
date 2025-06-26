import { getAxios } from '@/shared/api/apiClient'
import { getItem } from '@/shared/utlis/localStorage'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpenCheckIcon } from 'lucide-react'
import {
  Badge,
  Card,
  CardContent,
  // Progress,
} from 'ti-react-template/components'
import { useCourseId } from '@/domains/course/store/courseAtom'

interface Course {
  courseId: number
  title: string
  description: string
  courseUrl: string
  coverImage: string
  category: string
  hashValue: string|null
  createdBy: number
  completionStatus: number
  createdDate: string
  updatedBy: number|null
  updatedDate: string|null
}

const defaultCoverImage = "https://img.freepik.com/free-vector/online-tutorials-concept_23-2148529256.jpg";

// Map of course titles to specific cover images
const courseImageMap: Record<string, string> = {
  "Image Review Specialist Manual": "/training/images/Image-Review-Specialist-Manual.jpg",
}

const fetchCourses = async () => {
  const userId = getItem('userId')
  console.log('UserId from localStorage:', userId)
  const res = await getAxios(`/api/v0/courses/user/${userId}`)
  console.log('API Response:', res.data)
  return res.data
}

export const Route = createFileRoute('/training/student/all-courses/')({
  component: RouteComponent,
  loader: () => ({
    queryKey: ['all-courses'] as const,
  }),
})

function CourseCard({ course }: { course: Course }) {
  const { updateCourseId } = useCourseId();

  const handleCourseClick = () => {
    console.log('All-courses: Course clicked:', course.courseId);
    
    updateCourseId(course.courseId);
  };

  return (
    <Link
      key={course.courseId}
      to={"/training/student/all-courses/$courseId/topics"}
      params={{ courseId: course.courseId.toString() }}
      onClick={handleCourseClick}
    >
      <Card
        key={course.courseId}
        className="bg-white shadow-cards-long-default"
      >
        <CardContent className="p-3 space-y-2.5">
          <img
            src={courseImageMap[course.title] || defaultCoverImage}
            alt={course.title}
            className="w-full object-fill rounded-lg"
          />
          <Badge variant="secondary" className="rounded-2xl text-gray-800">
            {course.category === undefined ||
            course.category === ''
              ? 'Document'
              : course.category}
          </Badge>
          <p className="font-medium text-sm text-black">
            {course.title}
          </p>
          {/* <Progress
            value={course.completionStatus}
            className="h-1.5 bg-gray-100"
            indicatorClassName="bg-black"
          /> */}
        </CardContent>
      </Card>
    </Link>
  );
}

function RouteComponent() {
  const { queryKey } = Route.useLoaderData()
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey,
    queryFn: fetchCourses,
  })

  if (isLoading) {
    return <>Loading...</>
  }

  return (
    <div className="bg-[#f1f1f1] min-h-screen">
      <div className="mx-auto p-7">
        {/* Main Content */}
        <div>
          {/* Page Title */}
          <div className="flex items-center gap-2.5 mb-6">
            <BookOpenCheckIcon className="w-6 h-6" />
            <h1 className="text-2xl font-medium">Courses</h1>
          </div>

          {/* Course Grid */}
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Course Grid */}
              <div className="grid grid-cols-3 gap-[18px]">
                {Array.isArray(courses) &&
                  courses.map((course) => {
                    console.log('Course data:', course)
                    if (!course?.courseId) {
                      console.error('Course ID is missing:', course)
                      return null
                    }
                    return (
                      <CourseCard key={course.courseId} course={course} />
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
