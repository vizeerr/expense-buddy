'use client'

import React, { useEffect, useState } from 'react'
import {
  Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription, SheetClose
} from "../ui/sheet"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "../ui/select"
import {
  Popover, PopoverTrigger, PopoverContent
} from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { closeGroupEditExpense } from '@/store/slices/uiSlice'
import { fetchGroupExpenses } from '@/store/slices/group/groupExpensesSlice'
import { creditCategories, debitCategories } from '@/utils/helper'
import { useParams } from 'next/navigation'
import { fetchGroups } from '@/store/slices/group/groupSlice'

const EditGroupExpenseModal = () => {
  const dispatch = useDispatch()
  const { id: currentGroupId } = useParams()
  const groups = useSelector(state => state.groups.list)
  const currentUser = useSelector(state => state.auth.user?._id)
  const { editGroupExpense } = useSelector((state) => state.ui)
  const allGroupExpenses = useSelector(state => state.groupExpenses.list) || []

  const existingExpense = allGroupExpenses.find(
    exp => exp._id === editGroupExpense.id
  )

  const [form, setForm] = useState({
    _id:"",
    title: '',
    description: '',
    amount: '',
    category: '',
    type: '',
    paymentMethod: '',
    paidBy: '',
    groupId: '',
    date: new Date(),
    time: new Date().toTimeString().slice(0, 5),
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!groups.length) dispatch(fetchGroups())
  }, [groups, dispatch])

  // Set form from existing expense
  useEffect(() => {
    if (!existingExpense) return
    const dt = new Date(existingExpense.datetime)
    setForm({
      _id:existingExpense._id,
      title: existingExpense.title || '',
      description: existingExpense.description || '',
      amount: existingExpense.amount || '',
      category: existingExpense.category || '',
      type: existingExpense.type || '',
      paymentMethod: existingExpense.paymentMethod || '',
      paidBy: existingExpense.paidBy?._id || currentUser || '',
      groupId: existingExpense.groupId || currentGroupId || '',
      date: dt,
      time: dt.toTimeString().slice(0, 5),
    })
  }, [existingExpense, currentUser, currentGroupId])

  // Set paidBy to current user if not set
  useEffect(() => {
    if (currentUser && !form.paidBy) {
      setForm(prev => ({ ...prev, paidBy: currentUser }))
    }
  }, [currentUser, form.paidBy])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validateForm = () => {
    const { title, amount, category, type, paymentMethod, date, time, paidBy } = form
    if (!title || !amount || !category || !type || !paymentMethod || !date || !time || !paidBy) {
      toast.error("Please fill all required fields.")
      return false
    }
    if (title.length < 2) {
      toast.error("Title must be at least 2 characters.")
      return false
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      toast.error("Invalid amount.")
      return false
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      toast.error("Invalid time format.")
      return false
    }
    return true
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        _id: existingExpense._id,
        amount: form.amount.toString(),
        date: form.date.toISOString().split('T')[0],
        time: form.time,
      }
      const res = await fetch(`/api/groups/${form.groupId}/expenses/modify-expenses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.status === 200) {
        toast.success("Group expense updated!")
        dispatch(fetchGroupExpenses({ page: 1, groupId: form.groupId }))
        dispatch(closeGroupEditExpense())
      } else {
        throw new Error(data?.message || 'Failed to update.')
      }
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => dispatch(closeGroupEditExpense())

  const currentGroup = groups.find(g => g._id === form.groupId)
  const members = currentGroup
  ? [
      { _id: currentGroup.owner._id, name: currentGroup.owner.name, role: 'owner' },
      ...currentGroup.members
        .filter(m => m.user._id !== currentGroup.owner._id) // 🔥 remove duplicate
        .map(m => ({
          _id: m.user._id,
          name: m.user.name,
          role: m.role,
        })),
    ]
  : []


  return (
    <Sheet open={editGroupExpense.open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="w-[95vw] max-w-3xl mx-auto p-6 rounded-3xl backdrop-blur-xl bg-transparent border-2 md:mb-10 mb-4"
      >
       <form onSubmit={handleSubmit}>
                <SheetHeader className='py-2 px-0'>
                  <SheetTitle className='text-sm text-neutral-500 font-bold'>Add Group Expense</SheetTitle>
                  <SheetDescription />
                </SheetHeader>
      
               <div className="space-y-5 mt-3">
                           <div className="grid gap-2">
                             <Label htmlFor="title" className="text-base">Title</Label>
                             <Input id="title" name="title" className='text-base' value={form.title} onChange={handleChange} required />
                           </div>
               
                           <div className="grid gap-2">
                             <Label htmlFor="description" className="text-base">Description</Label>
                             <Textarea name="description" className='text-base' value={form.description} onChange={handleChange} />
                           </div>
      
                           <div className="grid grid-cols-2 gap-5">
                             <div className="grid gap-2">
                                 <Label htmlFor="amount" className="text-base">Amount</Label>
                                 <div className="relative">
                                   <span className="absolute inset-y-0 left-3 flex items-center text-base text-muted-foreground">₹</span>
                                   <Input
                                     id="amount"
                                     name="amount"
                                     type="number"
                                     className="pl-8 text-base"
                                     value={form.amount}
                                     onChange={handleChange}
                                   />
                                   </div>
                               </div>
      
                               <div className="grid gap-2">
                                <Label className="text-base">Group</Label>
                                  <Select
                                    value={form.groupId}
                                    className='w-full'
                                    onValueChange={(val) => setForm({ ...form, groupId: val })}
                               
                                  >
                                  <SelectTrigger className='w-full capitalize'>
                                    <SelectValue placeholder="Select group" />
                                  </SelectTrigger>
                                 <SelectContent className='w-full'>
                                    {groups.map((g) => (
                                      <SelectItem key={g._id} value={g._id}>
                                        {g.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
      
                                </Select>
                              </div>
      
                           </div>
      
                           
               
                            <div className="grid grid-cols-2 gap-5">
                             
                               <div className="grid gap-2">
                               <Label className="text-base">Payment Method</Label>
                               <Select
                                 value={form.paymentMethod}
                                 onValueChange={(val) => setForm({ ...form, paymentMethod: val })}
                                 className="text-base w-full"
                               >
                                 <SelectTrigger className='w-full'>
                                   <SelectValue placeholder="Select type" />
                                 </SelectTrigger>
                                 <SelectContent className='w-full'>
                                   <SelectItem value="upi">UPI</SelectItem>
                                   <SelectItem value="cash">Cash</SelectItem>
                                   <SelectItem value="card">Card</SelectItem>
                                   <SelectItem value="netbanking">Net Banking</SelectItem>
                                   <SelectItem value="other">Other</SelectItem>
                                 </SelectContent>
                               </Select>
                             </div>
                             <div className="grid gap-2 mt-6">
                                <Label className="text-base">Paid By</Label>
                                <Select
                                  value={form.paidBy}
                                  onValueChange={(val) => setForm({ ...form, paidBy: val })}
                                >
                                  <SelectTrigger className='w-full capitalize'>
                                    <SelectValue placeholder="Select who paid" />
                                  </SelectTrigger>
                                  <SelectContent className='w-full'>
                                    {members.map((m) => (
                                      <SelectItem key={m._id} value={m._id}>
                                        {m.name} {m.role === 'owner' && '(Owner)'}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                            </div>
                          
               
                           {/* Responsive grid for type, category, date, time */}
                           <div className="grid grid-cols-2 gap-5">
                             <div className="grid gap-2">
                               <Label className="text-base">Type</Label>
                               <Select
                                 value={form.type}
                                 onValueChange={(val) => setForm({ ...form, type: val, category: '' })}
                                 className="text-base w-full"
                               >
                                 <SelectTrigger className='w-full'>
                                   <SelectValue placeholder="Select type" />
                                 </SelectTrigger>
                                 <SelectContent className='w-full'>
                                   <SelectItem value="credit">Credited</SelectItem>
                                   <SelectItem value="debit">Debited</SelectItem>
                                 </SelectContent>
                               </Select>
                             </div>
               
                             <div className="grid gap-2">
                               <Label className="text-base">Category</Label>
                               <Select
                                 value={form.category}
                                 onValueChange={(val) => setForm({ ...form, category: val })}
                                 disabled={!form.type}
                                 className="text-base w-full"
                               >
                                 <SelectTrigger className='w-full'>
                                   <SelectValue placeholder={form.type ? "Select category" : "Select type first"} />
                                 </SelectTrigger>
                                 <SelectContent className='w-full'>
                                   {(form.type === 'debit' ? debitCategories : form.type === 'credit' ? creditCategories : []).map(cat => (
                                     <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             </div>
               
                             <div className="grid gap-2">
                               <Label className="text-base">Date</Label>
                               <Popover>
                                 <PopoverTrigger asChild>
                                   <Button variant="outline" className="justify-start text-left w-full">
                                     <CalendarIcon className="mr-2 h-4 w-4" />
                                     {format(form.date, "PPP")}
                                   </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-auto p-0" align="start">
                                   <Calendar
                                     mode="single"
                                     selected={form.date}
                                     onSelect={(date) => setForm({ ...form, date })}
                                     initialFocus
                                   />
                                 </PopoverContent>
                               </Popover>
                             </div>
               
                             <div className="grid gap-2">
                               <Label className="text-base">Time</Label>
                               <div className="flex items-center gap-2 ">
                                 <Clock className="w-4 h-4 text-muted-foreground" />
                                 <Input
                                   id="time"
                                   name="time"
                                   type="time"
                                   value={form.time}
                                   onChange={handleChange}
                                   className="text-base w-full"
                                   required
                                 />
                               </div>
                             </div>
                           </div>
                         </div>
      
                <SheetFooter className="mt-8 p-0">
                  <div className="flex flex-wrap items-center gap-4 w-full">
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                      {loading ? 'Updating...' : 'Update Group Expense'}

                    </Button>
                    <SheetClose asChild>
                      <Button variant="outline" className="w-full sm:w-auto text-red-500">Close</Button>
                    </SheetClose>
                  </div>
                </SheetFooter>
              </form>
      </SheetContent>
    </Sheet>
  )
}

export default EditGroupExpenseModal
