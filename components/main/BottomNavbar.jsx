"use client"
import React from 'react'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { usePathname } from 'next/navigation'


import { useSelector,useDispatch } from 'react-redux'
import { logoutUser } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'
import axios from 'axios'
import { CirclePlus, House, LogOut, UserRoundCog, Users, Wallet } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { openAddExpense } from '@/store/slices/uiSlice'

const BottomNavbar = () => {
  const user = useSelector((state) => state.auth.user)
  const pathname = usePathname()

const isActive = (path) => {
  if (path === '/dashboard') {
    return pathname === '/dashboard' // exact match for Home
  }
  return pathname.startsWith(path) // partial match for others
}

  const dispatch = useDispatch()
  const logoutAcc = async() =>{
    try {
      const res = await axios.post('/api/auth/logout')
      if(res.status==200){
        toast.success("Account Logout !")
        dispatch(logoutUser())
      }
    } catch (error) {
      
    }
  }
  return (<>
  
    {user &&
      <div className='fixed bottom-2 z-3 w-full flex justify-center'>

        <div className='flex items-center justify-between border-2 w-[95vw] max-w-sm border-neutral-600 bg-transparent backdrop-blur-2xl h-full rounded-full px-4 py-1.5 drop-shadow-2xl drop-shadow-accent-foreground'>    
        <Link href="/dashboard" className='w-14 h-12 rounded-2xl transition-all flex pointer gap-0 flex-col justify-center items-center'>
  <House size={25} className={isActive('/dashboard') ? 'text-amber-500' : 'text-muted-foreground'} />
  <p className={`text-xs ${isActive('/dashboard') ? 'text-amber-500' : 'text-muted-foreground'}`}>Home</p>
</Link>

<Link href="/dashboard/expenses" className='w-14 h-12 rounded-2xl transition-all flex pointer gap-0 flex-col justify-center items-center'>
  <Wallet size={25} className={isActive('/dashboard/expenses') ? 'text-amber-500' : 'text-muted-foreground'} />
  <p className={`text-xs ${isActive('/dashboard/expenses') ? 'text-amber-500' : 'text-muted-foreground'}`}>Expenses</p>
</Link>




          <div onClick={() => dispatch(openAddExpense())} className='w-14 h-12 rounded-2xl transition-all flex pointer gap-0 flex-col justify-center items-center'>
           
              <CirclePlus  size={28} className='text-amber-500 drop-shadow-2xl drop-shadow-amber-500'/>
            
          </div>

          <Link href="/dashboard/groups" className='w-14 h-12 rounded-2xl transition-all flex pointer gap-0 flex-col justify-center items-center'>
  <Users size={25} className={isActive('/dashboard/groups') ? 'text-amber-500' : 'text-muted-foreground'} />
  <p className={`text-xs ${isActive('/dashboard/groups') ? 'text-amber-500' : 'text-muted-foreground'}`}>Groups</p>
</Link>

<Link href="/dashboard/profile" className='w-14 h-12 rounded-2xl transition-all flex pointer gap-0 flex-col justify-center items-center'>
  <UserRoundCog size={25} className={isActive('/dashboard/profile') ? 'text-amber-500' : 'text-muted-foreground'} />
  <p className={`text-xs ${isActive('/dashboard/profile') ? 'text-amber-500' : 'text-muted-foreground'}`}>Profile</p>
</Link>
        </div>
            
      {/* <Menubar className=''>
        <MenubarMenu>
           

          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className='flex flex-col'>
              <Users size={19} />
            
              <p className='text-xs text-muted-foreground'>Groups</p>
            </MenubarTrigger>
            <MenubarContent>
            <MenubarItem>
                Add Expense <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Update Budget <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Share</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={logoutAcc} className=' text-red-500 font-semibold'>
                Logout
                <MenubarShortcut><LogOut className='text-red-500'/></MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          
          <MenubarMenu>
            <MenubarTrigger className='flex flex-col'>
              <CirclePlus  size={25} className='text-amber-500'/>
            
              
            </MenubarTrigger>
            <MenubarContent>
            <MenubarItem>
                New Tab <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>New Window</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Share</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={logoutAcc} className=' text-red-500 font-semibold'>
                Logout
                <MenubarShortcut><LogOut className='text-red-500'/></MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className='flex flex-col'>
              <Wallet size={19} />
            
              <p className='text-xs text-muted-foreground'>All Expenses</p>
            </MenubarTrigger>
            <MenubarContent>
            <MenubarItem>
                New Tab <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>New Window</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Share</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={logoutAcc} className=' text-red-500 font-semibold'>
                Logout
                <MenubarShortcut><LogOut className='text-red-500'/></MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className='flex flex-col '>
              <UserRoundCog size={19} />
            
              <p className='text-xs text-muted-foreground'>Profile</p>
            </MenubarTrigger>
            <MenubarContent>
            <MenubarItem>
                New Tab <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>New Window</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Share</MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={logoutAcc} className=' text-red-500 font-semibold'>
                Logout
                <MenubarShortcut><LogOut className='text-red-500'/></MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          
      </Menubar> */}
      </div>
    }
    </>
    )
  }

export default BottomNavbar
