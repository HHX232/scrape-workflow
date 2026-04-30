import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { GitMergeIcon } from 'lucide-react'

export const CoalesceTask = {
  type: TaskType.COALESCE,
  label: 'OR (Coalesce)',
  icon: (props) => <GitMergeIcon className='stroke-violet-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Value A',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      variant: 'textarea'
    },
    {
      name: 'Value B',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      variant: 'textarea'
    }
  ] as const,
  outputs: [{ name: 'Result', type: TaskParamType.STRING }] as const
} satisfies WorkflowTask
