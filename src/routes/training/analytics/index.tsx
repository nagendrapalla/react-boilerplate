import { createFileRoute } from '@tanstack/react-router'
import {
  Users,
  BookOpen,
  BarChart3,
  CheckCircle,
  Bell,
  ArrowUpRight,
  CircleDashed
} from 'lucide-react'
import { authGuardCheck } from '@/utils/authGuard'
import { useStorePath } from '@/hooks/useStorePath'

// Import reusable components
import {
  StatCard,
  SectionCard,
  TopicProgressItem,
  TopicTextItem,
  CustomSelect
} from './components'

export const Route = createFileRoute('/training/analytics/')({
  beforeLoad: (args) => {
    // Use the reusable auth guard - restrict to ROLE_Instructor only
    // authGuardCheck(args, 'ROLE_Instructor')
    authGuardCheck(args, 'ROLE_Instructor')
  },
  component: AnalyticsRoute,
})

// Define topic data for reuse
const topicData = [
  { name: 'Algebra Basics', progress: 80, score: '85%', attempts: 245, usage: 'High' },
  { name: 'Linear Equations', progress: 60, score: '72%', attempts: 189, usage: 'Medium' },
  { name: 'Quadratic Equations', progress: 45, score: '68%', attempts: 156, usage: 'High' }
]

// Available courses
const courses = [
  { label: 'Mathematics 101', value: 'math-101' },
  { label: 'Physics 101', value: 'physics-101' },
  { label: 'Chemistry 101', value: 'chem-101' },
]

// Available classrooms
const classrooms = [
  { label: 'Class A', value: 'class-a' },
  { label: 'Class B', value: 'class-b' },
  { label: 'Class C', value: 'class-c' },
]

function AnalyticsRoute() {
  // Store this path so we can redirect back to it if needed
  useStorePath()

  // Helper function to get appropriate icon for usage
  const getUsageIcon = (usage: string) => {
    return usage === 'High' ?
      <ArrowUpRight className="h-4 w-4 text-gray-400 mr-1" /> :
      <CircleDashed className="h-4 w-4 text-gray-400 mr-1" />
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-3 rounded-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-gray-700" />
          </div>

          {/* Classroom Select */}
          <CustomSelect
            options={classrooms}
            defaultValue="class-a"
            placeholder="Select classroom"
            width="w-[150px]"
          />

          {/* Course Select */}
          <CustomSelect
            options={courses}
            defaultValue="math-101"
            placeholder="Select course"
            width="w-[180px]"
          />
        </div>
        <div className="flex items-center">
          <button className="p-2 mr-2">
            <Bell className="h-6 w-6 text-gray-600" />
          </button>
          <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-gray-700 border border-gray-200">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Students" value={156} icon={Users} />
        <StatCard title="Topics" value={24} icon={BookOpen} />
        <StatCard title="Average Score" value="78%" icon={BarChart3} />
        <StatCard title="Completion" value="65%" icon={CheckCircle} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Time Spent by Topic */}
        <SectionCard title="Time Spent by Topic">
          <div className="mt-1">
            {topicData.map((topic, index) => (
              <TopicProgressItem
                key={index}
                topic={topic.name}
                progressValue={topic.progress}
              />
            ))}
          </div>
        </SectionCard>

        {/* Score by Topic */}
        <SectionCard title="Score by Topics">
          <div className="space-y-4">
            {topicData.map((topic, index) => (
              <TopicTextItem
                key={index}
                topic={topic.name}
                value={topic.score}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Attempts by Topic */}
        <SectionCard title="Attempts by Topic">
          <div className="space-y-4">
            {topicData.map((topic, index) => (
              <TopicTextItem
                key={index}
                topic={topic.name}
                value={`${topic.attempts} attempts`}
              />
            ))}
          </div>
        </SectionCard>

        {/* AI Tutor Usage */}
        <SectionCard title="AI Tutor Usage">
          <div className="space-y-4">
            {topicData.map((topic, index) => (
              <TopicTextItem
                key={index}
                topic={topic.name}
                value={topic.usage}
                icon={getUsageIcon(topic.usage)}
              />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
