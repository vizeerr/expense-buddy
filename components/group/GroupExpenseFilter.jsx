'use client'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setGroupExpenseFilters } from '@/store/slices/group/groupExpensesSlice'
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
import {fetchGroups} from "@/store/slices/group/groupSlice"

const GroupExpenseFilters = ({groupMembers}) => {
  const dispatch = useDispatch()
  const { filters } = useSelector((state) => state.groupExpenses)

  const [search, setSearch] = useState(filters.search || '')
  const [type, setType] = useState(filters.type || '')
  const [category, setCategory] = useState(filters.category || '')
  const [trashed, setTrashed] = useState(filters.trashed || 'false')
  const [paymentMethod, setPaymentMethod] = useState(filters.paymentMethod || '')
  const [paidBy, setPaidBy] = useState(filters.paidBy || '')
  const [addedBy, setAddedBy] = useState(filters.addedBy || '')

  useEffect(() => {
    const debounce = setTimeout(() => {
      dispatch(setGroupExpenseFilters({ search, type, category, trashed, paymentMethod, paidBy, addedBy }))
    }, 300)
    return () => clearTimeout(debounce)
  }, [search, type, category, trashed, paymentMethod, paidBy, addedBy, dispatch])

  const clearFilters = () => {
    setSearch('')
    setType('')
    setCategory('')
    setTrashed('false')
    setPaymentMethod('')
    setPaidBy('')
    setAddedBy('')
    dispatch(setGroupExpenseFilters({
      search: '',
      type: '',
      category: '',
      trashed: 'false',
      paymentMethod: '',
      paidBy: '',
      addedBy: ''
    }))
  }
  useEffect(()=>{
    dispatch(fetchGroups)
  })

  return (
    <div className="flex flex-col lg:flex-row lg:items-end flex-wrap gap-4 mb-6">
      <Input
        placeholder="Search group expense..."
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

      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
        <SelectTrigger className="w-full lg:w-[160px]">
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

      <Select value={paidBy} onValueChange={setPaidBy}>
        <SelectTrigger className="w-full lg:w-[160px] capitalize">
          <SelectValue placeholder="Paid By" />
        </SelectTrigger>
        <SelectContent>

           {groupMembers
            .filter(member => member && member._id && member.name)
            .map(member => (
                <SelectItem  className="capitalize" key={member._id} value={member._id}>
                {member.name}
                </SelectItem>
            ))}

        </SelectContent>
      </Select>

      <Select value={addedBy} onValueChange={setAddedBy}>
        <SelectTrigger className="w-full lg:w-[160px] capitalize">
          <SelectValue placeholder="Created By" />
        </SelectTrigger>
        <SelectContent>
          {groupMembers
            .filter(member => member && member._id && member.name)
            .map(member => (
                <SelectItem  className="capitalize" key={member._id} value={member._id}>
                {member.name}
                </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select value={trashed} onValueChange={setTrashed}>
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

export default GroupExpenseFilters
