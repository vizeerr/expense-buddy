'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGroupMemberSummary } from '@/store/slices/group/memberSummarySlice'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function getInitials(name = '') {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

export default function GroupMemberSummary({ groupId }) {
  const dispatch = useDispatch()
  const { members, loading, error } = useSelector(state => state.groupMember)
  console.log(members);
  

  useEffect(() => {
    if (groupId) dispatch(fetchGroupMemberSummary(groupId))
  }, [groupId, dispatch])

  if (loading) {
    return (
      <div className="flex gap-4 flex-wrap">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-44 w-80 rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="border p-6 xl:rounded-2xl rounded-xl bg-neutral-900">
        <div className="flex gap-2 items-center">
          {/* <ShoppingBag className="w-6" /> */}
          <p className="text-xl font-bold">Users Expenses</p>
        </div>
        <div className="flex flex-wrap gap-4 mt-5">
      {members.map((member, idx) => (
        <Card
          key={member._id}
          className={cn(
            'w-80 p-4 rounded-xl text-white border',
            idx % 2 === 0 ? 'bg-[#1b0c2e] border-[#7133c0]' : 'bg-[#081c36] border-[#1b65d3]'
          )}
        >
          <CardContent className="p-0 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">
                {getInitials(member.name)}
              </div>
              <div className="flex-1">
                <p className="font-semibold capitalize">{member.name}</p>
                <p className="text-xs text-gray-400 ">{member.email}</p>
              </div>
              
            </div>

            {/* Total Spent */}
            <div className='flex items-center justify-between'>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">₹{member.totalAmount.toLocaleString()}</p>
            </div>

            {/* Expenses & % */}
            <div className="flex justify-between items-center text-sm text-gray-400">
              <p>{member.expenseCount} expenses</p>
              <p>{member.percentage.toFixed(1)}% of total</p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  idx % 2 === 0 ? 'bg-purple-500' : 'bg-blue-500'
                )}
                style={{ width: `${member.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    </div>
    
  )
}
