'use client'
import { GetWorkflowExecutionWithPhases } from '@/actions/workflows/GetWorkflowExecutionWithPhases'
import { GetWorkflowPhaseDetails } from '@/actions/workflows/GetWorkflowPhaseDetails'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExecutionLog } from '@/lib/generated/prisma'
import { DatesToDurationString } from '@/lib/helper/date'
import { GetPhasesTotalCost } from '@/lib/helper/GetPhasesTotalCost'
import { cn } from '@/lib/utils'
import { LogLevel } from '@/types/log'
import { ExecutionStatus, WorkflowExecutionStatus } from '@/types/workflow'

import ReactCountUpWrapper from '@/components/ReactCountUpWrapper'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { CalendarIcon, CircleDashedIcon, ClockIcon, CoinsIcon, Loader2Icon, LucideIcon, WorkflowIcon } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { default as PhasesStatusBadge, default as PhaseStatusBadge } from './PhasesStatusBadge'

type ExecutionData = Awaited<ReturnType<typeof GetWorkflowExecutionWithPhases>>

export default function ExecutionViewer({initialData}: {initialData: ExecutionData}) {
  const [selectedPhases, setSelectedPhases] = useState<string | null>(null)
  const query = useQuery({
    queryKey: ['execution', initialData?.id],
    initialData,
    queryFn: () => GetWorkflowExecutionWithPhases(initialData!.id),
    refetchInterval: (q) => (q.state?.data?.status === WorkflowExecutionStatus.RUNNING ? 1000 : false)
  })
  const phaseDetails = useQuery({
    queryKey: ['phase-details', selectedPhases],
    queryFn: () => GetWorkflowPhaseDetails(selectedPhases!),
    enabled: !!selectedPhases
  })
  const isRunning = query.data?.status === WorkflowExecutionStatus.RUNNING
  useEffect(()=>{
const phases = query.data?.phases
if(isRunning && phases){
  const phaseToSelect = phases.toSorted((a, b) => a.startedAt! > b.startedAt! ? 1: -1)[0]
  setSelectedPhases(phaseToSelect.id)
  return
}
if(!isRunning && phases){
  const phaseToSelect = phases.toSorted((a, b) => a.completedAt! > b.completedAt! ? -1: 1)[0]
  setSelectedPhases(phaseToSelect.id)
}
  },[query.data?.phases, isRunning, setSelectedPhases])
  const duration = DatesToDurationString(query.data?.startedAt, query.data?.completedAt)

  const creditsConsumed = GetPhasesTotalCost(query.data?.phases || [])

  return (
    <div className='flex w-full h-full'>
      <aside className='w-[440px] max-w-[440px] min-w-[440px] border-r-2 border-separate flex flex-grow flex-col overflow-hidden'>
        <div className='py-4 px-2'>
          {/* status label */}
          <ExecutionLabel
            icon={CircleDashedIcon}
            label={'status'}
            value={<span className=' uppercase'>{<div className='flex gap-2 items-center'>
              <PhaseStatusBadge status={query.data?.status as ExecutionStatus}/>
              <span className='font-semibold capitalize'>{query.data?.status}</span>
              </div>}</span>}
          />

          {/* stated at label */}
          <ExecutionLabel
            value={query.data?.startedAt ? formatDistanceToNow(new Date(query.data.startedAt), {addSuffix: true}) : '–'}
            icon={CalendarIcon}
            label={'started at'}
          />

          <ExecutionLabel
            value={duration ? duration : <Loader2Icon size={16} className='animate-spin' />}
            icon={ClockIcon}
            label={'Duration'}
          />
          <ExecutionLabel value={<ReactCountUpWrapper value={creditsConsumed}></ReactCountUpWrapper>} icon={CoinsIcon} label={'Credits consumed'} />
        </div>
        <Separator />
        <div className='flex justify-center items-center py-2 px-4'>
          <div className='text-muted-foreground flex items-center gap-2'>
            <WorkflowIcon size={20} className='stroke-muted-foreground/80' />
            <span className='font-se,ibold'>Phases</span>
          </div>
        </div>
        <Separator />
        <div className='overflow-auto h-full px-2 py-4'>
          {query.data?.phases.map((phase, index) => (
            <Button
              variant={selectedPhases === phase.id ? 'secondary' : 'ghost'}
              key={phase.id}
              className='w-full justify-between'
              onClick={() => {
                if (isRunning) return
                setSelectedPhases(phase.id)
              }}
            >
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>{index + 1}</Badge>
                <p className='font-semibold'>{phase.name}</p>
              </div>
              <PhasesStatusBadge status={(phase as any).status} />
            </Button>
          ))}
        </div>
      </aside>
      <div className='flex w-full h-full'>
        {isRunning && (
          <div className='flex flex-col items-center gap-2 justify-center w-full h-full'>
            <p className='font-bold '>Run is in progress, please wait</p>
            <Loader2Icon size={20} className='animate-spin' />
          </div>
        )}
        {!isRunning && !selectedPhases && (
          <div className='flex flex-col items-center gap-2 justify-center w-full h-full'>
            <div className='flex flex-col gap-1 text-center'></div>
            <p className='font-bold '>Select a phase to view details</p>
            <p className='text-muted-foreground'>Click on a phase to view its details</p>
          </div>
        )}
        {!isRunning && selectedPhases && phaseDetails.data && (
          <div className='flex flex-col py-4 container gap-4 overflow-auto'>
            <div className='flex gap-2 items-center'>
              <Badge variant={'outline'} className='space-x-4'>
                <div className='flex gap-1 items-center'>
                  <CoinsIcon size={18} className='stroke-muted-foreground' />
                  <span>Credits</span>
                </div>
                <span>{phaseDetails.data.creditsConsumed || 0}</span>
              </Badge>
              <Badge variant={'outline'} className='space-x-4'>
                <div className='flex gap-1 items-center'>
                  <ClockIcon size={18} className='stroke-muted-foreground' />
                  <span>Duration</span>
                </div>
                <span>{DatesToDurationString(phaseDetails.data.startedAt, phaseDetails.data.completedAt) || '-'}</span>
              </Badge>
            </div>
            <ParamaterViewer
              title={'Inputs'}
              subtitle={'Inputs used for this phase'}
              paramsJson={phaseDetails.data.inputs || ''}
            />
            <ParamaterViewer
              title={'Outputs'}
              subtitle={'Outputs  generated bu this phase'}
              paramsJson={phaseDetails.data.outputs || ''}
            />

            <LogViewer logs={phaseDetails.data.logs || []} />
          </div>
        )}
      </div>
    </div>
  )
}

function ExecutionLabel({icon, label, value}: {icon: LucideIcon; label: ReactNode; value: ReactNode}) {
  const Icon = icon
  return (
    <div className='flex justify-between items-center py-2 px-4 text-sm'>
      <div className='text-muted-foreground flex items-center gap-2'>
        <Icon size={20} className='stroke-muted-foreground/80' />
        <span>{label}</span>
      </div>
      <div className='font-semibold lowercase flex gap-2 items-center'>{value}</div>
    </div>
  )
}

function ParamaterViewer({title, subtitle, paramsJson}: {title: string; subtitle: string; paramsJson: string | null}) {
  const params = JSON.parse(paramsJson || '{}')
  return (
    <Card>
      <CardHeader className='rounded-lg rounded-b-none border-b py-4 bg-gray-50'>
        <CardTitle className='text-base font-semibold'>{title}</CardTitle>
        <CardDescription className='text-sm text-muted-foreground'>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-2 mt-4'>
          {!params ||
            (Object.keys(params).length === 0 && <p className='mt-4 text-sm text-muted-foreground'>No parameters</p>)}
          {params &&
            Object.entries(params).map(([key, value]) => {
              return (
                <div className='flex justify-between items-center' key={key}>
                  <p className='text-sm text-muted-foreground flex-1 basis-1/3'>{key}</p>
                  <Input readOnly className='flex-1 basis-2/3' value={value as string} />
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}

function LogViewer({logs}: {logs: ExecutionLog[]}) {
  if (!logs || logs.length === 0) return <></>
  return (
    <Card className='w-full'>
      <CardHeader className='rounded-lg rounded-b-none border-b py-4 bg-gray-50'>
        <CardTitle className='text-base font-semibold'>Logs</CardTitle>
        <CardDescription className='text-sm text-muted-foreground'>Logs generated by this phase</CardDescription>
      </CardHeader>
      <CardContent className='p-0'>
        <Table>
          <TableHeader className='text-muted-foreground text-sm'>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className='text-muted-foreground'>
                <TableCell width={190} className='text-xs text-muted-foreground p-[2px] pl-4'>
                  {log.timestamp.toDateString()}
                </TableCell>
                <TableCell
                  width={80}
                  className={cn(
                    'uppercase text-xs font-bold p-[3px] pl-4',
                    (log.logLevel as LogLevel) == 'error' && 'text-destructive',
                    (log.logLevel as LogLevel) == 'info' && 'text-primary'
                  )}
                >
                  {log.logLevel}
                </TableCell>

                <TableCell className='text-sm flex-1 p-[3px] pl-4'>{log.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
