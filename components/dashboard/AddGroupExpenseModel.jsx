'use client'

import React, { useState } from 'react'
import {
  Sheet, SheetClose, SheetContent, SheetDescription,
  SheetHeader, SheetFooter, SheetTitle
} from "../ui/sheet"
import {
  Input, Label, Textarea, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue,
  Popover, PopoverContent, PopoverTrigger
} from "../ui"
import { Calendar } from "../ui/calendar"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import toast from 'react-hot-toast'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { closeAddGroupExpense } from '@/store/slices/uiSlice'
import { addGroupExpense } from '@/store/slices/groupExpensesSlice'
import { creditCategories, debitCategories } from '@/utils/helper'

const AddGroupExpenseModel = ({ groupId }) => {
  const isOpen = useSelector((state) => state.ui.isAddGroupExpenseOpen)
  const dispatch = useDispatch()
  const handleClose = () => dispatch(closeAddGroupExpense())

  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    type: '',
    date: new Date(),
    time: new Date().toTimeString().slice(0, 5),
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    const { title, amount, category, type, date, time } = form
    if (!title || !amount || !type || !date || !time || !category) {
      toast.error("All fields are required.")
      return false
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount must be valid")
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
        groupId,
        date: form.date.toISOString().split('T')[0],
        time: form.time
      }

      const res = await axios.post('/api/groups/add-group-expense', payload)
      if (res.status === 200) {
        toast.success("Group expense added!")
        dispatch(addGroupExpense(res.data.expense))
        handleClose()
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to add group expense.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="max-w-3xl mx-auto p-6 mb-10 rounded-3xl border">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Add Group Expense</SheetTitle>
            <SheetDescription>Log a shared expense for this group.</SheetDescription>
          </SheetHeader>

          <div className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input name="title" value={form.title} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea name="description" value={form.description} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input name="amount" type="number" value={form.amount} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val, category: '' })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })} disabled={!form.type}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {(form.type === 'debit' ? debitCategories : creditCategories).map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(form.date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar selected={form.date} onSelect={(date) => setForm({ ...form, date })} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <Input name="time" type="time" value={form.time} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
            <SheetClose asChild>
              <Button variant="outline" className="text-red-500">Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default AddGroupExpenseModel
