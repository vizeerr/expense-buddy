'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
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
import { ArrowLeft, CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import toast from 'react-hot-toast'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { closeAddExpense } from '@/store/slices/uiSlice'
import { addExpense } from '@/store/slices/dashboard/expensesSlice'
import { creditCategories, debitCategories } from '../../utils/helper'
import { fetchDashboard } from '../../utils/dashboardFetch'
import { expenseSchema } from '../../lib/ValidationSchema'


const AddExpenseModel = () => {
  const isOpen = useSelector((state) => state.ui.isAddExpenseOpen)
  const dispatch = useDispatch()
  const handleClose = () => dispatch(closeAddExpense())
  const [errors, setErrors] = useState({})


  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    type: '',
    paymentMethod: '', 
    date: new Date(),
    time: new Date().toTimeString().slice(0, 5),
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // const validateForm = () => {
  //   const { title, amount, category, type, paymentMethod, date, time } = form
  //   if (!title || !amount || !type || !date || !time) {
  //     toast.error("Please fill all required fields.")
  //     return false
  //   }
  //   if (!category) {
  //     setErrors(...{})
  //     toast.error("Please select a category.")
  //     return false
  //   }
  //   if (title.length < 3) {
  //     toast.error("Title must be more than 3 characters.")
  //     return false
  //   }
  //   if (isNaN(amount) || Number(amount) <= 0) {
  //     toast.error("Amount must be a valid number.")
  //     return false
  //   }
  //   if (!paymentMethod) {
  //       toast.error("Please select a payment method.")
  //       return false
  //     }
  //   const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  //   if (!timeRegex.test(time)) {
  //     toast.error("Invalid time format.")
  //     return false
  //   }
  //   return true
  // }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    
    // if (!validateForm()) return
    const parsed = expenseSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      setErrors(fieldErrors)
      toast.error("Please fix errors.")
      return
    }

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
          paymentMethod:'',
          date: new Date(),
          time: new Date().toTimeString().slice(0, 5),
        })
        dispatch(addExpense(res.data.expenses))
        fetchDashboard(dispatch)
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
        className="w-[95vw] max-w-3xl max-h-[95vh] sm:h-auto h-[95vh] mx-auto p-6 rounded-3xl backdrop-blur-lg bg-transparent border-2 md:mb-10 mb-4"
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
              <Label htmlFor="title" className="text-base">Title 
                <span className="ml-2 text-xs text-gray-500">
                  ({25 - (form.title?.length || 0)} characters left)
                </span>
              </Label>
              <Input id="title" name="title" maxLength={25} className='text-base' value={form.title} onChange={handleChange} required />
              {errors.title && <p className="text-sm text-red-500">{errors.title[0]}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-base">Description
                <span className="ml-2 text-xs text-gray-500">
                  ({200 - (form.description?.length || 0)} characters left)
                </span>
              </Label>
              <Textarea name="description" maxLength={200} className='text-base' value={form.description} onChange={handleChange} />
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
                      min={0} 
                      max={9999999.99} 
                      step="0.01"
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
