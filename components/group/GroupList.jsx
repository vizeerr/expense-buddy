'use client'
import React from 'react'
import GroupCard from './GroupCard'
import { Skeleton } from "@/components/ui/skeleton"

const GroupList = ({ groups, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!groups || groups.length === 0) {
    return <p className="text-muted-foreground">You are not part of any groups yet.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {groups.map((group,index) => (
        <GroupCard key={index} group={group} />
      ))}
    </div>
  )
}

export default GroupList
