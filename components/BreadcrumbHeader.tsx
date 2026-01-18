'use client'

import { usePathname } from "next/navigation"
import { MobileSidebar } from "./DesktopSidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb"

export default function BreadcrumbHeader() {
   const pathname = usePathname()
   const paths = pathname === '/' ? [''] : pathname.split('/').filter((p)=> p.length > 0)
  return (
    <div className=" flex items-center flex-start">
      <MobileSidebar />
      <Breadcrumb>
      <BreadcrumbList>
        {paths.map((p, i)=>{
          return <BreadcrumbItem key={i}>
            <BreadcrumbLink className=" capitalize" href={`/${p}`}>{p === "" ? "Home" : p}</BreadcrumbLink>
             {i !== paths.length - 1 && <BreadcrumbSeparator />}
          </BreadcrumbItem>
         
        })}
      </BreadcrumbList></Breadcrumb>
    </div>
  )
}
