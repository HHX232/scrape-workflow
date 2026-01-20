import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { LucideProps, ListIcon } from 'lucide-react'

export const ExtractTextFromElements = {
  type: TaskType.EXTRACT_TEXT_FROM_ELEMENTS,
  label: 'Text from many elements',
  icon: (props: LucideProps) => <ListIcon className='stroke-rose-400' {...props} />,
  isEntryPoint: false,
  credits: 2,
  inputs: [
    {
      name: 'Html',
      type: TaskParamType.STRING,
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
  outputs: [
    {
      name: 'Extracted texts',
      type: TaskParamType.STRING,
      helpText: 'JSON array of extracted texts from all matching elements'
    }
  ] as const
} satisfies WorkflowTask