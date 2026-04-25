import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { BoxSelectIcon, LucideProps } from 'lucide-react'

export const GetAllLinksInBoxTask = {
  type: TaskType.GET_ALL_LINKS_IN_BOX,
  label: 'Get All Links In Box',
  icon: (props: LucideProps) => <BoxSelectIcon className='stroke-orange-400' {...props} />,
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
      helpText: 'CSS selector for the container element whose <a> tags will be collected'
    },
    {
      name: 'Base URL',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      helpText: 'Base URL to resolve relative links (e.g. "https://example.com")'
    },
    {
      name: 'Match Siblings',
      type: TaskParamType.BOOLEAN,
      required: false,
      hideHandle: true,
      helpText: 'Убрать :nth-child(N) из конца селектора и взять все похожие элементы'
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
