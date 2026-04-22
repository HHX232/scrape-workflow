import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { FileTextIcon, LucideProps } from 'lucide-react'

export const ExtractTextFromPdf = {
  type: TaskType.EXTRACT_TEXT_FROM_PDF,
  label: 'Extract text from PDF',
  icon: (props: LucideProps) => <FileTextIcon className='stroke-orange-400' {...props} />,
  isEntryPoint: false,
  credits: 2,
  inputs: [
    {
      name: 'PDF file',
      type: TaskParamType.FILE,
      required: true,
      hideHandle: false,
      helperText: 'PDF file to extract text from'
    }
  ] as const,
  outputs: [
    {
      name: 'Extracted text',
      type: TaskParamType.STRING,
      helpText: 'The complete text content extracted from the PDF'
    }
  ] as const
} satisfies WorkflowTask