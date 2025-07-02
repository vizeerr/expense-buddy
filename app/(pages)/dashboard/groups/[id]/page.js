// app/dashboard/groups/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGroupDetail } from '@/store/slices/groupDetailSlice'
import GroupDetailCard from '@/components/groups/GroupDetailCard'
import GroupExpensesList from '@/components/groups/GroupExpensesList'
import AddGroupExpenseModel from '@/components/groups/AddGroupExpenseModel'

const GroupDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { group, loading, error } = useSelector(state => state.groupDetail)

  useEffect(() => {
    if (id) dispatch(fetchGroupDetail(id))
  }, [dispatch, id])

  if (loading) return <p>Loading group...</p>
  if (error) return <p className="text-red-500">Error: {error}</p>
  if (!group) return null

  return (
    <div className="xl:w-[80vw] md:w-[90vw] w-[95vw] mx-auto py-16 space-y-6">
      <GroupDetailCard group={group} />
      <GroupExpensesList groupId={id} />
      <AddGroupExpenseModel groupId={id} />
    </div>
  )
}

export default GroupDetailPage
