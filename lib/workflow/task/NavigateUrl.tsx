import {TaskParamType, TaskType} from '@/types/TaskType'
import {WorkflowTask} from '@/types/workflow'
import {Link2Icon, MousePointerClickIcon} from 'lucide-react'

export const NavigateUrlTask = {
  type: TaskType.NAVIGATE_URL,
  label: 'Navigate URL',
  icon: (props) => <Link2Icon className='stroke-orange-400' {...props} />,
  isEntryPoint: false,
  credits: 2,
  inputs: [
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
      hideHandle: false,
      variant: 'textarea'
    },
    {
      name: 'URL',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false
    }
  ] as const,
  outputs: [{name: 'Web page', type: TaskParamType.BROWSER_INSTANCE}] as const
} satisfies WorkflowTask
