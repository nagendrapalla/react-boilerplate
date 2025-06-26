import { createFileRoute } from '@tanstack/react-router'

type TopicProgressItemProps = {
  topic: string
  progressValue: number
}

// Custom progress component with black indicator
const BlackProgress = ({ value }: { value: number }) => {
  return (
    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gray-900 transition-all duration-300 ease-in-out" 
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export const TopicProgressItem = ({ topic, progressValue }: TopicProgressItemProps) => {
  return (
    <div className="flex items-center gap-4 mb-3">
      <p className="text-sm text-gray-600 flex-1">{topic}</p>
      <div className="w-[40%]">
        <BlackProgress value={progressValue} />
      </div>
    </div>
  )
}

// For TanStack Router - empty route component to prevent errors
export const Route = createFileRoute('/training/analytics/components/TopicProgressItem')({});
