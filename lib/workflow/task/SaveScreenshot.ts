import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { LucideProps, SaveIcon } from 'lucide-react'
import React from 'react'

export const SaveScreenshot = {
  type: TaskType.SAVE_SCREENSHOT,
  label: 'Save screenshot to disk',
icon: (props: LucideProps) => React.createElement(SaveIcon, { 
  className: 'stroke-blue-400', 
  ...props 
}),
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Screenshot',
      type: TaskParamType.IMAGE_FILE,
      required: true,
      hideHandle: false
    },
    {
      name: 'File path',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helpText: 'Full path with filename (e.g., ./screenshots/page.png)'
    }
  ] as const,
  outputs: [
    {
      name: 'Saved path',
      type: TaskParamType.STRING,
      helpText: 'Path where screenshot was saved'
    }
  ] as const
} satisfies WorkflowTask