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
import { ArrowLeft, CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import toast from 'react-hot-toast'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { filterExpenses } from '@/utils/helper'
import { closeEditExpense } from '@/store/slices/uiSlice'
import { creditCategories, debitCategories } from '../../utils/helper'
import { fetchDashboard } from '../../utils/dashboardFetch'
import { expenseSchema } from '@/lib/schemas/ValidationSchema'



const EditExpenseModel = () => {
  const dispatch = useDispatch()
  const { editExpense } = useSelector((state) => state.ui)
  const expenses = useSelector((state) => state.expenses.list)
  const filtered = filterExpenses(expenses, { _id: editExpense.id })
  const existingExpense = filtered[0]
  const [errors, setErrors] = useState({})
  

  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    type: '',
      paymentMethod: '', 
    date: new Date(),
    time: new Date().toTimeString().slice(0, 5)
  })

  useEffect(() => {
    if (existingExpense) {
      const dt = new Date(existingExpense.datetime)
      setForm({
        title: existingExpense.title,
        description: existingExpense.description,
        amount: existingExpense.amount.toString(),
        category: existingExpense.category,
        type: existingExpense.type,
        paymentMethod: existingExpense.paymentMethod, 
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
    const { title, amount, category, type, paymentMethod, date, time } = form
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
    if (!paymentMethod) {
        toast.error("Please select a payment method.")
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


  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
        ...form,
        _id: editExpense.id,
        amount: form.amount.toString(),
        date: form.date.toISOString().split('T')[0],
      }
    const parsed = expenseSchema.safeParse(payload)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      setErrors(fieldErrors)
      toast.error("Please fix errors.")
      return
    }

    setLoading(true)
    try {
      

      const res = await axios.put(`/api/expenses/modify-expense/`, payload)
      if (res.status === 200) {
        toast.success("Expense updated!")
        fetchDashboard(dispatch,{force:true})
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
        className="w-[95vw] max-w-3xl max-h-[95vh] sm:h-auto h-[90vh] mx-auto p-4 rounded-3xl backdrop-blur-lg bg-transparent border-2 md:mb-10 mb-4"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full" >
          <SheetHeader className='flex flex-row items-center gap-3  px-0 pt-0 pb-2 border-b'>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" type="button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </SheetClose>
            <SheetTitle className='text-sm text-neutral-500 font-bold'>Add New Expense</SheetTitle>
          </SheetHeader>

          <div className=" space-y-5 mt-3 overflow-y-auto ">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-base">Title</Label>
              <Input id="title" name="title" className='text-base' value={form.title} onChange={handleChange} required />
              {errors.title && <p className="text-sm text-red-500">{errors.title[0]}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Textarea name="description" className='text-base' value={form.description} onChange={handleChange} />
              {errors.description && <p className="text-sm text-red-500">{errors.description[0]}</p>}

            </div>

             <div className="flex sm:flex-row flex-col sm:items-start gap-5">
               <div className="grid gap-2 w-full">
                  <Label htmlFor="amount" className="text-base">Amount</Label>
                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-3 flex items-center text-base text-muted-foreground">₹</span>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      className="pl-8 text-base w-full"
                      value={form.amount}
                      onChange={handleChange}
                      required
                    />
                    </div>
              {errors.amount && <p className="text-sm text-red-500">{errors.amount[0]}</p>}

                </div>
                <div className="grid gap-2 w-full">
                <Label className="text-base">Payment Method</Label>
                <Select
                  value={form.paymentMethod}
                  onValueChange={(val) => setForm({ ...form, paymentMethod: val })}
                  className="text-base w-full"
                  required
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
              {errors.paymentMethod && <p className="text-sm text-red-500">{errors.paymentMethod[0]}</p>}

              </div>
             </div>
           

            {/* Responsive grid for type, category, date, time */}
            <div className="flex sm:flex-row flex-col sm:items-start gap-5">
              <div className="grid gap-2 w-full">
                <Label className="text-base">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) => setForm({ ...form, type: val, category: '' })}
                  className="text-base w-full"
                  required
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className='w-full'>
                    <SelectItem value="credit">Credited</SelectItem>
                    <SelectItem value="debit">Debited</SelectItem>
                  </SelectContent>
                </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type[0]}</p>}

              </div>
              <div className="grid gap-2 w-full">
                <Label className="text-base">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm({ ...form, category: val })}
                  disabled={!form.type}
                  className="text-base w-full"
                  required
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
              {errors.category && <p className="text-sm text-red-500">{errors.category[0]}</p>}

              </div>

            </div>

            <div className=" flex sm:flex-row flex-col sm:items-start gap-5">
              
              <div className="grid gap-2 w-full">
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
                      required
                    />
                  </PopoverContent>
                </Popover>
              {errors.date && <p className="text-sm text-red-500">{errors.date[0]}</p>}

              </div>

              <div className="grid gap-2 w-full">
                <Label className="text-base">Time</Label>
                <div className="flex items-center gap-2 w-full">
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
              {errors.time && <p className="text-sm text-red-500">{errors.time[0]}</p>}

                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-8 p-0">
            <div className="flex flex-wrap items-center gap-4 w-full">
              <Button type="submit" disabled={loading}  className="w-full hover:bg-green-950 bg-green-900 text-green-300 sm:w-auto">
                {loading ? 'Updating...' : 'Update Expense'}
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

export default EditExpenseModel
