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


import { useSelector,useDispatch } from 'react-redux'
import { logoutUser } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'
import axios from 'axios'
import { CirclePlus, House, LogOut, UserRoundCog, Users, Wallet } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'

const BottomNavbar = () => {
  const user = useSelector((state) => state.auth.user)
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

        <div className='flex border-2 border-neutral-600 bg-transparent backdrop-blur-2xl h-full rounded-full px-4 py-1 drop-shadow-2xl drop-shadow-accent-foreground'>    
          <Button asChild variant="ghost" size="lg" className='flex pointer gap-0 flex-col justify-center items-center'>
            <Link href="/dashboard">
              <House size={20} />
              <p className='text-[0.6rem] text-muted-foreground'>Home</p>
            </Link>
          </Button>

          <Button asChild variant="ghost"  size="lg" className='flex pointer gap-0 flex-col justify-center items-center'>
            <Link href="/dashboard/groups">
              <Users size={20} />
              <p className='text-[0.6rem] text-muted-foreground'>Group</p>
            </Link>
          </Button>

          <Button variant="ghost"  size="lg" className='flex pointer gap-0 p-0 flex-col justify-center items-center'>
            
              <CirclePlus  size={25} className='text-amber-500'/>
            
          </Button>
          
          <Button asChild variant="ghost"  size="lg" className='flex pointer gap-0 flex-col justify-center items-center'>
            <Link href="/dashboard/expenses">
              <Wallet size={20} />
              <p className='text-[0.6rem] text-muted-foreground'>Expenses</p>
            </Link>
          </Button>
          <Button asChild variant="ghost"  size="lg" className='flex pointer gap-0 flex-col justify-center items-center'>
            <Link href="/dashboard/profile">
              <UserRoundCog size={20} />
              <p className='text-[0.6rem] text-muted-foreground'>Profile</p>
            </Link>
          </Button>
        </div>
            
      {/* <Menubar className=''>
        <MenubarMenu>
           

          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className='flex flex-col'>
              <Users size={19} />
            
              <p className='text-[0.6rem] text-muted-foreground'>Groups</p>
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
            
              <p className='text-[0.6rem] text-muted-foreground'>All Expenses</p>
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
            
              <p className='text-[0.6rem] text-muted-foreground'>Profile</p>
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
