import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { ScanSearchIcon, LucideProps } from 'lucide-react'

export const ExtractAllValuesFromBoxTask = {
  type: TaskType.EXTRACT_ALL_VALUES_FROM_BOX,
  label: 'Extract All Values From Box',
  icon: (props: LucideProps) => <ScanSearchIcon className='stroke-cyan-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Html',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      variant: 'textarea',
      helpText: 'HTML content of the page'
    },
    {
      name: 'Container Selector',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helpText: 'CSS selector for the container element (e.g. ".product-card")'
    },
    {
      name: 'Attribute',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helpText: 'Attribute name to extract from all matching elements (e.g. "src", "href", "data-id")'
    },
    {
      name: 'Element Selector',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'Optional CSS selector to narrow which elements inside the box to scan (e.g. "img"). Leave empty to scan all elements.'
    },
    {
      name: 'Base URL',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'Base URL to resolve relative links (e.g. "https://example.com"). Only applied when the extracted value looks like a URL path.'
    }
  ] as const,
  outputs: [
    {
      name: 'Values',
      type: TaskParamType.STRING,
      helpText: 'JSON array of extracted attribute values: ["val1","val2",...]'
    },
    {
      name: 'Count',
      type: TaskParamType.STRING,
      helpText: 'Number of values found'
    }
  ] as const
} satisfies WorkflowTask
