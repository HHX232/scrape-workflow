import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { DatabaseIcon } from 'lucide-react'

export const AddPropertyToJSONTask = {
  type: TaskType.ADD_PROPERTY_TO_JSON,
  label: 'Add property to JSON',
  icon: (props) => <DatabaseIcon className='stroke-orange-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'JSON',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      variant: 'textarea'
    },
    {
      name: 'Property name',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false
    },
    {
      name: 'Property value',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false
    },
  ] as const,
  outputs: [{name: 'Update JSON', type: TaskParamType.STRING}] as const
} satisfies WorkflowTask
