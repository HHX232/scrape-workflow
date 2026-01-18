import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { EyeIcon } from 'lucide-react'

export const WaitForElementTask = {
  type: TaskType.WAIT_FOR_ELEMENT,
  label: 'Wait for element',
  icon: (props) => <EyeIcon className='stroke-amber-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
      hideHandle: false,
      variant: 'textarea'
    },
    {
      name: 'Selector',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false
    },
    {
      name: 'Visibility',
      type: TaskParamType.SELECT,
      hideHandle: true,
      options: [
        {label: 'Visible', value: 'visible'},
        {label: 'Hidden', value: 'hidden'}
      ]
    },
  ] as const,
  outputs: [{name: 'Web page', type: TaskParamType.BROWSER_INSTANCE}] as const
} satisfies WorkflowTask
