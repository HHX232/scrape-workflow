import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { LucideProps, PackageIcon } from 'lucide-react'

export const MergeTextsToJsonTask = {
  type: TaskType.MERGE_TEXTS_TO_JSON,
  label: 'Merge Texts to JSON',
  icon: (props: LucideProps) => <PackageIcon className='stroke-sky-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Schema',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: true, 
      helpText: 'JSON map: { "outputKey": "inputName", ... }  e.g. {"title":"Title Text","url":"Current Item"}',
      variant: 'textarea'
    },
    {
      name: 'Field 1',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'First text field'
    },
    {
      name: 'Field 2',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'Second text field'
    },
    {
      name: 'Field 3',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'Third text field'
    },
    {
      name: 'Field 4',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'Fourth text field'
    },
    {
      name: 'Field 5',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'Fifth text field'
    },
    {
      name: 'Field 6',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'Sixth text field'
    }
  ] as const,
  outputs: [
    {
      name: 'JSON Object',
      type: TaskParamType.STRING,
      helpText: 'Resulting JSON object as a string'
    }
  ] as const
} satisfies WorkflowTask