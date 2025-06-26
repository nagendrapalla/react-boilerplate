import { ReactNode } from 'react'
import { Card, CardContent } from 'ti-react-template/components'
import { createFileRoute } from '@tanstack/react-router'

type SectionCardProps = {
  title: string
  children: ReactNode
}

export const SectionCard = ({ title, children }: SectionCardProps) => {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
        {children}
      </CardContent>
    </Card>
  )
}

// For TanStack Router - empty route component to prevent errors
export const Route = createFileRoute('/training/analytics/components/SectionCard')({});
