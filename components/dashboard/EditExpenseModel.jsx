'use client'

import React, { useEffect, useState } from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
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
  SelectValue
} from "../ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import toast from 'react-hot-toast'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { updateExpense } from '@/store/slices/expensesSlice'
import { filterExpenses } from '@/utils/helper'
import { fetchExpensesSummary } from '@/store/slices/expensesSummarySlice'
import { closeEditExpense } from '@/store/slices/uiSlice'

const EditExpenseModel = () => {
  const dispatch = useDispatch()
  const { editExpense } = useSelector((state) => state.ui)
  const expenses = useSelector((state) => state.expenses.list)
  const filtered = filterExpenses(expenses, { _id: editExpense.id })
  const existingExpense = filtered[0]

  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    type: '',
    date: new Date(),
    time: '12:00'
  })

  useEffect(() => {
    if (existingExpense) {
      const dt = new Date(existingExpense.datetime)
      setForm({
        title: existingExpense.title,
        description: existingExpense.description,
        amount: existingExpense.amount,
        category: existingExpense.category,
        type: existingExpense.type,
        date: dt,
        time: dt.toTimeString().slice(0, 5)
      })
    }
  }, [existingExpense])

  const handleClose = () => dispatch(closeEditExpense())

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

  const [loading, setLoading] = useState(false)

  const debitCategories = [/* same as before */]
  const creditCategories = [/* same as before */]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        _id: editExpense.id,
        amount: form.amount.toString(),
        date: form.date.toISOString().split('T')[0],
      }

      const res = await axios.put(`/api/expenses/modify-expense/`, payload)
      if (res.status === 200) {
        toast.success("Expense updated!")
        dispatch(updateExpense(res.data.expense))
        dispatch(fetchExpensesSummary())
        handleClose()
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to update.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={editExpense.open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="w-[95vw] max-w-3xl mx-auto p-6 rounded-3xl backdrop-blur-xl bg-transparent border-2 mb-10"
      >
        <form onSubmit={handleSubmit}>
          <SheetHeader className="px-0 py-2">
            <SheetTitle className="text-sm text-neutral-500">Modify Expense</SheetTitle>
            <SheetDescription />
          </SheetHeader>

          <div className="space-y-5 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-base">Title</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="text-base"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="text-base"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-base">Amount</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-base text-muted-foreground">₹</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  className="pl-8 text-base"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="grid gap-2">
                <Label className="text-base">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) => setForm({ ...form, type: val, category: '' })}
                >
                  <SelectTrigger className="w-full text-base">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
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
                  <SelectTrigger className="w-full text-base">
                    <SelectValue placeholder={form.type ? "Select category" : "Select type first"} />
                  </SelectTrigger>
                  <SelectContent className="w-full">
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
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
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
            <div className="flex flex-wrap gap-4 w-full">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-green-950 text-green-500">
                {loading ? 'Updating...' : 'Update Expense'}
              </Button>
              <SheetClose asChild>
                <Button variant="outline" className="w-full sm:w-auto text-red-500">Cancel</Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default EditExpenseModel
