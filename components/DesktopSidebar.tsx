'use client'

import { CoinsIcon, HomeIcon, Layers2Icon, MenuIcon, ShieldCheckIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Logo from './Logo'
import { Button, buttonVariants } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

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
  
  // Исправленная логика определения активного роута
  const activeRoute = routes.find((r) => {
    if (r.href === '/') {
      return pathname === '/'; // Для главной страницы точное совпадение
    }
    return pathname.startsWith(r.href); // Для остальных проверяем начало пути
  }) || routes[0];

  return (
    <div className='hidden relative md:block min-w-[280px] max-w-[280px] h-screen overflow-auto w-full bg-primary/5 dark:bg-secondary/30 dark:text-foreground text-muted-foreground border-r-2 border-separate '>
      <div className='flex items-center justify-center gap-2 border-b-[1px] border-separate p-4 '>
        <Logo />
      </div>
      <div className=' p-2'>TODO CREDITS</div>
      <div className='flex flex-col p-2'>
        {routes.map((r) => {
          return (
            <Link
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
  
  // Такая же исправленная логика для мобильной версии
  const activeRoute = routes.find((r) => {
    if (r.href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(r.href);
  }) || routes[0];

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