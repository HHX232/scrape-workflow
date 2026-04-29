import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { LucideProps, RepeatIcon } from 'lucide-react'

export const ForEachTask = {
  type: TaskType.FOR_EACH,
  label: 'For Each',
  icon: (props: LucideProps) => <RepeatIcon className='stroke-amber-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  dynamicInputs: true,
  dynamicInputPrefix: 'Items',
  dynamicOutputPrefix: 'Current Item',
  inputs: [] as const,
  outputs: [
    { name: 'Index', type: TaskParamType.STRING }
  ] as const
} satisfies WorkflowTask
