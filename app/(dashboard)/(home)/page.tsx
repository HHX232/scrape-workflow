import { GetCreditsUsageInPeriod } from '@/actions/analytics/GetCreditsUsageInPeriod'
import { GetPeriods } from '@/actions/analytics/getPeriods'
import { GetStatsCardsValues } from '@/actions/analytics/GetStatsCardsValues'
import { GetWorkflowExecutionStats } from '@/actions/analytics/GetWorkflowExecutionStats'
import { Skeleton } from '@/components/ui/skeleton'
import { Period } from '@/types/analitycs'
import { CirclePlayIcon, CoinsIcon, WaypointsIcon } from 'lucide-react'
import { Suspense } from 'react'
import ExecutionStatusChart from './_components/ExecutionStatusChart'
import PeriodSelector from './_components/PeriodSelector'
import StatsCard from './_components/StatsCard'
import CreditUsageChart from './billing/_components/CreditUsageChart'

function HomePage({searchParams}: {searchParams: {month?: string; year?: string}}) {
  const currentDate = new Date()
  const period: Period = {
    month: Number(searchParams.month) || currentDate.getMonth(),
    year: Number(searchParams.year) || currentDate.getFullYear()
  }
  return (
    <div className='flex flex-1 flex-col h-full'>
      <div className='flex justify-between'>
        <h1 className='text-3xl font-bold'>Home</h1>
        <Suspense fallback={<Skeleton className='w-[180px] h-[40px]' />}>
          <PeriodSelectorWrapper selectedPeriod={period} />
        </Suspense>
      </div>
      <div className='h-full py-6 flex flex-col gap-4'>
        {' '}
        <Suspense fallback={<Skeleton className='h-[120px]' />}>
        <StatsCards selectedPeriod={period} />
        </Suspense>
        <Suspense fallback={<Skeleton className='h-[120px]' />}>
        <StatsExecutionStatus selectedPeriod={period} />
        </Suspense>
        <Suspense fallback={<Skeleton className='h-[120px]' />}>
        <CreditsUsageInPeriod selectedPeriod={period} />
        </Suspense>
      </div>
    </div>
  )
}
async function PeriodSelectorWrapper({selectedPeriod}: {selectedPeriod: Period}) {
  const periods = await GetPeriods()
  return <PeriodSelector selectedPeriod={selectedPeriod} periods={periods} />
}

async function StatsCards({selectedPeriod}: {selectedPeriod: Period}) {
  const data = await GetStatsCardsValues(selectedPeriod)
  return (
    <div
      className='
   h-full grid gap-3 lg:pag-8 lg:grid-cols-3 min-h-[120px]'
    >
      <StatsCard title='Workflow Executions' value={data.workflowExecutions} Icon={CirclePlayIcon} />
      <StatsCard title='Phase Executions' value={data.phaseExecutions} Icon={WaypointsIcon} />
      <StatsCard title='Credits consumed' value={data.creditsConsumed} Icon={CoinsIcon} />
    </div>
  )
}


async function StatsExecutionStatus({
  selectedPeriod,
}: {
  selectedPeriod: Period;
}) {
  const data = await GetWorkflowExecutionStats(selectedPeriod);
  return <ExecutionStatusChart data={data as any}/>;
}
async function CreditsUsageInPeriod({
  selectedPeriod,
}: {
  selectedPeriod: Period;
}) {
  const data = await GetCreditsUsageInPeriod(selectedPeriod);
  return <CreditUsageChart
    data={data as any}
    title="Daily credits spent"
    description="Daily credit consumed in selected period"
  />;
}

export default HomePage
