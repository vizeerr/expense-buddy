'use client'

import React from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from "../ui/sheet"
import { Button } from '../ui/button'

import { useDispatch, useSelector } from 'react-redux'
import {
  IndianRupee,
  CalendarDays,
  Tag,
  Type,
  StickyNote,
} from 'lucide-react'
import { format } from 'date-fns'
import EditExpenseModel from './EditExpenseModel'
import toast from 'react-hot-toast'
import axios from 'axios'
import {
  deleteExpense as deleteExpenseAction
} from "@/store/slices/expensesSlice"

import {
  closeViewExpense,
  openEditExpense,
} from "@/store/slices/uiSlice"
import { filterExpenses } from '@/utils/helper'
import {fetchExpenses} from "@/store/slices/expensesSlice"

const ViewExpenseModel = () => {
  const dispatch = useDispatch()

  const { viewExpense } = useSelector((state) => state.ui)
  const expenses = useSelector((state) => state.expenses.list)
  const filtered = filterExpenses(expenses, { _id: viewExpense.id })
  const expense = filtered[0] // ✅ Single item

  const handleDeleteExpense = async (id) => {
    const toastId = toast.loading("Moving to trash...")

    try {
      const res = await axios.delete(`/api/expenses/trash-expenses/${id}`)
      if (res.status === 200) {
        dispatch(deleteExpenseAction(id))
        dispatch(closeViewExpense())

        toast.success((t) => (
          <span className="flex items-center gap-2">
            Moved to <b>Trash</b>
            <Button
              onClick={() => {undoTrash(id); toast.dismiss(t.id)}}
              size={"sm"}
            >
              Undo
            </Button>
          </span>
        ), { id: toastId, duration: 5000 })
      }
    } catch (error) {
      console.error(error)
      toast.error("Unable to delete expense", { id: toastId })
    }
  }

  // Optional: implement actual undo logic here
  const undoTrash = async (id) => {
    const toastId = toast.loading("Restoring From trash...")
    try {
      const res = await axios.put(`/api/expenses/restore-expenses/${id}`)
      if(res.status==200){
        dispatch(fetchExpenses({ page: 1 }))
        toast.success("Restored successfully")
        toast.success((t) => (
          <span className="flex items-center gap-2">
            Restoring from <b>Trash</b>
          </span>
        ), { id: toastId, duration: 5000 })
      }

    } catch (error) {
      toast.error("Failed to restore")
    }
  }

  if (!expense) return null

  return (
    <>
      <Sheet open={viewExpense.open} onOpenChange={() => dispatch(closeViewExpense())}>
        <SheetContent
          side="bottom"
          className="w-[95vw] max-w-3xl mx-auto p-4 sm:p-6 rounded-3xl backdrop-blur-xl bg-transparent border-2 mb-10"
        >
          <SheetHeader className="px-0">
            <SheetTitle className="text-sm text-neutral-500">Detailed View</SheetTitle>
            <SheetDescription />
          </SheetHeader>

          {/* Expense Detail Card */}
          <div className="relative overflow-hidden rounded-3xl p-6 bg-white/30 dark:bg-black/20 shadow-xl border border-white/20 backdrop-blur-lg">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 gap-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 capitalize">
                {expense.title}
              </h2>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full shadow-inner border 
                ${expense.type === 'credit'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-red-100 text-red-800 border-red-300'}`}
              >
                {expense.type.toUpperCase()}
              </span>
            </div>

            {/* Description */}
            <div className="flex items-start gap-2 mb-4 text-sm">
              <StickyNote className="w-4 h-4 mt-1 text-yellow-500" />
              <p className="italic text-gray-600 dark:text-gray-300 capitalize">
                {expense.description || 'No description provided.'}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2 capitalize">
                <Tag className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Category:</span> {expense.category}
              </div>
              <div className="flex items-center gap-2 capitalize">
                <IndianRupee className="w-4 h-4 text-emerald-500" />
                <span className="font-medium">Amount:</span> ₹{expense.amount.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 capitalize">
                <CalendarDays className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Date:</span>{' '}
                {format(new Date(expense.datetime), 'dd MMM yyyy, hh:mm a')}
              </div>
              <div className="sm:hidden flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Type:</span> {expense.type}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <SheetFooter className="p-0 mt-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <SheetClose asChild>
                <Button variant="outline" size="lg" className="w-full text-white">
                  Close
                </Button>
              </SheetClose>
              <Button
                variant="outline"
                size="lg"
                className="w-full text-green-500"
                onClick={() => dispatch(openEditExpense(expense._id))}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full text-red-500"
                onClick={() => handleDeleteExpense(expense._id)}
              >
                Delete
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Modal */}
      <EditExpenseModel />
    </>
  )
}

export default ViewExpenseModel
