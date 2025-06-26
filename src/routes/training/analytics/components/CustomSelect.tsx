import { createFileRoute } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'ti-react-template/components'

type Option = {
  label: string
  value: string
}

type CustomSelectProps = {
  options: Option[]
  defaultValue?: string
  placeholder?: string
  width?: string
}

export const CustomSelect = ({
  options,
  defaultValue,
  placeholder = 'Select option',
  width = 'w-[180px]'
}: CustomSelectProps) => {
  return (
    <Select defaultValue={defaultValue}>
      <SelectTrigger 
        className={`${width} border border-gray-200 shadow-sm focus:ring-0 focus:outline-none focus:border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// For TanStack Router - empty route component to prevent errors
export const Route = createFileRoute('/training/analytics/components/CustomSelect')({});
