"use client"

import React, { useEffect } from "react"
import { useDispatch} from "react-redux"
import { useParams } from "next/navigation"

import { fetchGroupDetails, resetGroupDetails } from "@/store/slices/group/groupDetailSlice"
import GroupHeader from "@/components/group/GroupHeader"
import GroupBalanceCard from "@/components/group/GroupBalanceCard"
import GroupExpenseShortcuts from "../../../../../components/group/GroupExpenseShortcuts"
import EditGroupBudgetModel from "../../../../../components/group/EditGroupBudgetModel"
import GroupMemberSummary from "../../../../../components/group/GroupMembersCard"
import EditGroupModel from "../../../../../components/group/EditGroupModel"
import InviteMemberSheet from "../../../../../components/group/InviteGroupModel"
import ManageMembersModel from "../../../../../components/group/ManageMembersModel"

const GroupDetailsPage = () => {
  const { id: groupId } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    if (groupId) dispatch(fetchGroupDetails(groupId))

    return () => dispatch(resetGroupDetails())
  }, [dispatch, groupId])

  // ✅ Show group content
  return (
    <>
    <div className="xl:w-[80vw] md:w-[90vw] w-[95vw] mx-auto pt-20 pb-16 space-y-6">
      
      <GroupHeader
        groupId = {groupId}
        />

      <GroupBalanceCard id={groupId} />
      <GroupMemberSummary groupId={groupId}/>
      <GroupExpenseShortcuts groupId={groupId}/>
      {/* 🔜 Add GroupExpensesCard, GroupBudgetCard, etc */}
      
    </div>
    <EditGroupBudgetModel groupId={groupId}/>
    <EditGroupModel/>
    <InviteMemberSheet/>
    <ManageMembersModel/>
    </>
  )
}

export default GroupDetailsPage
