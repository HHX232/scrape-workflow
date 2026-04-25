import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { TableIcon, LucideProps } from 'lucide-react'

export const ExtractTableAsJsonTask = {
  type: TaskType.EXTRACT_TABLE_AS_JSON,
  label: 'Extract Table as JSON',
  icon: (props: LucideProps) => <TableIcon className='stroke-cyan-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Html',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      variant: 'textarea',
      helpText: 'HTML страницы'
    },
    {
      name: 'Row Selector',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helpText: 'Селектор строк таблицы (e.g. "table.chars tr", ".props-list li")'
    },
    {
      name: 'Name Selector',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      value: 'th, td:first-child, dt',
      helpText: 'Селектор ячейки с названием характеристики внутри строки (default: "th, td:first-child, dt")'
    },
    {
      name: 'Value Selector',
      type: TaskParamType.STRING,
      required: false,
      hideHandle: false,
      value: 'td:last-child, dd',
      helpText: 'Селектор ячейки со значением внутри строки (default: "td:last-child, dd")'
    },
    {
      name: 'Skip Empty Rows',
      type: TaskParamType.BOOLEAN,
      required: false,
      hideHandle: true,
      helpText: 'Пропускать строки где имя или значение пустое'
    }
  ] as const,
  outputs: [
    {
      name: 'JSON Array',
      type: TaskParamType.STRING,
      helpText: 'JSON-массив вида [{"name":"...","value":"..."}, ...]'
    },
    {
      name: 'Count',
      type: TaskParamType.STRING,
      helpText: 'Количество извлечённых строк'
    }
  ] as const
} satisfies WorkflowTask
