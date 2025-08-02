'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGroupExpenses } from '@/store/slices/group/groupExpensesSlice'
import GroupExpenseItem from '@/components/group/GroupExpenseItem'
import GroupExpenseFilter from '@/components/group/GroupExpenseFilter'
import { useParams } from "next/navigation"

import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
// import ExpensesCard from '../../../../components/dashboard/ExpenseCard'
import { Button } from '@/components/ui/button'
import { openAddGroupExpense } from "@/store/slices/uiSlice"
import AddGroupExpenseModel from '@/components/group/AddGroupExpenseModel'
import {fetchGroups} from "@/store/slices/group/groupSlice"
import GroupExpenseCard from '../../../../../../components/group/GroupExpenseCard'
import UserSettlementSheet from '../../../../../../components/group/UserSettlementSlice'

import { openSettlementSheet } from '@/store/slices/uiSlice' // ✅ Make sure this exists

const ExpensesPage = () => {
  const dispatch = useDispatch()
  const { id: groupId } = useParams()
  const { list, loading, page, hasMore, filters } = useSelector(state => state.groupExpenses)
  const observer = useRef()
  const groups = useSelector(state => state.groups.list)
  const [groupMembers, setGroupMembers] = useState([])

 useEffect(() => {
    dispatch(fetchGroups())
  }, [dispatch]
 )

useEffect(() => {
    // console.log(groups);
    
    const group = groups.find(e => e._id === groupId)
    if (group) {
      const allMembers = [
        ...group.members.map(m => ({
          _id: m.user._id,
          name: m.user.name,
        }))
      ]
      setGroupMembers(allMembers)
    }
  }, [groups, groupId])

  const lastItemRef = useCallback(node => {
    if (loading || !hasMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        dispatch(fetchGroupExpenses({ page: page + 1, groupId:groupId,...filters }))
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, dispatch, page, filters,groupId])

  // Initial load or filter change
  useEffect(() => {
    dispatch(fetchGroupExpenses({ page: 1,groupId:groupId, ...filters }))
  }, [dispatch, filters,groupId])

  return (
    <div className="xl:w-[80vw] md:w-[90vw] w-[95vw] mx-auto  pt-16 pb-20 space-y-5 ">
      <GroupExpenseCard/>
      
      <div className='bg-transparent border   p-4 rounded-2xl'>
        <div className='flex flex-col gap-4 '>
          <h2 className="text-2xl font-bold ">All Expenses</h2>
           <div className='flex gap-2 justify-end'>

           <Button
      size="sm"
      className="border bg-transparent border-green-400 text-green-400 drop-shadow-xl drop-shadow-green-500"
      onClick={() => dispatch(openSettlementSheet())} // ✅ Trigger opening
      >
      Settle Up
    </Button>
          <Button size="sm" className=" bg-transparent border border-red-500 text-red-500 drop-shadow-xl drop-shadow-red-600"  onClick={()=>dispatch(openAddGroupExpense())}>
            <Plus/>
            Add Expense
          </Button>
      </div>
        </div>
      
     
      <UserSettlementSheet groupId={groupId}/>
      <GroupExpenseFilter groupMembers={groupMembers}/>

      {list.length === 0 && !loading && (
        <p className="text-neutral-400">No expenses found.</p>
      )}

      <div className="space-y-4">
        {list.map((expense, idx) => (
          <div key={expense._id} ref={idx === list.length - 1 ? lastItemRef : null}>
            <GroupExpenseItem expense={expense} />
          </div>
        ))}

        {loading && (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="sm:h-[120px] h-[140px] w-full rounded-xl" />)
        )}
      </div>

      </div>
      <AddGroupExpenseModel/>
    </div>
  )
}

export default ExpensesPage
