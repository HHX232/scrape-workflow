import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { GitMergeIcon } from 'lucide-react'

export const CoalesceTask = {
  type: TaskType.COALESCE,
  label: 'OR (Coalesce)',
  icon: (props) => <GitMergeIcon className='stroke-violet-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Value A',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      variant: 'textarea'
    },
    {
      name: 'Value B',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      variant: 'textarea'
    },
    {
      name: 'Selector',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: true,
      helpText: 'CSS-селектор: если Value A (HTML) содержит — берём A, иначе B'
    },
    {
      name: 'Web page A',
      type: TaskParamType.BROWSER_INSTANCE,
      required: false,
      hideHandle: false,
    },
    {
      name: 'Web page B',
      type: TaskParamType.BROWSER_INSTANCE,
      required: false,
      hideHandle: false,
    },
    {
      name: 'Page selector',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: true,
      helpText: 'CSS-селектор: ищем в текущей Web page — если найден берём A, иначе B'
    },
    {
      name: 'Раздельные выходы',
      type: TaskParamType.BOOLEAN,
      required: false,
      hideHandle: true,
      helpText: 'Вместо Result/Web page — четыре выхода: Value Output A/B (строка) и Page Output A/B (веб-страница). Используй ту пару, что нужна, вторую не подключай. Выполняется только цепочка выбранной ветки, вторая помечается как Skipped — вплоть до точки, где обе ветки снова сходятся (например, в другом OR).'
    }
  ] as const,
  outputs: [
    { name: 'Result', type: TaskParamType.STRING },
    { name: 'Web page', type: TaskParamType.BROWSER_INSTANCE }
  ] as const,
  conditionalOutputs: [
    {
      flagInput: 'Раздельные выходы',
      whenTrue: [
        { name: 'Value Output A', type: TaskParamType.STRING },
        { name: 'Value Output B', type: TaskParamType.STRING },
        { name: 'Page Output A', type: TaskParamType.BROWSER_INSTANCE },
        { name: 'Page Output B', type: TaskParamType.BROWSER_INSTANCE }
      ],
      replaces: ['Result', 'Web page']
    }
  ]
} satisfies WorkflowTask
