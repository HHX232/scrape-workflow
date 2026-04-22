import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { ImageIcon, LucideProps } from 'lucide-react'

export const ExtractImagesFromPdf = {
  type: TaskType.EXTRACT_IMAGES_FROM_PDF,
  label: 'Extract images from PDF',
  icon: (props: LucideProps) => <ImageIcon className='stroke-blue-400' {...props} />,
  isEntryPoint: false,
  credits: 4,
  inputs: [
    {
      name: 'PDF file',
      type: TaskParamType.FILE,
      required: true,
      hideHandle: false,
      helperText: 'PDF file to extract images from'
    }
  ] as const,
  outputs: [
    {
      name: 'Images JSON',
      type: TaskParamType.STRING,
      helpText: 'Extracted images in JSON format with base64 data'
    },
    {
      name: 'Image count',
      type: TaskParamType.STRING,
      helpText: 'Number of images found'
    },
    {
      name: 'Total size',
      type: TaskParamType.STRING,
      helpText: 'Total size of all images in bytes'
    }
  ] as const
} satisfies WorkflowTask