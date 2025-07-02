'use client'

import React, { useState } from 'react'
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
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import toast from 'react-hot-toast'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { closeAddExpense } from '@/store/slices/uiSlice'
import { addExpense } from '@/store/slices/dashboard/expensesSlice'
import { fetchBalanceSummary } from '@/store/slices/dashboard/balanceSlice'
import { fetchExpensesSummary } from '@/store/slices/dashboard/expensesSummarySlice'
import { fetchBudgetSummary } from '@/store/slices/dashboard/budgetSummarySlice'
import { fetchAnalytics } from '@/store/slices/dashboard/analyticsSlice'
import { creditCategories, debitCategories } from '../../utils/helper'

const AddExpenseModel = () => {
  const isOpen = useSelector((state) => state.ui.isAddExpenseOpen)
  const dispatch = useDispatch()
  const handleClose = () => dispatch(closeAddExpense())

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
    if (!title || !amount || !type || !date || !time) {
      toast.error("Please fill all required fields.")
      return false
    }
    if (!category) {
      toast.error("Please select a category.")
      return false
    }
    if (title.length < 2) {
      toast.error("Title must be more than 2 characters.")
      return false
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount must be a valid number.")
      return false
    }
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!timeRegex.test(time)) {
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
        date: form.date.toISOString().split('T')[0],
        time: form.time,
      }

      const res = await axios.post('/api/expenses/add-expenses', payload)
      if (res.status === 200) {
        toast.success("Expense added!")
        setForm({
          title: '',
          description: '',
          amount: '',
          category: '',
          type: '',
          date: new Date(),
          time: new Date().toTimeString().slice(0, 5),
        })
        dispatch(addExpense(res.data.expenses))
        dispatch(fetchExpensesSummary())
        dispatch(fetchBalanceSummary())
        dispatch(fetchBudgetSummary())
        dispatch(fetchAnalytics())
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
      <SheetContent
        side="bottom"
        className="w-[95vw] max-w-3xl mx-auto p-6 rounded-3xl backdrop-blur-xl bg-transparent border-2 md:mb-10 mb-4"
      >
        <form onSubmit={handleSubmit}>
          <SheetHeader className='py-2 px-0'>
            <SheetTitle className='text-sm text-neutral-500 font-bold'>Add New Expense</SheetTitle>
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
              <Button type="submit" disabled={loading}  className="w-full sm:w-auto">
                {loading ? 'Adding...' : 'Add Expense'}
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

export default AddExpenseModel
