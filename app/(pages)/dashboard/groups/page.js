'use client'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGroups } from '@/store/slices/group/groupSlice'
import GroupList from '@/components/group/GroupList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {openAddGroup} from "@/store/slices/uiSlice"

const GroupsPage = () => {
  const dispatch = useDispatch()
  const { list: groups, loading } = useSelector((state) => state.groups)

  useEffect(() => {
    dispatch(fetchGroups())
  }, [dispatch])

  return (
    <>
    <div className="xl:w-[80vw] md:w-[90vw] w-[95vw] mx-auto  pt-16 pb-20 space-y-5 ">
      <div className='bg-transparent p-4 rounded-2xl border'>
        <div className='flex justify-between items-center pb-6'>
          <h2 className="text-2xl font-bold ">Joined Groups</h2>
          <Button  size="sm" className ="bg-transparent border border-green-500 text-green-500 drop-shadow-xl drop-shadow-green-600" onClick={()=>dispatch(openAddGroup())}>
            <Plus/>
            Create Group
          </Button>
        </div>
        <GroupList groups={groups} loading={loading} />
      </div>
    </div>
    
    </>
      
  )
}

export default GroupsPage
