import { TaskParamType, TaskType } from '@/types/TaskType'
import { WorkflowTask } from '@/types/workflow'
import { LucideProps, TagIcon } from 'lucide-react'
import React from 'react'

export const GetAllForPriceTask = {
  type: TaskType.GET_ALL_FOR_PRICE,
  label: 'Parse Price',
  icon: (props: LucideProps) =>
    React.createElement(TagIcon, { className: 'stroke-emerald-400', ...props }),
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Price',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helpText: 'Строка с ценой, например "25 000" или "1,5"',
    },
    {
      name: 'Currency',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helpText: 'Строка с валютой, например "руб.", "₽", "USD"',
    },
    {
      name: 'Unit',
      type: TaskParamType.STRING,
      required: true,
      hideHandle: false,
      helpText: 'Единица измерения, например "кг", "т", "шт"',
    },
  ] as const,
  outputs: [
    {
      name: 'Price JSON',
      type: TaskParamType.STRING,
      helpText: 'Полный объект { price: { value, currency, unit }, value, currency, unit }',
    },
    {
      name: 'Value',
      type: TaskParamType.STRING,
      helpText: 'Числовое значение цены',
    },
    {
      name: 'Currency',
      type: TaskParamType.STRING,
      helpText: 'Код валюты (RUB, USD, EUR ...)',
    },
    {
      name: 'Unit',
      type: TaskParamType.STRING,
      helpText: 'Полное название единицы измерения',
    },
  ] as const,
} satisfies WorkflowTask
