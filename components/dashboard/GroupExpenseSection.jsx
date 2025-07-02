'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGroupExpenses } from '@/store/slices/groupExpensesSlice'

import GroupExpenseItem from './GroupExpenseItem'
import GroupExpenseFilter from './GroupExpenseFilter' // similar to ExpensesFilter
import { Skeleton } from '@/components/ui/skeleton'

const GroupExpensesSection = ({ groupId }) => {
  const dispatch = useDispatch()
  const observer = useRef()

  const {
    list,
    loading,
    page,
    hasMore,
    filters
  } = useSelector((state) => state.groupExpenses[groupId] || {
    list: [],
    loading: false,
    page: 1,
    hasMore: true,
    filters: {}
  })

  const lastItemRef = useCallback(node => {
    if (loading || !hasMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        dispatch(fetchGroupExpenses({ groupId, page: page + 1, filters }))
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, page, groupId, filters, dispatch])

  // Initial load or filters change
  useEffect(() => {
    dispatch(fetchGroupExpenses({ groupId, page: 1, filters }))
  }, [groupId, filters, dispatch])

  return (
    <div className="bg-neutral-900 p-6 mt-10 rounded-2xl border">
      <div className="flex justify-between items-center pb-6">
        <h2 className="text-xl font-bold">Group Expenses</h2>
      </div>

      <GroupExpenseFilter groupId={groupId} />

      {list.length === 0 && !loading && (
        <p className="text-muted-foreground pt-6">No expenses found for this group.</p>
      )}

      <div className="space-y-4 pt-2">
        {list.map((expense, idx) => (
          <div key={expense._id} ref={idx === list.length - 1 ? lastItemRef : null}>
            <GroupExpenseItem expense={expense} />
          </div>
        ))}

        {loading && (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[60px] w-full rounded-xl" />
          ))
        )}
      </div>
    </div>
  )
}

export default GroupExpensesSection
