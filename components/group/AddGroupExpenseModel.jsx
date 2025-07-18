'use client'

import React, { useEffect, useState } from 'react'
import {
  Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetFooter, SheetTitle,
} from "../ui/sheet"
import { Button } from '../ui/button'
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { closeAddGroupExpense } from '@/store/slices/uiSlice'
import { addGroupExpense } from '@/store/slices/group/groupExpensesSlice'
import { creditCategories, debitCategories } from '../../utils/helper'
import { useParams } from 'next/navigation'
import { fetchGroups } from '@/store/slices/group/groupSlice'

const AddGroupExpenseModal = () => {
  const dispatch = useDispatch()
  const { id: currentGroupId } = useParams()
  const isOpen = useSelector((state) => state.ui.isAddGroupExpenseOpen)
  const groupFromSlice = useSelector((state) => state.groupDetail.group)
  const groups = useSelector((state) => state.groups.list)
  const currentUser = useSelector(state => state.auth.user?._id)
  const [form, setForm] = useState({
    groupId: currentGroupId || '',
    title: '',
    description: '',
    amount: '',
    category: '',
    type: '',
    paymentMethod: '',
    paidBy: currentUser,
    date: new Date(),
    time: new Date().toTimeString().slice(0, 5),
  })
  useEffect(() => {
  if (currentUser && !form.paidBy) {
    setForm(prev => ({ ...prev, paidBy: currentUser }))
  }
}, [currentUser, form.paidBy])

  const [loading, setLoading] = useState(false)

  const handleClose = () => dispatch(closeAddGroupExpense())

  // 🧠 Derived current group
  const currentGroup = groupFromSlice || groups.find(g => g._id === currentGroupId)

  // 🧠 Load group list if needed
  useEffect(() => {
    if (!groupFromSlice && !groups.length && currentGroupId) {
      dispatch(fetchGroups())
    }
  }, [groupFromSlice, groups.length, currentGroupId, dispatch])

  useEffect(() => {
    if (currentGroupId) {
      setForm(prev => ({ ...prev, groupId: currentGroupId }))
    }
  }, [currentGroupId])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    const { title, amount, category, type, paymentMethod, date, time, paidBy, groupId } = form
    if (!title || !amount || !type || !date || !time || !paymentMethod || !category || !paidBy || !groupId) {
      toast.error("Please fill all required fields.")
      return false
    }
    if (title.length < 2) return toast.error("Title must be more than 2 characters.")
    if (isNaN(amount) || Number(amount) <= 0) return toast.error("Amount must be a valid number.")
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) return toast.error("Invalid time format.")
    if (!currentGroup?.members?.some(m => m.user._id === paidBy)) {
      toast.error("Paid By must be a member of the selected group.")
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
        date: form.date.toISOString().split('T')[0],
        time: form.time,
      }

      const res = await fetch(`/api/groups/${form.groupId}/expenses/add-expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success("Group expense added!")
        dispatch(addGroupExpense(data.expense))
        setForm({
          groupId: currentGroupId || '',
          title: '',
          description: '',
          amount: '',
          category: '',
          type: '',
          paymentMethod: '',
          paidBy: currentUser,
          date: new Date(),
          time: new Date().toTimeString().slice(0, 5),
        })
        handleClose()
      } else {
        throw new Error(data?.message || 'Something went wrong.')
      }
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="w-[95vw] max-w-3xl mx-auto p-6 rounded-3xl backdrop-blur-xl bg-transparent border-2 md:mb-10 mb-4">
        <form onSubmit={handleSubmit}>
          <SheetHeader className='py-2 px-0'>
            <SheetTitle className='text-sm text-neutral-500 font-bold'>Add Group Expense</SheetTitle>
            <SheetDescription />
          </SheetHeader>

          <div className="space-y-5 mt-3">
            {/* Title & Description */}
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-base">Title</Label>
              <Input id="title" name="title" className='text-base' value={form.title} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Textarea name="description" className='text-base' value={form.description} onChange={handleChange} />
            </div>

            {/* Group & Amount */}
            <div className="grid grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label htmlFor="amount" className="text-base">Amount</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-base text-muted-foreground">₹</span>
                  <Input id="amount" name="amount" type="number" className="pl-8 text-base" value={form.amount} onChange={handleChange} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-base">Group</Label>
                <Select
                  value={form.groupId}
                  onValueChange={(val) => setForm(prev => ({ ...prev, groupId: val }))}
                >
                  <SelectTrigger className='w-full capitalize'>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g._id} value={g._id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Method & Paid By */}
            <div className="grid grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label className="text-base">Payment Method</Label>
                <Select
                  value={form.paymentMethod}
                  onValueChange={(val) => setForm({ ...form, paymentMethod: val })}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-base">Paid By</Label>
                <Select
                  value={form.paidBy}
                  onValueChange={(val) => setForm({ ...form, paidBy: val })}
                >
                  <SelectTrigger className='w-full capitalize'>
                    <SelectValue placeholder="Select who paid" />
                  </SelectTrigger>
                  <SelectContent>
                    {(currentGroup?.members || []).map(m => (
                      <SelectItem key={m.user._id} value={m.user._id}>
                        {m.user.name || m.user.email}
                        {m.role === 'owner' && ' (Owner)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type & Category */}
            <div className="grid grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label className="text-base">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) => setForm({ ...form, type: val, category: '' })}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
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
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder={form.type ? "Select category" : "Select type first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(form.type === 'debit' ? debitCategories : creditCategories).map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-5">
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
                {loading ? 'Adding...' : 'Add Group Expense'}
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

export default AddGroupExpenseModal
