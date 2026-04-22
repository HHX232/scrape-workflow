'use client'

import { GetCreditsUsageInPeriod } from '@/actions/analytics/GetCreditsUsageInPeriod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartColumnStackedIcon } from 'lucide-react'
import { Awaitable } from 'puppeteer'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

type ChartData = Awaitable<ReturnType<typeof GetCreditsUsageInPeriod>>

const chartConfig = {
  success: {
    label: 'Successfull Phases credits',
    color: 'hsl(var(--chart-2))'
  },
  failed: {
    label: 'Failed Phases credits',
    color: 'hsl(var(--chart-1))'
  }
}

export default function CreditUsageChart({data, title, description}: {data: ChartData; title: string; description: string}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl font-bold flex items-center gap-2'>
          <ChartColumnStackedIcon className='w-6 h-6 text-primary' />
         {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='max-h-[200px] w-full'>
          <BarChart accessibilityLayer margin={{top: 20}} height={200} data={data as any}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={'date'}
              tickLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <ChartTooltip content={<ChartTooltipContent className='w-[250px]' />} />
            <Bar
              min={0}
              type={'bump'}
              radius={[0,0,4,4]}
              fillOpacity={0.8}
              fill='var(--color-success)'
              stroke='var(--color-success)'
              dataKey={'success'}
              stackId={'a'}
            />
            <Bar
              min={0}
              type={'bump'}
              radius={[4,4,0,4]}
              fillOpacity={0.8}
              fill='#ef4444'
              stroke='#ef4444'
              dataKey={'failed'}
              stackId={'a'}
            />
            
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
