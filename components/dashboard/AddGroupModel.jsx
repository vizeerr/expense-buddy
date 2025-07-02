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
} from '../ui/sheet'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useDispatch, useSelector } from 'react-redux'
import { closeAddGroup } from '@/store/slices/uiSlice'
import { createGroup } from '@/store/slices/groupSlice'
import toast from 'react-hot-toast'

const AddGroupModal = () => {
  const isOpen = useSelector(state => state.ui.isAddGroupOpen)
  const dispatch = useDispatch()

  const [form, setForm] = useState({
    name: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || form.name.length < 2) {
      return toast.error("Group name must be at least 2 characters")
    }

    setLoading(true)
    try {
      await dispatch(createGroup(form)).unwrap()
      toast.success("Group created!")
      dispatch(closeAddGroup())
      setForm({ name: '', description: '' })
    } catch (err) {
      toast.error(err || "Failed to create group")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={() => dispatch(closeAddGroup())}>
      <SheetContent
        side="bottom"
        className="w-[95vw] max-w-2xl mx-auto p-6 rounded-3xl backdrop-blur-xl bg-transparent border-2 mb-10"
      >
        <form onSubmit={handleSubmit}>
          <SheetHeader className="py-2 px-0">
            <SheetTitle className="text-sm text-neutral-500 font-bold">Create New Group</SheetTitle>
            <SheetDescription />
          </SheetHeader>

          <div className="space-y-5 mt-3">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-base">Group Name</Label>
              <Input
                id="name"
                name="name"
                className="text-base"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Textarea
                id="description"
                name="description"
                className="text-base"
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <SheetFooter className="mt-8 p-0">
            <div className="flex flex-wrap items-center gap-4 w-full">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Creating...' : 'Create Group'}
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

export default AddGroupModal
