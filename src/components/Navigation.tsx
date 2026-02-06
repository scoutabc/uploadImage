"use client"

import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation(){
  return (
    <>
      <NavigationMenu className="h-8 bg-black font-bold text-white flex flex-row gap-0 list-none">
        <Item href="/" text="Home" />
        <Item href="/display" text="Display" />
      </NavigationMenu>
    </>
  )
}

function Item({ href,text,className="border-x px-4 py-1" }:{href:string,text:string,className?:string}){
  const pathname = usePathname();
  return(
    <NavigationMenuItem className={className}>
      <Link href={href} className={`${pathname !== href ? '' : 'text-blue-400'}`}>
          {text}
      </Link>
    </NavigationMenuItem>
  )
}