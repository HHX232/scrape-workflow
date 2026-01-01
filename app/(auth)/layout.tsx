import Logo from '@/components/Logo'
import { ReactNode } from 'react'

export default function layout({children}:{children:ReactNode}) {
  return (
    <div className='flex flex-col items-center justify-center h-screen gap-4'>
      <Logo/>
      {children}</div>
  )
}
