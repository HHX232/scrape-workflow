import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { LinkIcon, LucideProps } from 'lucide-react'

export const ExtractLinksTask = {
  type: TaskType.EXTRACT_LINKS,
  label: 'Extract Links',
  icon: (props: LucideProps) => <LinkIcon className='stroke-violet-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Html',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      variant: 'textarea',
      helpText: 'HTML content to search for links'
    },
    {
      name: 'Selector',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helpText: 'CSS selector to find <a> elements (e.g. "a.product-link", ".list a")'
    },
    {
      name: 'Base URL',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'Base URL to resolve relative links (e.g. "https://example.com")'
    }
  ] as const,
  outputs: [
    {
      name: 'Links',
      type: TaskParamType.STRING,
      helpText: 'JSON array of extracted URLs: ["url1","url2",...]'
    },
    {
      name: 'Count',
      type: TaskParamType.STRING,
      helpText: 'Number of links found'
    }
  ] as const
} satisfies WorkflowTask