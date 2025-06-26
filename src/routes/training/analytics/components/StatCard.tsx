import { Card, CardContent } from 'ti-react-template/components'
import { LucideIcon } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'

type StatCardProps = {
  title: string
  value: string | number
  icon: LucideIcon
}

export const StatCard = ({ title, value, icon: Icon }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-500 text-sm">{title}</span>
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </CardContent>
    </Card>
  )
}

// For TanStack Router - empty route component to prevent errors
export const Route = createFileRoute('/training/analytics/components/StatCard')({});
