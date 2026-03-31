'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface WeeklyDataPoint {
  week: string
  revenue: number
  orders: number
}

interface Props {
  data: WeeklyDataPoint[]
}

export function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <YAxis
          tickFormatter={(v) => `$${v}`}
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        <Tooltip
          formatter={(value, name) =>
            name === 'revenue' ? formatCurrency(Number(value)) : value
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          name="Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
