'use client';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import {fetchGroupExpenses} from "@/store/slices/group/groupExpensesSlice"

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
  UserRound,
} from 'lucide-react'
import { format } from 'date-fns'

import {
  openGroupViewExpense,
  closeGroupViewExpense,
  openGroupEditExpense,
} from "@/store/slices/uiSlice"
import axios from 'axios';

import {
  deleteGroupExpense
} from "@/store/slices/group/groupExpensesSlice"

import { Button } from '../ui/button';
import { setGroupExpenseFilters } from '@/store/slices/group/groupExpensesSlice'
// import { fetchBalanceSummary } from '@/store/slices/dashboard/balanceSlice'
// import { fetchGroupExpensesSummary } from '@/store/slices/dashboard/expensesSummarySlice'

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

const GroupExpenseItem = ({ expense }) => {
  const dispatch = useDispatch()
  const Icon = getIconForExpense(expense.type, expense.category)
  const date = new Date(expense.datetime)
  const formattedDate = !isNaN(date) ? format(date, 'PPp') : 'Invalid Date'

  const handleDelete = async () => {
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
              onClick={() => { restoreExpense(); toast.dismiss(t.id) }}
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
      const res = await axios.put(`/api/groups/${expense.groupId}/expenses/restore-expenses/${expense._id}`)
      if(res.status==200){
        dispatch(setGroupExpenseFilters({ search: '', type: '', category: '', trashed: "true" }))
        dispatch(fetchGroupExpenses({ page: 1,groupId:expense.groupId }))
        // dispatch(fetchBalanceSummary())
        // dispatch(fetchGroupExpensesSummary())
    
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

  return (
    <div className={`${expense.trashed? "bg-neutral-800":"bg-black"}  md:hover:scale-[1.02]  border border-transparent md:hover:border-white transition cursor-pointer flex items-center justify-between md:py-4 md:px-4 py-3 px-4 md:rounded-2xl rounded-xl`}>
      {/* Icon */}
      <div className='flex-col flex gap-3 w-full'>

        <div className='flex'>

    
          <div className="flex md:gap-4 gap-2 items-center">
            <div
              className={`${
                expense.type === 'debit'
                  ? 'text-red-500 bg-red-950'
                  : 'text-green-500 bg-green-950'
              } p-2 md:p-2.5 md:w-12 md:h-12 w-11 h-11 rounded-md border flex items-center justify-center `}
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
          <Undo2 onClick={restoreExpense} className="ms-2 w-5 h-5 text-neutral-300 hover:text-white cursor-pointer"/>
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
          <DropdownMenuItem onClick={() => dispatch(openGroupViewExpense(expense._id))} className="cursor-pointer">
            <Eye className="w-4 h-4 mr-2" /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatch(openGroupEditExpense(expense._id))} className="cursor-pointer">
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
       <div className='flex gap-2.5 items-center'>
          
        <div className="flex items-center gap-1 bg-neutral-900 px-3 py-1.5 rounded-full text-green-500 text-[0.6rem]">
          <UserRound className="w-3 h-3" />
          <span className="font-medium">Paid By:</span>
          <span className="text-white capitalize">{expense.paidBy?.name || 'Unknown'}</span>
        </div>
         <div className="flex items-center gap-1 bg-neutral-900 px-3 py-1.5 rounded-full text-amber-400 text-[0.6rem]">
          <UserRound className="w-3 h-3" />
          <span className="font-medium">Created By:</span>
          <span className="text-white capitalize">{expense.addedBy?.name || 'Unknown'}</span>
        </div>
        <div className="px-3 py-1 rounded-full border border-neutral-600 text-[0.6rem] capitalize font-semibold">
          {expense.category}
        </div>
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

export default GroupExpenseItem
