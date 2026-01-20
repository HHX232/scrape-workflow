import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { DownloadIcon, LucideProps } from 'lucide-react'
import React from 'react'

export const DownloadImages = {
  type: TaskType.DOWNLOAD_IMAGES,
  label: 'Download images to disk',
  icon: (props: LucideProps) =>
    React.createElement(DownloadIcon, {
      className: 'stroke-green-400',
      ...props
    }),

  isEntryPoint: false,
  credits: 3,
  inputs: [
    {
      name: 'Images',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      variant: 'textarea',
      helpText: 'JSON array of image metadata from ExtractImages'
    },
    {
      name: 'Download path',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helpText: 'Folder path to save images (e.g., ./downloads/images)'
    },
    {
      name: 'Base URL',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'Base URL for relative image paths (optional)'
    }
  ] as const,
  outputs: [
    {
      name: 'Downloaded files',
      type: TaskParamType.STRING,
      helpText: 'JSON array of downloaded file paths'
    }
  ] as const
} satisfies WorkflowTask
