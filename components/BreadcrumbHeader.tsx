'use client'

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "./ui/breadcrumb"
import { MobileSidebar } from "./DesktopSidebar"

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
          </BreadcrumbItem>
        })}
      </BreadcrumbList></Breadcrumb>
    </div>
  )
}
