import {TaskParamType, TaskType} from '@/types/TaskType'
import {WorkflowTask} from '@/types/workflow'
import {Edit3Icon} from 'lucide-react'

export const FillInputTask = {
  type: TaskType.FILL_INPUT,
  label: 'Fill input',
  icon: (props) => <Edit3Icon className='stroke-orange-400' {...props} />,
  isEntryPoint: false,
  inputs: [
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
      hideHandle: false
    },
    {
      name: 'Selector',
      type: TaskParamType.STRING,
      required: true
    },
    {
      name: 'Value',
      type: TaskParamType.STRING,
      required: true
    }
  ] as const,
  credits: 1,
  outputs: [{name: 'Web page', type: TaskParamType.BROWSER_INSTANCE}] as const
} satisfies WorkflowTask
