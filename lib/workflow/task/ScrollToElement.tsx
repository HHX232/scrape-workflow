import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { ArrowUpIcon } from 'lucide-react'

export const ScrollToElementTask = {
  type: TaskType.SCROLL_TO_ELEMENT,
  label: 'Scroll to element',
  icon: (props) => <ArrowUpIcon className='stroke-orange-400' {...props} />,
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
      required: false,
      hideHandle: false
    },
    {
      name: 'Button Text',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'Поиск элемента по тексту (если Selector не задан или не найден)'
    }
  ] as const,
  outputs: [
    { name: 'Web page', type: TaskParamType.BROWSER_INSTANCE },
    { name: 'Found Selector', type: TaskParamType.STRING }
  ] as const
} satisfies WorkflowTask
