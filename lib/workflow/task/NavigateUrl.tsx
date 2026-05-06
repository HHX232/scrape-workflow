import {TaskParamType, TaskType} from '@/types/TaskType'
import {WorkflowTask} from '@/types/workflow'
import {Link2Icon} from 'lucide-react'

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
    },
    {
      name: 'URL',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false
    },
    {
      name: 'Soft fail',
      type: TaskParamType.BOOLEAN,
      required: false,
      hideHandle: true,
      helpText: 'Не останавливать ран при ошибке навигации'
    }
  ] as const,
  outputs: [
    {name: 'Web page', type: TaskParamType.BROWSER_INSTANCE},
    {name: 'Success', type: TaskParamType.STRING}
  ] as const
} satisfies WorkflowTask
