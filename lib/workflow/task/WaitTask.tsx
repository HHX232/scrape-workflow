import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { ClockIcon } from 'lucide-react'

export const WaitTask = {
  type: TaskType.WAIT,
  label: 'Wait',
  icon: (props) => <ClockIcon className='stroke-orange-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
    },
    {
      name: 'Duration (ms)',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: true,
      placeholder: 'число милисекунд - 1000',
    },
  ] as const,
  outputs: [{ name: 'Web page', type: TaskParamType.BROWSER_INSTANCE }] as const,
} satisfies WorkflowTask
