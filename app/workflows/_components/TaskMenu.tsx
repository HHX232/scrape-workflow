'use client'
import {useTutorial} from '@/components/context/TutorialContext'
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {TaskRegistry} from '@/lib/workflow/task/registry'
import {TaskType} from '@/types/TaskType'
import {CoinsIcon} from 'lucide-react'
import {useEffect} from 'react'

export default function TaskMenu() {
  const {startTutorial} = useTutorial()

  // Автоматический запуск туториала для новых пользователей
  useEffect(() => {
    const hasSeenTaskMenuTutorial = localStorage.getItem('taskmenu-tutorial-seen')

    if (!hasSeenTaskMenuTutorial) {
      // Небольшая задержка для загрузки компонента
      const timer = setTimeout(() => {
        startTaskMenuTutorial()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [])

  const startTaskMenuTutorial = () => {
    const hasExtraction = true // Проверка доступа к категории
    const hasAI = true // Проверка доступа к AI функциям

    startTutorial([
      {
        stepNumber: 1,
        elementId: 'taskmenu-container',
        title: 'Меню задач',
        description:
          'Здесь находятся все доступные задачи для создания автоматизированных рабочих процессов. Задачи организованы по категориям.',
        position: 'left'
      },
      {
        stepNumber: hasExtraction ? 2 : null,
        elementId: 'taskmenu-extraction',
        title: 'Extraction - Извлечение данных',
        description: 'Задачи для извлечения данных со страниц: HTML, текст из элементов, извлечение с помощью AI.',
        position: 'left'
      },
      {
        stepNumber: 3,
        elementId: 'taskmenu-interactions',
        title: 'User Interactions',
        description: 'Задачи для взаимодействия с веб-страницами: заполнение форм, клики, навигация, скроллинг.',
        position: 'left'
      },
      {
        stepNumber: 4,
        elementId: 'taskmenu-timing',
        title: 'Timing Controls',
        description: 'Управление временем выполнения задач и ожидание элементов на странице.',
        position: 'left'
      },
      {
        stepNumber: 5,
        elementId: 'taskmenu-storage',
        title: 'Data Storage',
        description: 'Работа с JSON данными: чтение и добавление свойств для хранения промежуточных результатов.',
        position: 'left'
      },
      {
        stepNumber: 6,
        elementId: 'taskmenu-results',
        title: 'Result Delivery',
        description: 'Отправка результатов выполнения через webhook или другие каналы доставки.',
        position: 'left'
      },
      {
        stepNumber: hasExtraction ? 7 : null,
        elementId: 'taskmenu-task-example',
        title: 'Карточка задачи',
        description:
          'Перетащите задачу на рабочую область, чтобы добавить её в ваш workflow. Стоимость выполнения показана справа.',
        position: 'left'
      },
      {
        stepNumber: hasAI ? 8 : null,
        elementId: 'taskmenu-ai-task',
        title: 'AI задачи',
        description:
          'Задачи с использованием искусственного интеллекта требуют больше кредитов, но обеспечивают интеллектуальное извлечение данных.',
        position: 'left'
      }
    ])

    // Сохраняем, что пользователь прошел туториал
    localStorage.setItem('taskmenu-tutorial-seen', 'true')
  }

  return (
    <aside
      id='taskmenu-container'
      className='w-[340px] min-w-[340px] max-w-[340px] border-r-2 border-separate h-full p-2 overflow-y-auto'
    >
      <Accordion type='multiple' className='w-full' defaultValue={['pdf-work']}>
        <AccordionItem value='pdf-work' id='taskmenu-pdf-work'>
          <AccordionTrigger className='font-bold'>PDF work</AccordionTrigger>
          <AccordionContent className='flex flex-col gap-1'>
            <TaskMenuBtn taskType={TaskType.DOWNLOAD_PDF} id='taskmenu-task-example'></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.EXTRACT_TEXT_FROM_PDF}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.EXTRACT_TABLES_FROM_PDF}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.EXTRACT_IMAGES_FROM_PDF}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.SAVE_IMAGES_TO_ZIP}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.SAVE_TABLES_AS_EXCEL}></TaskMenuBtn>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='extraction' id='taskmenu-extraction'>
          <AccordionTrigger className='font-bold'>Extraction</AccordionTrigger>
          <AccordionContent className='flex flex-col gap-1'>
            <TaskMenuBtn taskType={TaskType.PAGE_TO_HTML} id='taskmenu-task-example'></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENT}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.EXTRACT_DATA_WITH_AI} id='taskmenu-ai-task'></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENTS}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.ACCUMULATE_RESULTS}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.ADD_PROPERTY_TO_JSON}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.FOR_EACH}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.EXTRACT_LINKS}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.MERGE_TEXTS_TO_JSON}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.ACCUMULATE_RESULTS}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.GET_ALL_LINKS_IN_BOX}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.CLICK_WHILE_VISIBLE}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.EXTRACT_TABLE_AS_JSON}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.GET_ALL_FOR_PRICE}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.MERGE_ARRAYS}></TaskMenuBtn>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='interactions' id='taskmenu-interactions'>
          <AccordionTrigger className='font-bold'>User interactions</AccordionTrigger>
          <AccordionContent className='flex flex-col gap-1'>
            <TaskMenuBtn taskType={TaskType.FILL_INPUT}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.NAVIGATE_URL}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.CLICK_ELEMENT}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.SCROLL_TO_ELEMENT}></TaskMenuBtn>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='timing' id='taskmenu-timing'>
          <AccordionTrigger className='font-bold'>Timing controls</AccordionTrigger>
          <AccordionContent className='flex flex-col gap-1'>
            <TaskMenuBtn taskType={TaskType.WAIT_FOR_ELEMENT}></TaskMenuBtn>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='data storage' id='taskmenu-storage'>
          <AccordionTrigger className='font-bold'>Data storage</AccordionTrigger>
          <AccordionContent className='flex flex-col gap-1'>
            <TaskMenuBtn taskType={TaskType.READ_PROPERTY_FROM_JSON}></TaskMenuBtn>
            <TaskMenuBtn taskType={TaskType.ADD_PROPERTY_TO_JSON}></TaskMenuBtn>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='results' id='taskmenu-results'>
          <AccordionTrigger className='font-bold'>Result delivery</AccordionTrigger>
          <AccordionContent className='flex flex-col gap-1'>
            <TaskMenuBtn taskType={TaskType.DELIVER_VIA_WEBHOOK}></TaskMenuBtn>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Кнопка для повторного запуска туториала */}
      <div className='mt-4 pt-4 border-t'>
        <Button variant='outline' size='sm' className='w-full' onClick={startTaskMenuTutorial}>
          🎓 Показать туториал
        </Button>
      </div>
    </aside>
  )
}

function TaskMenuBtn({taskType, id}: {taskType: TaskType; id?: string}) {
  const task = TaskRegistry[taskType]
  const onDragStart = (event: any, taskType: TaskType) => {
    event?.dataTransfer?.setData('application/reactflow', taskType)
    event.dataTransfer.effectAllowed = 'move'
  }
  return (
    <Button
      id={id}
      onDragStart={(event) => onDragStart(event, taskType)}
      draggable
      variant={'secondary'}
      className='flex justify-between items-center gap-2 border w-full'
    >
      <div className='flex gap-2'>
        {task?.icon && <task.icon size={20} />}
        {task?.label}
      </div>
      <Badge variant={'outline'} className='gap-2 flex items-center'>
        <CoinsIcon size={16} />
        {task?.credits}
      </Badge>
    </Button>
  )
}
