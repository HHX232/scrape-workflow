'use client'

import { CoinsIcon, HomeIcon, Layers2Icon, MenuIcon, ShieldCheckIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Logo from './Logo'
import { Button, buttonVariants } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { UserAvailableCreditsBadge } from './UserAvailableCreditsBadge'
import { useTutorial } from './context/TutorialContext'

export default function DesktopSidebar() {
  const routes = [
    {
      href: '/',
      label: 'Home',
      icon: HomeIcon
    },
    {
      href: '/workflows',
      label: 'Workflows',
      icon: Layers2Icon
    },
    {
      href: '/credentials',
      label: 'Credentials',
      icon: ShieldCheckIcon
    },
    {
      href: '/billing',
      label: 'Billing',
      icon: CoinsIcon
    }
  ]
  const pathname = usePathname()
  const { startTutorial } = useTutorial()
  
  const activeRoute = routes.find((r) => {
    if (r.href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(r.href)
  }) || routes[0]

  // Автоматический запуск туториала для новых пользователей
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('sidebar-tutorial-seen')
    
    if (!hasSeenTutorial && pathname === '/') {
      // Небольшая задержка для загрузки страницы
      const timer = setTimeout(() => {
        startSidebarTutorial()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [pathname])

  const startSidebarTutorial = () => {
    const isWorkflowsAvailable = true // Проверка доступа к функции
    const hasBillingAccess = true // Проверка доступа к биллингу
    
    startTutorial([
      {
        stepNumber: 1,
        elementId: 'sidebar-logo',
        title: 'Добро пожаловать!',
        description: 'Это главная навигация приложения. Давайте познакомимся с основными разделами.',
        position: 'right',
      },
      {
        stepNumber: 2,
        elementId: 'sidebar-credits',
        title: 'Ваш баланс кредитов',
        description: 'Здесь отображается количество доступных кредитов для использования функций приложения.',
        position: 'right',
      },
      {
        stepNumber: 3,
        elementId: 'sidebar-home',
        title: 'Главная страница',
        description: 'Отсюда начинается ваша работа. Здесь вы найдете общую информацию и быстрый доступ к основным функциям.',
        position: 'right',
      },
      {
        stepNumber: isWorkflowsAvailable ? 4 : null,
        elementId: 'sidebar-workflows',
        title: 'Workflows',
        description: 'Создавайте и управляйте автоматизированными рабочими процессами для повышения продуктивности.',
        position: 'right',
      },
      {
        stepNumber: 5,
        elementId: 'sidebar-credentials',
        title: 'Учетные данные',
        description: 'Управляйте вашими учетными данными и настройками безопасности.',
        position: 'right',
      },
      {
        stepNumber: hasBillingAccess ? 6 : null,
        elementId: 'sidebar-billing',
        title: 'Биллинг',
        description: 'Просматривайте историю платежей и управляйте подпиской.',
        position: 'right',
      },
    ])

    // Сохраняем, что пользователь прошел туториал
    localStorage.setItem('sidebar-tutorial-seen', 'true')
  }

  return (
    <div className='hidden relative md:block min-w-[280px] max-w-[280px] h-screen overflow-auto w-full bg-primary/5 dark:bg-secondary/30 dark:text-foreground text-muted-foreground border-r-2 border-separate '>
      <div 
        id='sidebar-logo'
        className='flex items-center justify-center gap-2 border-b-[1px] border-separate p-4 '
      >
        <Logo />
      </div>
      <div 
        id='sidebar-credits'
        className='p-2 flex justify-between items-center'
      >
        <UserAvailableCreditsBadge/>
      </div>
      <div className='flex flex-col p-2'>
        {routes.map((r) => {
          const elementId = `sidebar-${r.label.toLowerCase()}`
          return (
            <Link
              id={elementId}
              className={buttonVariants({variant: activeRoute?.href === r.href ? 'sidebarActiveItem' : 'sidebarItem'})}
              key={r.href}
              href={r.href}
            >
              <r.icon size={20} />
              {r.label}
            </Link>
          )
        })}
      </div>
      
      {/* Кнопка для повторного запуска туториала */}
      <div className='absolute bottom-4 left-0 right-0 px-4'>
        <Button 
          variant='outline' 
          size='sm' 
          className='w-full'
          onClick={startSidebarTutorial}
        >
          🎓 Показать туториал
        </Button>
      </div>
    </div>
  )
}

export function MobileSidebar() {
  const routes = [
    {
      href: '/',
      label: 'Home',
      icon: HomeIcon
    },
    {
      href: '/workflows',
      label: 'Workflows',
      icon: Layers2Icon
    },
    {
      href: '/credentials',
      label: 'Credentials',
      icon: ShieldCheckIcon
    },
    {
      href: '/billing',
      label: 'Billing',
      icon: CoinsIcon
    }
  ]
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  const activeRoute = routes.find((r) => {
    if (r.href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(r.href)
  }) || routes[0]

  return (
    <div className='block border-separate bg-background md:hidden'>
      <nav className='container flex items-center justify-between px-8 '>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant={'ghost'} size={'icon'}>
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent side={'left'} className='w-[400px] sm:w-[540px] space-y-4'>
            <Logo />
            <UserAvailableCreditsBadge/>
            <div className='flex flex-col gap-1'>
              {routes.map((r) => {
                return (
                  <Link
                    onClick={() => {
                      setIsOpen((prev) => !prev)
                    }}
                    className={buttonVariants({
                      variant: activeRoute?.href === r.href ? 'sidebarActiveItem' : 'sidebarItem'
                    })}
                    key={r.href}
                    href={r.href}
                  >
                    <r.icon size={20} />
                    {r.label}
                  </Link>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}