import {TaskParamType, TaskType} from '@/types/TaskType'
import {WorkflowTask} from '@/types/workflow'
import {MousePointerClickIcon} from 'lucide-react'

export const ClickElementTask = {
  type: TaskType.CLICK_ELEMENT,
  label: 'Click element',
  icon: (props) => <MousePointerClickIcon className='stroke-orange-400' {...props} />,
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
    }
  ] as const,
  outputs: [{name: 'Web page', type: TaskParamType.BROWSER_INSTANCE}] as const
} satisfies WorkflowTask
