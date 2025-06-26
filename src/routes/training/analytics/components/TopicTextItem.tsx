import { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'

type TopicTextItemProps = {
  topic: string
  value: string | number
  icon?: ReactNode
}

export const TopicTextItem = ({ topic, value, icon }: TopicTextItemProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{topic}</p>
        {icon ? (
          <div className="flex items-center">
            {icon}
            <p className="text-sm font-medium text-gray-800">{value}</p>
          </div>
        ) : (
          <p className="text-sm font-medium text-gray-800">{value}</p>
        )}
      </div>
    </>
  )
}

// For TanStack Router - empty route component to prevent errors
export const Route = createFileRoute('/training/analytics/components/TopicTextItem')({});
