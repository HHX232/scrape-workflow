import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { DownloadIcon, LucideProps } from 'lucide-react'

export const DownloadPdf = {
  type: TaskType.DOWNLOAD_PDF,
  label: 'Download PDF',
  icon: (props: LucideProps) => <DownloadIcon className='stroke-blue-400' {...props} />,
  isEntryPoint: true,
  credits: 1,
  inputs: [
    {
      name: 'URL',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helperText: 'URL to download the PDF file'
    }
  ] as const,
  outputs: [
    {
      name: 'PDF file',
      type: TaskParamType.FILE,
      helpText: 'The downloaded PDF file'
    }
  ] as const
} satisfies WorkflowTask