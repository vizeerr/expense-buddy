'use client'

import { useEffect, useState } from 'react'
import {
  Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle
} from "../ui/sheet"
import { Button } from '../ui/button'
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import toast from 'react-hot-toast'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { closeAddBudget } from '@/store/slices/uiSlice'
import { fetchBudgetSummary } from '@/store/slices/dashboard/budgetSummarySlice'
import { ArrowLeft } from 'lucide-react'

const EditBudgetModel = () => {
  const dispatch = useDispatch()
  const open = useSelector((state) => state.ui.isAddBudgetOpen)
  const budgetData = useSelector((state) => state.budget.data)
  const currentBudget = budgetData?.monthlyBudget || 0

  const [budget, setBudget] = useState(currentBudget)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setBudget(currentBudget)
  }, [open, currentBudget])

  const handleClose = () => dispatch(closeAddBudget())

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (isNaN(budget) || Number(budget) <= 0) {
      toast.error('Please enter a valid budget greater than ₹0.')
      return
    }
    if (Number(budget) > 1000000) {
      toast.error('Budget exceeds maximum allowed limit.')
      return
    }

    try {
      setLoading(true)
      const res = await axios.put('/api/user/update-budget', { budget })
      if (res.data.success) {
        toast.success('Budget updated!')
        dispatch(fetchBudgetSummary())
        handleClose()
      } else {
        toast.error(res.data.message || 'Update failed.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="w-[95vw] max-w-xl mx-auto p-6 rounded-3xl backdrop-blur-xl bg-transparent border-2 md:mb-10 mb-4"
      >
        <form onSubmit={handleSubmit}>

          <SheetHeader className='flex flex-row items-center gap-3  px-0 pt-0 pb-2 border-b'>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" type="button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </SheetClose>
            <SheetTitle className='text-sm text-neutral-500 font-bold'>Update Monthly Budget</SheetTitle>
          </SheetHeader>


          <div className="mt-5 grid gap-3">
            <Label htmlFor="budget" className="text-base">Monthly Budget (₹)</Label>
            <Input
              id="budget"
              type="number"
              min="1"
              max="1000000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="text-base"
              required
            />
          </div>

          <SheetFooter className="mt-8 p-0">
            <div className="flex flex-wrap gap-4 w-full">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-yellow-950 text-yellow-400"
              >
                {loading ? 'Updating...' : 'Update Budget'}
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="outline" className="w-full sm:w-auto text-red-500">
                  Cancel
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default EditBudgetModel
