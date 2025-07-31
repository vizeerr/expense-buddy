'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchExpenses } from '@/store/slices/dashboard/expensesSlice'
import ExpenseItem from '@/components/dashboard/ExpenseItem'
import ExpensesFilter from '@/components/dashboard/ExpensesFilter'

import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import ExpensesCard from '../../../../components/dashboard/ExpenseCard'
import { Button } from '@/components/ui/button'
import { openAddExpense } from "@/store/slices/uiSlice"
import AddExpenseModel from '@/components/dashboard/AddExpenseModel'

const ExpensesPage = () => {
  const dispatch = useDispatch()
  const { list, loading, page, hasMore, filters } = useSelector(state => state.expenses)
  const observer = useRef()

  const lastItemRef = useCallback(node => {
    if (loading || !hasMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        dispatch(fetchExpenses({ page: page + 1, ...filters }))
      }
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, dispatch, page, filters])

  // Initial load or filter change
  useEffect(() => {
    dispatch(fetchExpenses({ page: 1, ...filters }))
  }, [dispatch, filters])

  return (
    <div className="xl:w-[80vw] md:w-[90vw] w-[95vw] mx-auto  pt-20 pb-20 space-y-5 ">
      
       <ExpensesCard/>
      
      <div className='bg-transparent border   p-4 rounded-2xl'>
        <div className='flex justify-between items-center '>
          <h2 className="text-2xl font-bold ">All Expenses</h2>
          <Button size="sm" className=" bg-transparent border border-red-500 text-red-500 drop-shadow-xl drop-shadow-red-600"  onClick={()=>dispatch(openAddExpense())}>
            <Plus/>
            Add Expense
          </Button>
        </div>

      <ExpensesFilter />

      {list.length === 0 && !loading && (
        <p className="text-neutral-400">No expenses found.</p>
      )}

      <div className="space-y-4">
        {list.map((expense, idx) => (
          <div key={expense._id} ref={idx === list.length - 1 ? lastItemRef : null}>
            <ExpenseItem expense={expense} />
          </div>
        ))}

        {loading && (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-[120px] w-full rounded-xl" />)
        )}
      </div>

      </div>
      <AddExpenseModel/>
    </div>
  )
}

export default ExpensesPage
