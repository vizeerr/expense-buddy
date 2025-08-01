'use client'

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
  HandHelping,
  UserRound,
  ArrowLeft,
} from 'lucide-react'
import { format } from 'date-fns'
import EditGroupExpenseModel from '@/components/group/EditGroupExpenseModel'
import toast from 'react-hot-toast'
import axios from 'axios'
import {
  deleteGroupExpense
} from "@/store/slices/group/groupExpensesSlice"

import {
  closeGroupViewExpense,
  openGroupEditExpense,
} from "@/store/slices/uiSlice"

import { filterExpenses } from '@/utils/helper'
import {fetchGroupExpenses} from "@/store/slices/group/groupExpensesSlice"
import { getColorConfigFromString } from "../../utils/colorPalette"
import { fetchGroupDashboard } from "../../utils/dashboardFetch"

const ViewGroupExpenseModel = () => {
  const dispatch = useDispatch()

  const { viewGroupExpense } = useSelector((state) => state.ui)
  const expenses = useSelector((state) => state.groupExpenses.list)
  const filtered = filterExpenses(expenses, { _id: viewGroupExpense.id })
  const expense = filtered[0] 

  const handledeleteGroupExpense = async (id) => {
    const toastId = toast.loading("Moving to trash...")

    try {
      const res = await axios.delete(`/api/groups/${expense.groupId}/expenses/trash-expenses/${expense._id}`)
      if (res.status === 200) {
        dispatch(deleteGroupExpense(expense._id))
        dispatch(closeGroupViewExpense())

        toast.success((t) => (
          <span className="flex items-center gap-2">
            Moved to <b>Trash</b>
            <Button
              onClick={() => { undoTrash(); toast.dismiss(t.id) }}
              size={"sm"}
            >
              Undo
            </Button>
          </span>
        ), { id: toastId, duration: 5000 })
      }

    }  catch (error) {
      console.error(error)
      toast.error("Unable to delete expense", { id: toastId })
    }
  }

  // Optional: implement actual undo logic here
  const undoTrash = async () => {
    const toastId = toast.loading("Restoring From trash...")
    try {
      const res = await axios.put(`/api/groups/${expense.groupId}/expenses/restore-expenses/${expense._id}`)
      if(res.status==200){
        dispatch(fetchGroupExpenses({ page: 1,groupId:expense.groupId }))
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

    const handlePermanentDelete = async (id) => {
    const toastId = toast.loading("Deleting Permanently...")

    try {
      const res = await axios.delete(`/api/groups/${expense.groupId}/expenses/trash-expenses/${expense._id}`)
      if (res.status === 200) {
        dispatch(deleteGroupExpense(id))
        dispatch(closeGroupViewExpense())
        fetchGroupDashboard(dispatch,{force:true})
        toast.success((t) => (
          <span className="flex items-center gap-2">
            Removed <b>Permanently</b>
          </span>
        ), { id: toastId, duration: 5000 })
      }
    } catch (error) {
      console.error(error)
      toast.error("Unable to delete expense", { id: toastId })
    }
  }


  if (!expense) return null

  return (
    <>
      <Sheet open={viewGroupExpense.open} onOpenChange={() => dispatch(closeGroupViewExpense())}>
        <SheetContent
          side="bottom"
          className="w-[95vw] max-w-3xl mx-auto p-4  rounded-3xl backdrop-blur-xl bg-transparent border-2 md:mb-10 mb-4"
        >
          <SheetHeader className='flex flex-row items-center gap-3  px-0 pt-0 pb-0 '>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" type="button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </SheetClose>
            <SheetTitle className='text-sm text-neutral-500 font-bold'>Detailed View</SheetTitle>
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
                <HandHelping className="w-4 h-4 text-pink-500" />
                <span className="font-medium">Payment Method:</span> {expense.paymentMethod || 'N/A'}
              </div>
              <div className="flex items-center gap-2 capitalize">
                <CalendarDays className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Date:</span>{' '}
                {format(new Date(expense.datetime), 'dd MMM yyyy, hh:mm a')}
              </div>
              <div className="flex items-center gap-2 capitalize">
                <UserRound className="w-4 h-4 text-green-500" />
                <div className="flex flex-wrap gap-1.5">
                  <span className="font-medium">Paid By:</span> {expense.paidBy.name  || 'N/A'} 
                  <span className="text-xs text-muted-foreground lowercase">({(expense.paidBy.email )})</span>
                </div>
              </div>
              <div className="flex items-center gap-2 capitalize">
                <UserRound className="w-4 h-4 text-amber-500" />
                 <div className="flex flex-wrap gap-1.5">

                  <span className="font-medium">Created By:</span> {expense.addedBy.name || 'N/A'}
                  <span className="text-xs text-muted-foreground lowercase">({(expense.addedBy.email )})</span>
                 </div>

              </div>

            </div>
           <div className="mt-4 flex items-center gap-2 capitalize flex-wrap">
  <UserRound className="w-4 h-4 text-amber-500" />
  <span className="font-medium">Split Between:</span>

  <div className="flex gap-2 flex-wrap">
    {Array.isArray(expense.splitBetween) && expense.splitBetween.length > 0 ? (
      expense.splitBetween.map((user, index) => {
        const color = getColorConfigFromString(user.email || user.name || 'user');
        return (
          <span
            key={user._id || index}
            className={`${color.border} border rounded-2xl px-3 py-1.5 text-xs`}
          >
            {user.name}
            <span className="text-muted-foreground lowercase"> ({user.email})</span>
          </span>
        );
      })
    ) : (
      <span className="text-xs text-muted-foreground">N/A</span>
    )}
  </div>
</div>

          </div>

          {/* Footer Buttons */}
       
           {/* Footer Buttons */}
                    <SheetFooter className="p-0 mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                        <SheetClose asChild>
                          <Button variant="outline" size="lg" className="w-full text-white">
                            Close
                          </Button>
                        </SheetClose>
                        {
                          expense.trashed? ( <Button
                          variant="outline"
                          size="lg"
                          className="w-full text-green-500"
                          onClick={() => undoTrash(expense._id)}
                        >
                          Restore
                        </Button>):(
                          <Button
                          variant="outline"
                          size="lg"
                          className="w-full text-green-500"
                          onClick={() => dispatch(openGroupEditExpense(expense._id))}
                        >
                          Edit
                        </Button>
                        )
                        }
                        
                        {
                          expense.trashed ? (
                            <Button
                          variant="outline"
                          size="lg"
                          className="w-full text-red-500"
                          onClick={() => handlePermanentDelete(expense._id)}
                        >
                          Delete Forever
                        </Button>
                          ) : (
                            <Button
                          variant="outline"
                          size="lg"
                          className="w-full text-red-500"
                          onClick={() => handledeleteGroupExpense(expense._id)}
                        >
                          Trash
                        </Button>
                          )
                        }
                        
                      </div>
                    </SheetFooter>

        </SheetContent>
      </Sheet>

      {/* Edit Modal */}
      <EditGroupExpenseModel />
    </>
  )
}

export default ViewGroupExpenseModel
