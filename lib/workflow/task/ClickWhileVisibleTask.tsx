import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { RepeatIcon, LucideProps } from 'lucide-react'

export const ClickWhileVisibleTask = {
  type: TaskType.CLICK_WHILE_VISIBLE,
  label: 'Click While Visible',
  icon: (props: LucideProps) => <RepeatIcon className='stroke-yellow-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
    },
    {
      name: 'Selector',
      type: TaskParamType.STRING,
      required: false,
      helpText: 'CSS selector кнопки (e.g. "a.showmore"). Можно оставить пустым если задан Button Text'
    },
    {
      name: 'Button Text',
      type: TaskParamType.STRING,
      required: false,
      helpText: 'Текст кнопки для поиска (e.g. "Показать ещё"). Используется если Selector не нашёл элемент'
    },
    {
      name: 'Max Clicks',
      type: TaskParamType.STRING,
      required: false,
      value: '1000',
      helpText: 'Максимум кликов (по умолчанию 1000)'
    },
    {
      name: 'Wait Ms',
      type: TaskParamType.STRING,
      required: false,
      value: '500',
      helpText: 'Пауза между кликами в мс (по умолчанию 500)'
    }
  ] as const,
  outputs: [
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE,
    },
    {
      name: 'Clicks Performed',
      type: TaskParamType.STRING,
      helpText: 'Сколько раз была нажата кнопка'
    }
  ] as const
} satisfies WorkflowTask
