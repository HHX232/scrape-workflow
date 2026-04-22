import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { LucideProps, RepeatIcon } from 'lucide-react'

export const ForEachTask = {
  type: TaskType.FOR_EACH,
  label: 'For Each',
  icon: (props: LucideProps) => <RepeatIcon className='stroke-amber-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Items',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helpText: 'JSON array of items to iterate over (e.g. ["url1","url2"])'
    }
  ] as const,
  outputs: [
    {
      name: 'Current Item',
      type: TaskParamType.STRING,
      helpText: 'The current item in the iteration'
    },
    {
      name: 'Index',
      type: TaskParamType.STRING,
      helpText: 'Current iteration index (0-based)'
    }
  ] as const
} satisfies WorkflowTask