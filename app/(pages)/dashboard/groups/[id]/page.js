"use client"

import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "next/navigation"

import { fetchGroupDetail, clearGroupDetail } from "@/store/slices/group/groupDetailSlice"
import GroupHeader from "@/components/group/GroupHeader"
import { Skeleton } from "@/components/ui/skeleton"
import GroupBalanceCard from "../../../../../components/group/GroupBalanceCard"

const GroupDetailsPage = () => {
  const { id: groupId } = useParams()
  const dispatch = useDispatch()

  const { group, loading, error } = useSelector(state => state.groupDetail)

  useEffect(() => {
    if (groupId) {
      dispatch(fetchGroupDetail(groupId))
    }

    return () => {
      dispatch(clearGroupDetail())
    }
  }, [dispatch, groupId])

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-24 w-full rounded-xl mb-6" />
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="p-4 text-red-500">
        {error || "Group not found."}
      </div>
    )
  }

  return (
    <div className="xl:w-[80vw] md:w-[90vw] w-[95vw] mx-auto  pt-20 pb-16 space-y-6 ">
      <GroupHeader
        group={group}
        onEdit={() => console.log("Edit group")}
        onSettings={() => console.log("Open settings")}
      />
      <GroupBalanceCard id={groupId}/>

      {/* 🔜 Add GroupBalanceCard, GroupExpensesCard, GroupBudgetCard */}
    </div>
  )
}

export default GroupDetailsPage
