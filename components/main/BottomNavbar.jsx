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
import { LogOut } from 'lucide-react'

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
      <div className='fixed bottom-5 z-3 w-full flex justify-center'>
      <Menubar>
        <MenubarMenu>
            <MenubarTrigger>
              Dashboard
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New Tab <MenubarShortcut>⌘T</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>New Window</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Share</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Print</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Profile </MenubarTrigger>
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
            <MenubarTrigger>Expenses </MenubarTrigger>
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
