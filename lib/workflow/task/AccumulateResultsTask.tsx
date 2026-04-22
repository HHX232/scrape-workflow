import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { DatabaseIcon, LucideProps } from 'lucide-react'

export const AccumulateResultsTask = {
  type: TaskType.ACCUMULATE_RESULTS,
  label: 'Accumulate Results',
  icon: (props: LucideProps) => <DatabaseIcon className='stroke-green-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Item',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helpText: 'A single item (JSON object or string) to add to the results array'
    },
    {
      name: 'Accumulator Key',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: true,
      helpText: 'Unique key to identify the accumulator (use the same key across loop iterations)',
      value: 'default'
    }
  ] as const,
  outputs: [
    {
      name: 'Results',
      type: TaskParamType.STRING,
      helpText: 'JSON array of all accumulated results so far'
    }
  ] as const
} satisfies WorkflowTask