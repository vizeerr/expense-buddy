'use client';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import {fetchExpenses} from "@/store/slices/dashboard/expensesSlice"

import {
  ArrowDownRight,
  ArrowUpRight,
  ShoppingCart,
  ShoppingBag,
  Utensils,
  Plane,
  ReceiptIndianRupee,
  Clapperboard,
  Stethoscope,
  BookOpen,
  Gift,
  IndianRupee,
  Briefcase,
  BarChart3,
  RefreshCw,
  Star,
  User,
  Pencil,
  Trash2,
  Eye,
  MoreHorizontal,
  Undo2,
} from 'lucide-react'
import { format } from 'date-fns'

import {
  openViewExpense,
  closeViewExpense,
  openEditExpense,
} from "@/store/slices/uiSlice"
import axios from 'axios';

import {
  deleteExpense as deleteExpenseAction
} from "@/store/slices/dashboard/expensesSlice"
import { Button } from '../ui/button';
import { setFilters } from '@/store/slices/dashboard/expensesSlice'
import { fetchDashboard } from '../../utils/dashboardFetch';

const debitCategoryIcons = {
  food: Utensils,
  travel: Plane,
  shopping: ShoppingCart,
  bills: ReceiptIndianRupee,
  entertainment: Clapperboard,
  health: Stethoscope,
  education: BookOpen,
  others: ShoppingBag,
}

const creditCategoryIcons = {
  salary: IndianRupee,
  freelance: Briefcase,
  investment: BarChart3,
  gifts: Gift,
  refunds: RefreshCw,
  bonus: Star,
  others: User,
}

const getIconForExpense = (type, category) => {
  if (type === 'debit') return debitCategoryIcons[category] || ShoppingBag
  if (type === 'credit') return creditCategoryIcons[category] || User
  return ShoppingCart
}

const ExpenseItem = ({ expense }) => {
  
  const dispatch = useDispatch()
  const Icon = getIconForExpense(expense.type, expense.category)
  const date = new Date(expense.datetime)
  const formattedDate = !isNaN(date) ? format(date, 'PPp') : 'Invalid Date'

  const handleDelete = async () => {
    const toastId = toast.loading("Moving to trash...")

    try {
      const res = await axios.delete(`/api/expenses/trash-expenses/${expense._id}`)
      if (res.status === 200) {
        dispatch(deleteExpenseAction(expense._id))
        dispatch(closeViewExpense())
        fetchDashboard(dispatch)
        toast.success((t) => (
          <span className="flex items-center gap-2">
            Moved to <b>Trash</b>
            <Button
              onClick={() => {restoreExpense(); toast.dismiss(t.id)}}
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

  const handlePermanentDelete = async () => {
    const toastId = toast.loading("Deleting Permanently...")

    try {
      const res = await axios.delete(`/api/expenses/delete-expenses/${expense._id}`)
      if (res.status === 200) {
        dispatch(setFilters({ search: '', type: '', category: '', trashed: "true" }))
        dispatch(deleteExpenseAction(expense._id))
        dispatch(closeViewExpense())
        fetchDashboard(dispatch)
        toast.success((t) => (
          <span className="flex items-center gap-2">
            Moved to <b>Trash</b>
            <Button
              onClick={() => {restoreExpense(); toast.dismiss(t.id)}}
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

   const restoreExpense = async () => {
    const toastId = toast.loading("Restoring From trash...")

    try {
      const res = await axios.put(`/api/expenses/restore-expenses/${expense._id}`)
      if(res.status==200){
        dispatch(setFilters({ search: '', type: '', category: '', trashed: "false" }))
        fetchDashboard(dispatch)

        toast.success("Restored successfully")
        toast.success((t) => (
          <span className="flex items-center gap-2">
            Restoring from <b>Trash</b>
          </span>
        ), { id: toastId, duration: 5000 })
      }

    } catch (error) {     
      toast.error("Failed to restore", { id: toastId })
    }
  }

  return (
    <div onClick={() => dispatch(openViewExpense(expense._id))} className={`${expense.trashed? "bg-neutral-800":"bg-black"}  md:hover:scale-[1.02]  border border-transparent md:hover:border-white transition cursor-pointer flex items-center justify-between md:py-4 md:px-4 py-3 px-4 md:rounded-2xl rounded-xl`}>
      {/* Icon */}
      <div className='flex-col flex gap-3 w-full'>

        <div className='flex'>

    
          <div className="flex md:gap-4 gap-2 items-center">
            <div
              className={`${
                expense.type === 'debit'
                  ? 'text-red-500 bg-red-950'
                  : 'text-green-500 bg-green-950'
              } p-2 md:w-10 md:h-12 w-11 h-11 rounded-md border flex items-center justify-center`}
            >
              <Icon className="w-8 h-8" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-grow ml-4 ">
            <div className="flex flex-col ">
              <p className="text-base font-semibold capitalize">
                {expense.title?.length > 18
                  ? expense.title.slice(0, 18) + '...'
                  : expense.title}
              </p>
              <p className="text-sm text-neutral-400 capitalize">
                {expense.description?.length > 25
                  ? expense.description.slice(0, 25) + '..'
                  : expense.description}
              </p>
            </div>
            <p className="text-xs text-neutral-400">{formattedDate}</p>
          </div>
<div className='space-y-3'>
  <div className="py-1 px-2 text-center rounded-full bg-[#ffbf0054] text-[0.6rem] capitalize font-semibold">
            {expense.paymentMethod || "Other"}
          </div>
               {/* Dropdown */}
      {
        expense.trashed ?  (
          // <Undo2 onClick={restoreExpense} className="ms-2 w-5 h-5 text-neutral-300 hover:text-white cursor-pointer"/>
          <DropdownMenu>
        <DropdownMenuTrigger className="outline-none ml-4">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground hover:text-white cursor-pointer" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-40 bg-neutral-900 border border-neutral-800"
        >
          <DropdownMenuItem onClick={() => dispatch(openViewExpense(expense._id))} className="cursor-pointer">
            <Eye className="w-4 h-4 mr-2" /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={restoreExpense} className="cursor-pointer">
            <Undo2 className="w-4 h-4 mr-2" /> Restore
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePermanentDelete} className="cursor-pointer text-red-500">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Forever
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
        ) :
        (
          <DropdownMenu>
        <DropdownMenuTrigger className="outline-none ml-4">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground hover:text-white cursor-pointer" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-40 bg-neutral-900 border border-neutral-800"
        >
          <DropdownMenuItem onClick={() => dispatch(openViewExpense(expense._id))} className="cursor-pointer">
            <Eye className="w-4 h-4 mr-2" /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatch(openEditExpense(expense._id))} className="cursor-pointer">
            <Pencil className="w-4 h-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-500">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

        )
      }
</div>
     
         
        </div>
      

      {/* Category & Amount */}
      <div className="flex flex-row items-center justify-between w-full gap-2">
       
        <div className="px-3 py-1 rounded-full border border-neutral-600 text-[0.6rem] capitalize font-semibold">
          {expense.category}
        </div>
        <div className='flex'>
          <p
          className={`text-base font-semibold flex gap-1 items-center flex-shrink-0 ${
            expense.type === 'debit' ? 'text-red-500' : 'text-green-500'
          }`}
        >
          {expense.type === 'debit' ? '-' : '+'}₹ {expense.amount}
          {expense.type === 'debit' ? (
            <ArrowDownRight className="w-4" />
          ) : (
            <ArrowUpRight className="w-4" />
          )}
        </p>
         
        </div>
        
      </div>
        
      </div>

      
      
    </div>
  )
}

export default ExpenseItem
