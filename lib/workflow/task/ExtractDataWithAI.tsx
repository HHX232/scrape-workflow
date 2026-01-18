import {TaskParamType, TaskType} from '@/types/TaskType'
import {WorkflowTask} from '@/types/workflow'
import {BrainIcon, MousePointerClickIcon} from 'lucide-react'

export const ExtractDataWithAITask = {
  type: TaskType.EXTRACT_DATA_WITH_AI,
  label: 'Extract data with AI',
  icon: (props) => <BrainIcon className='stroke-rose-400' {...props} />,
  isEntryPoint: false,
  credits: 4,
  inputs: [
    {
      name: 'Content',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      variant: 'textarea'
    },
    {
      name: 'Credential',
      type: TaskParamType.CREDENTIAL,
      required: true,
      hideHandle: false
    },
    {
      name: 'Prompt',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      variant: 'textarea'
    }
  ] as const,
  outputs: [{name: 'Extracted data', type: TaskParamType.STRING, variant: 'textarea'}] as const
} satisfies WorkflowTask
