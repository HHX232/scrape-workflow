import {TaskParamType, TaskType} from '@/types/TaskType'
import {LucideProps, TextIcon} from 'lucide-react'

export const ExtractTextFromElement = {
  type: TaskType.EXTRACT_TEXT_FROM_ELEMENT,
  label: 'Extract text from element',
  icon: (props: LucideProps) => <TextIcon className='stroke-rose-400' {...props} />,
  isEntryPoint: false,
  inputs: [
    {
      name: 'Html',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false
    },
    {
      name: 'Selector',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false
    }
  ],
  outputs: [
    {name: 'Extracted text', type: TaskParamType.STRING, helpText: 'The extracted text from the selected element'}
  ]
}
