"use client"
import React from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useSelector } from 'react-redux'
import icon from "@/public/icon.png"

import Image from 'next/image'
const TopNavbar = () => {
  const user = useSelector((state) => state.auth.user) 
  return (
    <div className='py-3 px-4 flex justify-between items-center fixed top-0 w-full z-3 bg-[#0b000011] backdrop-blur-lg'>
      <div>
        <Link href="/" className='text-xl font-semibold flex items-center'>
          <Image src={icon} width={35} height={35} alt='Logo'/>
          Expense Buddy
        </Link>
      </div>
      <div className='flex items-center gap-5'>
        
        
      
          <Button aschild="true" variant="ghost" className={`${!user?"black":"hidden"} bg-white text-black`}>
          <Link href="/login">  
            Login
          </Link>
        </Button>  
          
        
        
      </div>
    </div>
  )
}

export default TopNavbar
