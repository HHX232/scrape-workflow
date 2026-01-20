import { TaskParamType, TaskType } from '@/types/TaskType';
import { WorkflowTask } from '@/types/workflow';
import { Camera, LucideProps } from 'lucide-react';
import React from 'react';

export const TakeScreenshot = {
  type: TaskType.TAKE_SCREENSHOT,
  label: 'Take screenshot',
  icon: (props: LucideProps) => React.createElement(Camera, { 
  className: 'stroke-cyan-400', 
  ...props 
}),
isEntryPoint: false,
  credits: 3,
  inputs: [
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
      hideHandle: false
    },
    {
      name: 'Selector',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'CSS selector for specific element (optional, full page if empty)'
    },
    {
      name: 'Full page',
      type: TaskParamType.BOOLEAN,
      required: false,
      hideHandle: false,
      helpText: 'Capture full scrollable page (default: false)'
    }
  ] as const,
  outputs: [
    {
      name: 'Screenshot',
      type: TaskParamType.STRING,
      helpText: 'Base64 encoded screenshot image'
    }
  ] as const
} satisfies WorkflowTask