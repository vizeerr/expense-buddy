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
    
    <div className="xl:w-[80vw] md:w-[90vw] w-[95vw] mx-auto  pt-20 pb-16 space-y-6 ">
      <div className='bg-neutral-900 p-6 rounded-2xl border'>
        <div className='flex justify-between items-center pb-6'>
          <h2 className="text-2xl font-bold mb-4">Your Groups</h2>
          <Button onClick={()=>dispatch(openAddGroup())}>
            <Plus/>
            Add Group
          </Button>
        </div>
        <GroupList groups={groups} loading={loading} />
      </div>
      
      
    </div>
  )
}

export default GroupsPage
