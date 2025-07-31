// Copied and adapted from https://github.com/shadcn/ui/blob/main/apps/www/components/ui/chart.tsx

import * as React from "react"
import {
  BarChart as ReBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend as ReLegend,
  LineChart as ReLineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts"

export type ChartConfig = Record<
  string,
  {
    label: string
    color?: string
    icon?: React.ComponentType<{ className?: string }>
    theme?: {
      light: string
      dark: string
    }
  }
>

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function ChartContainer({ children, className, ...props }: ChartContainerProps) {
  return (
    <div className={"bg-white rounded-lg border p-4 " + (className || "")}
         {...props}>
      {children}
    </div>
  )
}

export { ReBarChart as BarChart, Bar, CartesianGrid, XAxis, YAxis, ReTooltip as Tooltip, ResponsiveContainer, ReLegend as Legend, ReLineChart as LineChart, Line, RePieChart as PieChart, Pie, Cell }

// Optionally, you can add ChartTooltip, ChartLegend, etc. wrappers here as needed.