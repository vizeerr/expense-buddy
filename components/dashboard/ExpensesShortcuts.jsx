'use client'

import  { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import ExpenseItem from './ExpenseItem' // ✅ import here
import { fetchExpenses } from '@/store/slices/dashboard/expensesSlice'

const ExpensesShortcuts = () => {
  const dispatch = useDispatch()
  const { list: expenses, loading, error } = useSelector((state) => state.expenses)
  useEffect(() => {
    dispatch(fetchExpenses({ page: 1 }))
  }, [dispatch])
  
  const visibleExpenses = expenses.slice(0, 5)

  return (
    <>
      <div className="border p-6 xl:rounded-3xl rounded-2xl bg-neutral-900">
        <div className="flex gap-2 items-center">
          <ShoppingBag className="w-6" />
          <p className="text-xl font-bold">Recent Transactions</p>
        </div>

        <div className="pt-6 rounded-3xl">
          <hr className="mb-4" />

          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-white">
              Recent Activity
              <span className="text-xs text-neutral-400 font-semibold ml-1">
                ({expenses.length} transactions)
              </span>
            </p>
            <p className="text-xs font-bold text-neutral-500">Today</p>
          </div>

          <hr className="my-4" />

          <div className="space-y-4">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="w-full h-[120px] rounded-xl" />)
            ) : (
              visibleExpenses.map((expense) => (
                <ExpenseItem
                  key={expense._id}
                  expense={expense}
                />
              ))
            )}
            {error && <p className="text-red-500 text-sm">Error: {error}</p>}
          </div>

          <div className="w-full flex justify-center mt-5">
            <Button asChild>
              <Link href="/dashboard/expenses">View All</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ExpensesShortcuts
