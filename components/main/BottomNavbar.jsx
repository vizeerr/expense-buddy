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
      <Menubar className='bg-transparent backdrop-blur-2xl h-full rounded-full px-8 py-2 drop-shadow-2xl drop-shadow-accent-foreground'>
        <MenubarMenu>
            <MenubarTrigger className='flex flex-col justify-content-center'>
              <House size={19} />
            
              <p className='text-[0.5rem] text-muted-foreground'>Home</p>
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Dashboard <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Add Expense <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Update Budget <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Share</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Print</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className='flex flex-col'>
              <Users size={19} />
            
              <p className='text-[0.5rem] text-muted-foreground'>Groups</p>
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
            
              {/* <p className='text-[0.5rem] text-muted-foreground'>All Expenses</p> */}
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
            
              <p className='text-[0.5rem] text-muted-foreground'>All Expenses</p>
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
            
              <p className='text-[0.5rem] text-muted-foreground'>Profile</p>
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
          
      </Menubar>
      </div>
    }
    </>
    )
  }

export default BottomNavbar
