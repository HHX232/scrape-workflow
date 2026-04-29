import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { Combine } from 'lucide-react'

export const MergeArraysTask = {
  type: TaskType.MERGE_ARRAYS,
  label: 'Merge Arrays',
  icon: (props) => <Combine className='stroke-violet-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  dynamicInputs: true,
  inputs: [] as const,
  outputs: [
    {
      name: 'Merged Array',
      type: TaskParamType.STRING,
      helpText: 'JSON-массив объединённых элементов'
    }
  ] as const
} satisfies WorkflowTask
