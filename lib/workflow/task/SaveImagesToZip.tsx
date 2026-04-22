import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { LucideProps, FileArchiveIcon } from 'lucide-react'

export const SaveImagesToZip = {
  type: TaskType.SAVE_IMAGES_TO_ZIP,
  label: 'Save images to ZIP',
  icon: (props: LucideProps) => <FileArchiveIcon className='stroke-green-400' {...props} />,
  isEntryPoint: false,
  credits: 2,
  inputs: [
    {
      name: 'Images JSON',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helperText: 'JSON with extracted images from PDF (output from Extract Images from PDF)'
    }
  ] as const,
  outputs: [] as const
} satisfies WorkflowTask