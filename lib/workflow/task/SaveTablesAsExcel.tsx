import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { LucideProps, FileSpreadsheetIcon } from 'lucide-react'

export const SaveTablesAsExcel = {
  type: TaskType.SAVE_TABLES_AS_EXCEL as any, // Добавьте в TaskType
  label: 'Save tables as Excel',
  icon: (props: LucideProps) => <FileSpreadsheetIcon className='stroke-emerald-400' {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Tables JSON',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helperText: 'Tables JSON from ExtractTablesFromPdf'
    }
  ] as const,
  outputs: [
    {
      name: 'Excel file',
      type: TaskParamType.FILE,
      helpText: 'Generated .xlsx file with all tables'
    },
    {
      name: 'File name',
      type: TaskParamType.STRING,
      helpText: 'Name of generated file'
    }
  ] as const
} satisfies WorkflowTask
