'use client'

import React, { useEffect, useState } from 'react'
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
import { X } from 'lucide-react'

const ExpenseFilters = () => {
  const dispatch = useDispatch()
  const { filters } = useSelector((state) => state.expenses)

  const [search, setSearch] = useState(filters.search || '')
  const [type, setType] = useState(filters.type || '')
  const [category, setCategory] = useState(filters.category || '')
  const [trashed, setTrashed] = useState(filters.trashed || '')

  useEffect(() => {
    const debounce = setTimeout(() => {
      dispatch(setFilters({ search, type, category, trashed }))
    }, 300)
    return () => clearTimeout(debounce)
  }, [search, type, category, trashed, dispatch])

  const clearFilters = () => {
    setSearch('')
    setType('')
    setCategory('')
    setTrashed(false)
    dispatch(setFilters({ search: '', type: '', category: '', trashed: "false" }))
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
      <Input
        placeholder="Search title or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-[200px]"
      />

      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-full lg:w-[160px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="credit">Credit</SelectItem>
          <SelectItem value="debit">Debit</SelectItem>
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full lg:w-[160px]">
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

      <Select value={trashed} onValueChange={setTrashed} default="false">
        <SelectTrigger className="w-full lg:w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="false">Active</SelectItem>
          <SelectItem value="true">Trashed</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={clearFilters}
        variant="outline"
        className="flex gap-1 items-center text-red-500"
      >
        <X className="w-4 h-4" /> Clear
      </Button>
    </div>
  )
}

export default ExpenseFilters
