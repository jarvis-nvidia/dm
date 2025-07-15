'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card } from '@/components/shared/Card'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface DataPoint {
  date: string
  commits: number
  reviews: number
  debugSessions: number
}

const generateMockData = (): DataPoint[] => {
  const data: DataPoint[] = []
  const currentDate = new Date('2025-07-15T08:24:32Z')

  for (let i = 30; i >= 0; i--) {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      commits: Math.floor(Math.random() * 15) + 5,
      reviews: Math.floor(Math.random() * 10) + 3,
      debugSessions: Math.floor(Math.random() * 5) + 1
    })
  }

  return data
}

export const AnalyticsChart = () => {
  const [data, setData] = useState<DataPoint[]>(generateMockData())
  const chartRef = useRef<ChartJS>(null)

  const chartData: ChartData<'line'> = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Commits',
        data: data.map(d => d.commits),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      },
      {
        label: 'Reviews',
        data: data.map(d => d.reviews),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        tension: 0.4
      },
      {
        label: 'Debug Sessions',
        data: data.map(d => d.debugSessions),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.4
      }
    ]
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 7
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Activity Overview</h3>
        <select
          className="rounded-md border border-gray-300 py-1 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          defaultValue="30"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
      <div className="h-[400px]">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </Card>
  )
}
