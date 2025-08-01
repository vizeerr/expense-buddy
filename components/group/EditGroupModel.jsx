'use client'

import { useEffect, useState } from 'react'
import {
  Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import axios from 'axios'

import { closeGroupEdit } from '@/store/slices/uiSlice'
import { fetchGroupDetails } from '@/store/slices/group/groupDetailSlice'
import { ArrowLeft } from 'lucide-react'

const EditGroupModel = () => {
  const dispatch = useDispatch()
  const open = useSelector(state => state.ui.isEditGroupOpen)
  const group = useSelector(state => state.groupDetail.group)
  const groupId = group?._id

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && group) {
      setName(group.name || '')
      setDescription(group.description || '')
    }
  }, [open, group])

  const handleClose = () => dispatch(closeGroupEdit())

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Group name is required')
      return
    }

    try {
      setLoading(true)
      const res = await axios.put(`/api/groups/${groupId}/edit-group`, {
        name: name.trim(),
        description: description.trim(),
      })

      if (res.data.success) {
        toast.success('Group updated successfully')
        dispatch(fetchGroupDetails(groupId))
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
        className="w-[95vw] max-w-xl mx-auto p-4 rounded-3xl backdrop-blur-xl bg-transparent border-2 md:mb-10 mb-4"
      >
        <form onSubmit={handleSubmit}>
          
          <SheetHeader className='flex flex-row items-center gap-3  px-0 pt-0 pb-2 border-b'>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" type="button">
                <ArrowLeft  className="w-5 h-5" />
              </Button>
            </SheetClose>
            <SheetTitle className='text-sm text-neutral-500 font-bold'>Modify Group Info</SheetTitle>
          </SheetHeader>

          <div className="mt-5 grid gap-3">
            <Label htmlFor="name" className="text-base">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Label htmlFor="description" className="text-base mt-4">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <SheetFooter className="mt-8 p-0">
            <div className="flex flex-wrap gap-4 w-full">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-yellow-950 text-yellow-400"
              >
                {loading ? 'Updating...' : 'Update Group'}
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

export default EditGroupModel
