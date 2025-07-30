'use client'

import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFilters } from '@/store/slices/dashboard/expensesSlice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { X, Calendar as CalendarIcon, SlidersHorizontal, Search } from 'lucide-react'

const ExpenseFilters = () => {
  const dispatch = useDispatch()
  const { filters } = useSelector((state) => state.expenses)

  // 🔍 Search is applied instantly
  const [search, setSearch] = useState(filters.search || '')
  const [open, setOpen] = useState(false)

  // Filters only applied on "Done"
  const [type, setType] = useState(filters.type || '')
  const [category, setCategory] = useState(filters.category || '')
  const [trashed, setTrashed] = useState(filters.trashed || 'false')
  const [paymentMethod, setPaymentMethod] = useState(filters.paymentMethod || '')
  const [fromDate, setFromDate] = useState(filters.fromDate ? new Date(filters.fromDate) : null)
  const [toDate, setToDate] = useState(filters.toDate ? new Date(filters.toDate) : null)

  const applyFilters = () => {
    dispatch(setFilters({
      search,
      type,
      category,
      trashed,
      paymentMethod,
      fromDate: fromDate ? format(fromDate, 'yyyy-MM-dd') : '',
      toDate: toDate ? format(toDate, 'yyyy-MM-dd') : '',
    }))
    setOpen(false)
  }

  const clearFilters = () => {
    setType('')
    setCategory('')
    setTrashed('false')
    setPaymentMethod('')
    setFromDate(null)
    setToDate(null)
    dispatch(setFilters({
      ...filters,
      type: '',
      category: '',
      trashed: 'false',
      paymentMethod: '',
      fromDate: '',
      toDate: '',
    }))
  }

  const renderDatePicker = (label, date, setDate) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'dd MMM yyyy') : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )

  // 🔍 Apply search as you type
  const handleSearch = (e) => {
    const value = e.target.value
    setSearch(value)
    dispatch(setFilters({ ...filters, search: value }))
  }

  return (
    <div className='flex items-center mb-4 gap-0'>
      {/* 🔍 Search Input */}
      <div className="w-xs flex items-center gap-2 ">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search title or description..."
            value={search}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filters Button */}
      <div className=" flex justify-end ">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="icon" className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[82vw] sm:w-[600px] p-4 rounded-xl shadow-md bg-transparent backdrop-blur-xl" align="end">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>

              {renderDatePicker('From Date', fromDate, setFromDate)}
              {renderDatePicker('To Date', toDate, setToDate)}

              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={trashed} onValueChange={setTrashed}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Active</SelectItem>
                  <SelectItem value="true">Trashed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <Button variant="outline" onClick={clearFilters} className="text-red-500 gap-1">
                <X className="w-4 h-4" /> Clear
              </Button>
              <Button onClick={applyFilters}>Done</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default ExpenseFilters
