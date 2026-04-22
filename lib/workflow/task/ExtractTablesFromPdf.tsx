// lib/workflow/task/ExtractTablesFromPdf.ts
import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { LucideProps, TableIcon } from 'lucide-react'

export const ExtractTablesFromPdf = {
  type: TaskType.EXTRACT_TABLES_FROM_PDF,
  label: 'Extract tables from PDF',
  icon: (props: LucideProps) => <TableIcon className='stroke-purple-400' {...props} />,
  isEntryPoint: false,
  credits: 3,
  inputs: [
    {
      name: 'PDF file',
      type: TaskParamType.FILE,
      required: true,
      hideHandle: false,
      helperText: 'PDF file to extract tables from'
    }
  ] as const,
  outputs: [
    {
      name: 'Tables JSON',
      type: TaskParamType.STRING,
      helpText: 'Extracted tables in JSON format'
    },
    {
      name: 'Table count',
      type: TaskParamType.STRING,
      helpText: 'Number of tables found'
    }
  ] as const
} satisfies WorkflowTask